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
  trendData: { date: string; count: number }[]
  topMuscles: { name: string; count: number }[]
  
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

export async function getDashboardData(): Promise<DashboardData> {
  const { organizationId } = await getOrganizationContext()
  
  // 1. Core Counts & Aggregations
  // We use Promise.all to fetch independent metrics in parallel
  const ninetyDaysAgo = subDays(new Date(), 90)
  const twentyEightDaysAgo = subDays(new Date(), 28)

  const [
    totalPatientsCount,
    totalTreatmentsCount,
    treatmentDates,
    indicationsGrouped,
    spastikMusclesGrouped,
    treatmentsWithFollowupCount,
    recentTreatments, // Need actual rows for complex filtering or separate aggregation
    spastikInjections, // For MAS rates
    overdueFollowUpsCount
  ] = await Promise.all([
    // A: Total Patients
    prisma.patient.count({
      where: { organizationId, status: "ACTIVE" }
    }),

    // B: Total Treatments
    prisma.encounter.count({
      where: { organizationId, status: { not: "VOID" } }
    }),

    // C: Trends (Dates only for aggregation)
    prisma.encounter.findMany({
      where: { organizationId, status: { not: "VOID" } },
      select: { encounterLocalDate: true }
    }),

    // D: Indication Breakdown
    prisma.encounter.groupBy({
      by: ['indication'],
      where: { organizationId, status: { not: "VOID" } },
      _count: { indication: true }
    }),

    // E: Top Muscles (for Spastik indication)
    // Note: We filter Injections where Encounter.indication is 'spastik'
    prisma.injection.groupBy({
      by: ['muscleId'],
      where: { 
        organizationId,
        encounter: {
          indication: 'spastik'
        }
      },
      _count: { muscleId: true },
      orderBy: {
        _count: {
          muscleId: 'desc'
        }
      },
      take: 5
    }),

    // F: Treatments with Follow-ups (All Time)
    prisma.encounter.count({
      where: { 
        organizationId,
        followups: { some: {} } // Has at least one Followup record
      }
    }),

    // G: Recent Treatments (last 90 days) + Followup check
    prisma.encounter.findMany({
      where: { 
        organizationId, 
        encounterLocalDate: { gte: ninetyDaysAgo },
        status: { not: "VOID" }
      },
      select: {
        id: true,
        followups: { select: { id: true } }
      }
    }),

    // H: Spastik Injections + Assessments (for MAS rates)
    prisma.injection.findMany({
      where: {
        organizationId,
        encounter: { indication: 'spastik' }
      },
      select: {
        injectionAssessments: {
          select: { scale: true, timepoint: true }
        }
      }
    }),
    
    // I: Overdue Followups (Treatments > 28 days ago, NO followups)
    prisma.encounter.count({
      where: {
        organizationId,
        status: { not: "VOID" },
        encounterLocalDate: { lt: twentyEightDaysAgo },
        followups: { none: {} }
      }
    })
  ])

  // --- Processing ---

  // 1. Follow-up Rates
  const followUpRateOverall = totalTreatmentsCount > 0 
    ? (treatmentsWithFollowupCount / totalTreatmentsCount) * 100 
    : 0

  const recentTreatmentsCount = recentTreatments.length
  const recentFollowUpsCount = recentTreatments.filter(t => t.followups.length > 0).length
  const followUpRateRecent = recentTreatmentsCount > 0 
    ? (recentFollowUpsCount / recentTreatmentsCount) * 100 
    : 0

  // 2. Trend Data (Monthly)
  const treatmentsByMonth: { [key: string]: number } = {}
  treatmentDates.forEach(t => {
    const key = format(t.encounterLocalDate, 'MMM yyyy')
    treatmentsByMonth[key] = (treatmentsByMonth[key] || 0) + 1
  })
  // Sort properly? For now, we rely on natural insertion order or could sort dates.
  // Ideally, we generate a range of last 6 months and fill gaps.
  const trendData = Object.entries(treatmentsByMonth).map(([date, count]) => ({ date, count }))

  // 3. Indication Breakdown
  const indicationBreakdownData = indicationsGrouped.map(g => ({
    name: g.indication,
    value: g._count.indication
  }))
  
  const indicationsCoveredCount = indicationsGrouped.length
  const spastikDystonieCount = indicationsGrouped
    .filter(g => ['spastik', 'dystonie'].includes(g.indication.toLowerCase()))
    .reduce((sum, g) => sum + g._count.indication, 0)

  // 4. Top Muscles
  // Need to fetch muscle names since groupBy only gives IDs
  const topMuscleIds = spastikMusclesGrouped.filter(g => g.muscleId !== null).map(g => g.muscleId!)
  const muscles = await prisma.muscle.findMany({
    where: { id: { in: topMuscleIds } },
    select: { id: true, name: true }
  })
  
  const topMuscles = spastikMusclesGrouped.map(g => {
    const m = muscles.find(muscle => muscle.id === g.muscleId)
    return {
      name: m?.name || 'Unknown',
      count: g._count.muscleId
    }
  })

  // 5. MAS Rates & Missing Baseline
  let masBaselineCount = 0
  let masPeakCount = 0
  let missingBaselineCount = 0
  
  const totalSpastikInjections = spastikInjections.length

  if (totalSpastikInjections > 0) {
    spastikInjections.forEach(inj => {
      const hasBaseline = inj.injectionAssessments.some(a => a.scale === 'MAS' && a.timepoint === 'baseline')
      const hasPeak = inj.injectionAssessments.some(a => a.scale === 'MAS' && a.timepoint === 'peak_effect')
      
      if (hasBaseline) masBaselineCount++
      else missingBaselineCount++ // Count if missing
      
      if (hasPeak) masPeakCount++
    })
  }
  
  const masBaselineRate = totalSpastikInjections > 0 ? (masBaselineCount / totalSpastikInjections) * 100 : 0
  const masPeakRate = totalSpastikInjections > 0 ? (masPeakCount / totalSpastikInjections) * 100 : 0

  return {
    totalPatientsCount,
    totalTreatmentsCount,
    followUpsCount: treatmentsWithFollowupCount, // This is technically "Treatments with at least one follow-up"
    followUpRateOverall,
    followUpRateRecent,
    recentTreatmentsCount,
    recentFollowUpsCount,
    indicationBreakdownData,
    trendData,
    topMuscles,
    masBaselineRate,
    masPeakRate,
    indicationsCoveredCount,
    spastikDystonieCount,
    overdueFollowUpsCount,
    missingBaselineCount
  }
}
