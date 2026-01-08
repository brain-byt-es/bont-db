import { ActivityTrendCard, TopMusclesCard } from "@/components/dashboard/clinical-activity"
import { NextActions } from "@/components/dashboard/next-actions"
import { DocumentationQuality } from "@/components/dashboard/documentation-quality"
import { UpsellTeaser } from "@/components/dashboard/upsell-teaser"
import { StatsCard } from "@/components/stats-card"
import { Users, Activity, TrendingUp } from "lucide-react"
import { getDashboardData } from "./actions"
import { getOrganizationContext } from "@/lib/auth-context"
import { checkPlan, PLAN_GATES } from "@/lib/permissions"
import { Plan } from "@/generated/client/enums"
import { 
    OutcomeTrendsCard, 
    DoseDistributionCard, 
    CaseMixCard, 
    ProductUtilizationCard 
} from "@/components/dashboard/clinical-insights"
import { DateRangeFilter } from "@/components/dashboard/date-range-filter"
import { CertificationRoadmap } from "@/components/dashboard/certification-roadmap"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const { range } = await searchParams
  const days = range ? parseInt(range) : 90

  const [data, ctx] = await Promise.all([
      getDashboardData(days),
      getOrganizationContext()
  ])

  const userPlan = ctx?.organization.plan as Plan
  const isPro = checkPlan(userPlan, PLAN_GATES.CLINICAL_INSIGHTS)

  // Next Actions Construction
  const actions: { id: string, label: string, count: number, href: string, type: 'warning' | 'info' | 'success' }[] = []

  if (data.overdueFollowUpsCount > 0) {
    actions.push({
      id: 'missing-followups',
      label: 'treatments overdue for follow-up',
      count: data.overdueFollowUpsCount,
      href: '/treatments?filter=missing-followup',
      type: 'warning'
    })
  }

  if (data.missingBaselineCount > 0) {
     actions.push({
      id: 'missing-baseline',
      label: 'injections missing MAS baseline',
      count: data.missingBaselineCount,
      href: '/treatments?indication=spastik',
      type: 'info'
    })
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-6 pt-6 pb-8">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Clinical Activity & Progress</p>
        </div>
        <div className="flex items-center gap-2">
            <DateRangeFilter />
        </div>
      </div>
      
      {/* 1. Overview Row & Next Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4 lg:px-6 items-stretch">
         <StatsCard 
            title="Total Patients" 
            value={data.totalPatientsCount} 
            subtext="Distinct patients treated"
            icon={Users}
            className="h-full"
         />
         <StatsCard 
            title="Total Treatments" 
            value={data.totalTreatmentsCount} 
            subtext={`${range ? 'Last ' + range + ' days' : 'Total records logged'}`}
            icon={Activity}
            className="h-full"
         />
         <StatsCard 
            title="Follow-up Rate" 
            value={`${Math.round(data.followUpRateRecent)}%`}
            subtext={`${range ? 'Last ' + range + ' days' : 'Last 90 days'}`}
            icon={TrendingUp}
            className="h-full"
         />
         <NextActions actions={actions} className="h-full" />
      </div>

      {/* 2. Qualification & Certification Subsection */}
      <div className="px-4 lg:px-6">
        <CertificationRoadmap data={data.certification} />
      </div>

      <div className="px-4 lg:px-6">
        <h2 className="text-lg font-semibold tracking-tight">Clinical Insights</h2>
      </div>

      {!isPro && (
        <div className="px-4 lg:px-6 mb-4">
            <UpsellTeaser />
        </div>
      )}

      {/* 3. Clinical Insights Grid (3x3) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 lg:px-6 items-stretch">
        <OutcomeTrendsCard outcomeTrends={data.outcomeTrends} isPro={isPro} className="h-full" />
        <DoseDistributionCard dosePerIndication={data.dosePerIndication} isPro={isPro} className="h-full" />
        <CaseMixCard data={data.caseMix} isPro={isPro} className="h-full" />

        <ProductUtilizationCard data={data.productUtilization} isPro={isPro} className="h-full" />
        <ActivityTrendCard trendData={data.trendData} isPro={isPro} className="h-full" />
        <TopMusclesCard topMuscles={data.topMuscles} isPro={isPro} className="h-full" />
        
        <div className="lg:col-span-3">
            <DocumentationQuality 
                followUpRateOverall={data.followUpRateOverall}
                followUpRateRecent={data.followUpRateRecent}
                masBaselineRate={data.masBaselineRate}
                masPeakRate={data.masPeakRate}
                className="h-full"
            />
        </div>
      </div>

    </div>
  )
}