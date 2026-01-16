import { ActivityTrendCard, TopMusclesCard } from "@/components/dashboard/clinical-activity"
import { NextActions } from "@/components/dashboard/next-actions"
import { DocumentationQuality } from "@/components/dashboard/documentation-quality"
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
    ProductUtilizationCard,
    ClinicalInsightsPreview
} from "@/components/dashboard/clinical-insights"
import { DateRangeFilter } from "@/components/dashboard/date-range-filter"
import { CertificationRoadmap } from "@/components/dashboard/certification-roadmap"
import { getDictionary } from "@/lib/i18n/server"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const { range } = await searchParams
  const days = range ? parseInt(range) : 90

  const [data, ctx, dict] = await Promise.all([
      getDashboardData(days),
      getOrganizationContext(),
      getDictionary()
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
    <div className="@container/main flex flex-1 flex-col gap-8 pt-6 pb-12">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight">{dict.dashboard.title}</h1>
            <p className="text-muted-foreground text-sm">{dict.dashboard.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
            <DateRangeFilter />
        </div>
      </div>
      
      {/* Layer 1: Operational (The Now) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4 lg:px-6 items-stretch">
         <StatsCard 
            title={dict.dashboard.stats.total_patients} 
            value={data.totalPatientsCount} 
            subtext="Distinct patients treated"
            icon={Users}
            className="h-full"
         />
         <StatsCard 
            title={dict.dashboard.stats.total_treatments} 
            value={data.totalTreatmentsCount} 
            subtext={`${range ? 'Last ' + range + ' days' : 'Total records logged'}`}
            icon={Activity}
            className="h-full"
         />
         <StatsCard 
            title={dict.dashboard.stats.follow_up_rate} 
            value={`${Math.round(data.followUpRateRecent)}%`}
            subtext={`${range ? 'Last ' + range + ' days' : 'Last 90 days'}`}
            icon={TrendingUp}
            className="h-full"
         />
         <NextActions actions={actions} className="h-full" />
      </div>

      {/* Layer 2: Progress (The Path) */}
      {ctx?.membership?.showCertificationRoadmap && (
        <div className="px-4 lg:px-6">
          <CertificationRoadmap data={data.certification} />
        </div>
      )}

      {/* Layer 3: Evidence (The Hub) */}
      <div className="px-4 lg:px-6 space-y-6">
        <h2 className="text-lg font-semibold tracking-tight">{dict.dashboard.insights.title}</h2>

        {!isPro ? (
            // Progressive Disclosure for Basic
            <ClinicalInsightsPreview />
        ) : (
            <div className="space-y-6">
                {/* Hero Row: Outcomes & Quality */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <OutcomeTrendsCard outcomeTrends={data.outcomeTrends} isPro={isPro} className="h-full" />
                    </div>
                    <div className="lg:col-span-1">
                        <DocumentationQuality 
                            followUpRateOverall={data.followUpRateOverall}
                            followUpRateRecent={data.followUpRateRecent}
                            masBaselineRate={data.masBaselineRate}
                            masPeakRate={data.masPeakRate}
                            className="h-full"
                        />
                    </div>
                </div>

                {/* Practice Patterns Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ActivityTrendCard trendData={data.trendData} isPro={isPro} className="h-full" />
                    <TopMusclesCard topMuscles={data.topMuscles} isPro={isPro} className="h-full" />
                    <CaseMixCard data={data.caseMix} isPro={isPro} className="h-full" />
                </div>

                {/* Logistics Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DoseDistributionCard dosePerIndication={data.dosePerIndication} isPro={isPro} className="h-full" />
                    <ProductUtilizationCard data={data.productUtilization} isPro={isPro} className="h-full" />
                </div>
            </div>
        )}
      </div>

    </div>
  )
}