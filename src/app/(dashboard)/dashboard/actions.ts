"use server"

import { getOrganizationContext } from "@/lib/auth-context"
import prisma from "@/lib/prisma"
import { subDays, format } from "date-fns"

export interface DashboardData {
  totalPatientsCount: number
  totalTreatmentsCount: number
  followUpsCount: number
  followUpRateOverall: number
  followUpRateRecent: number
  recentTreatmentsCount: number
  recentFollowUpsCount: number
  
  // Breakdown
  indicationBreakdownData: { name: string; value: number }[]
  caseMix: { name: string; value: number }[]
  productUtilization: { name: string; value: number }[]
  trendData: { date: string; count: number }[]
  topMuscles: { name: string; count: number }[]
  
  // Insights
  outcomeTrends: { date: string; improvement: number }[]
  dosePerIndication: { name: string; avgUnits: number }[]
  
  // Quality
  masBaselineRate: number
  masPeakRate: number
  
  // Actions
  overdueFollowUpsCount: number
  missingBaselineCount: number

  // Counts for goals
  indicationsCoveredCount: number
  spastikDystonieCount: number
}

export async function getDashboardData(days: number = 90): Promise<DashboardData> {
  const ctx = await getOrganizationContext()
  if (!ctx) throw new Error("No organization context")
  const { organizationId } = ctx
  
  // 1. Core Counts & Aggregations
  const startDate = subDays(new Date(), days)
  const twentyEightDaysAgo = subDays(new Date(), 28)

  const [
    totalPatientsCount,
    totalTreatmentsCount,
    treatmentDataRaw,
    indicationsGrouped,
    productsGrouped,
    spastikMusclesGrouped,
    treatmentsWithFollowupCount,
    recentTreatments,
    allInjectionsWithAssessments,
    overdueFollowUpsCount
  ] = await Promise.all([
    prisma.patient.count({ where: { organizationId, status: "ACTIVE" } }),
    prisma.encounter.count({ 
      where: { 
        organizationId, 
        status: { not: "VOID" },
        encounterLocalDate: { gte: startDate }
      } 
    }),
    prisma.encounter.findMany({
      where: { 
        organizationId, 
        status: { not: "VOID" },
        encounterLocalDate: { gte: startDate }
      },
      select: { encounterLocalDate: true, indication: true, totalUnits: true }
    }),
    prisma.encounter.groupBy({
      by: ['indication'],
      where: { 
        organizationId, 
        status: { not: "VOID" },
        encounterLocalDate: { gte: startDate }
      },
      _count: { indication: true },
      _avg: { totalUnits: true }
    }),
    prisma.encounter.groupBy({
      by: ['productId'],
      where: { 
        organizationId, 
        status: { not: "VOID" },
        encounterLocalDate: { gte: startDate },
        productId: { not: null }
      },
      _count: { id: true }
    }),
    prisma.injection.groupBy({
      by: ['muscleId'],
      where: { 
        organizationId, 
        encounter: { 
          indication: 'spastik',
          encounterLocalDate: { gte: startDate }
        } 
      },
      _count: { muscleId: true },
      orderBy: { _count: { muscleId: 'desc' } },
      take: 5
    }),
    prisma.encounter.count({ 
      where: { 
        organizationId, 
        followups: { some: {} },
        encounterLocalDate: { gte: startDate }
      } 
    }),
    // Keep 90d for the rate calculation if specified or use the global filter
    prisma.encounter.findMany({
      where: { 
        organizationId, 
        encounterLocalDate: { gte: startDate }, 
        status: { not: "VOID" } 
      },
      select: { id: true, followups: { select: { id: true } } }
    }),
    prisma.injection.findMany({
      where: { 
        organizationId, 
        encounter: { 
          status: { not: "VOID" },
          encounterLocalDate: { gte: startDate }
        } 
      },
      select: {
        encounter: { select: { encounterLocalDate: true } },
        injectionAssessments: { select: { scale: true, timepoint: true, valueNum: true } }
      }
    }),
    prisma.encounter.count({
      where: { 
        organizationId, 
        status: { not: "VOID" }, 
        encounterLocalDate: { lt: twentyEightDaysAgo, gte: startDate }, 
        followups: { none: {} } 
      }
    })
  ])

  // --- Processing ---

  // 1. Trend Data & Dose Analytics
  const treatmentsByMonth: { [key: string]: number } = {}
  treatmentDataRaw.forEach(t => {
    const key = format(t.encounterLocalDate, 'MMM yyyy')
    treatmentsByMonth[key] = (treatmentsByMonth[key] || 0) + 1
  })
  const trendData = Object.entries(treatmentsByMonth).map(([date, count]) => ({ date, count }))

  const dosePerIndication = indicationsGrouped.map(g => ({
    name: g.indication,
    avgUnits: g._avg.totalUnits?.toNumber() || 0
  }))

  // 2. Outcome Trends (MAS Improvement)
  const improvementByMonth: { [key: string]: { total: number, count: number } } = {}
  allInjectionsWithAssessments.forEach(inj => {
    const baseline = inj.injectionAssessments.find(a => a.scale === 'MAS' && a.timepoint === 'baseline')?.valueNum?.toNumber()
    const peak = inj.injectionAssessments.find(a => a.scale === 'MAS' && a.timepoint === 'peak_effect')?.valueNum?.toNumber()
    
    if (baseline !== undefined && peak !== undefined) {
      const diff = baseline - peak // Positive means improvement
      const key = format(inj.encounter.encounterLocalDate, 'MMM yyyy')
      if (!improvementByMonth[key]) improvementByMonth[key] = { total: 0, count: 0 }
      improvementByMonth[key].total += diff
      improvementByMonth[key].count += 1
    }
  })
  const outcomeTrends = Object.entries(improvementByMonth).map(([date, val]) => ({
    date,
    improvement: parseFloat((val.total / val.count).toFixed(2))
  }))

  // 3. Basics Mapping
  const followUpRateOverall = totalTreatmentsCount > 0 ? (treatmentsWithFollowupCount / totalTreatmentsCount) * 100 : 0
  const followUpRateRecent = recentTreatments.length > 0 ? (recentTreatments.filter(t => t.followups.length > 0).length / recentTreatments.length) * 100 : 0
  
  const indicationBreakdownData = indicationsGrouped.map(g => ({ name: g.indication, value: g._count.indication }))
  
  // Case Mix: Preferred Specific Diagnosis, fallback to high-level indication
  // For now let's just use high-level indications or top diagnoses
  const caseMix = indicationsGrouped.map(g => ({ name: g.indication, value: g._count.indication }))

  // Product Utilization
  const productIds = productsGrouped.map(p => p.productId!)
  const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true }
  })
  const productUtilization = productsGrouped.map(g => ({
      name: products.find(p => p.id === g.productId)?.name || 'N/A',
      value: g._count.id
  }))

  const indicationsCoveredCount = indicationsGrouped.length
  const spastikDystonieCount = indicationsGrouped
    .filter(g => ['spastik', 'dystonie', 'kopfschmerz'].includes(g.indication.toLowerCase()))
    .reduce((sum, g) => sum + g._count.indication, 0)

  // 4. Top Muscles
  const topMuscleIds = spastikMusclesGrouped.filter(g => g.muscleId !== null).map(g => g.muscleId!)
  const muscles = await prisma.muscle.findMany({
    where: { id: { in: topMuscleIds } },
    select: { id: true, name: true }
  })
  const topMuscles = spastikMusclesGrouped.map(g => ({
    name: muscles.find(m => m.id === g.muscleId)?.name || 'Unknown',
    count: g._count.muscleId
  }))

  // 5. MAS Rates & Missing Baseline
  let masBaselineCount = 0
  let masPeakCount = 0
  let missingBaselineCount = 0
  allInjectionsWithAssessments.forEach(inj => {
    const hasBaseline = inj.injectionAssessments.some(a => a.scale === 'MAS' && a.timepoint === 'baseline')
    if (hasBaseline) masBaselineCount++
    else missingBaselineCount++
    if (inj.injectionAssessments.some(a => a.scale === 'MAS' && a.timepoint === 'peak_effect')) masPeakCount++
  })
  
  const totalSpastikInjections = allInjectionsWithAssessments.length
  const masBaselineRate = totalSpastikInjections > 0 ? (masBaselineCount / totalSpastikInjections) * 100 : 0
  const masPeakRate = totalSpastikInjections > 0 ? (masPeakCount / totalSpastikInjections) * 100 : 0

  return {
    totalPatientsCount,
    totalTreatmentsCount,
    followUpsCount: treatmentsWithFollowupCount,
    followUpRateOverall,
    followUpRateRecent,
    recentTreatmentsCount: recentTreatments.length,
    recentFollowUpsCount: recentTreatments.filter(t => t.followups.length > 0).length,
    indicationBreakdownData,
    caseMix,
    productUtilization,
    trendData,
    topMuscles,
    outcomeTrends,
    dosePerIndication,
    masBaselineRate,
    masPeakRate,
    indicationsCoveredCount,
    spastikDystonieCount,
    overdueFollowUpsCount,
    missingBaselineCount
  }
}
