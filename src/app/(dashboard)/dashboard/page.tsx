import { QualificationStats } from "@/components/dashboard/qualification-stats"
import { IndicationBreakdown } from "@/components/dashboard/indication-breakdown"
import { GuidelinesChecklist } from "@/components/dashboard/guidelines-checklist"
import { ClinicalActivity } from "@/components/dashboard/clinical-activity"
import { NextActions } from "@/components/dashboard/next-actions"
import { DocumentationQuality } from "@/components/dashboard/documentation-quality"
import { UpsellTeaser } from "@/components/dashboard/upsell-teaser"
import { StatsCard } from "@/components/stats-card"
import { Calendar as CalendarIcon, ChevronDown, Users, Activity, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { getDashboardData } from "./actions"

export default async function Page() {
  const data = await getDashboardData()

  // 6. Next Actions Construction
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

  // Goals (Static for now, could be dynamic per org later)
  const goals = {
    totalTreatmentsGoal: 100,
    withFollowUpGoal: 50,
    indicationsCoveredGoal: 2,
    spastikDystonieGoal: 25,
  }
  
  const enableCompliance = false // Default to false

  return (
    <div className="@container/main flex flex-1 flex-col gap-6 pt-6 pb-8">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Clinical Activity & Progress</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" className="h-9 gap-2 text-sm font-normal">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>Last 90 Days</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
        </div>
      </div>
      
      {/* 1. Overview Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 lg:px-6">
         <StatsCard 
            title="Total Patients" 
            value={data.totalPatientsCount} 
            subtext="Distinct patients treated"
            icon={Users}
         />
         <StatsCard 
            title="Total Treatments" 
            value={data.totalTreatmentsCount} 
            subtext="All records logged"
            icon={Activity}
         />
         <StatsCard 
            title="Follow-up Rate (90d)" 
            value={`${Math.round(data.followUpRateRecent)}%`}
            subtext="Treatments in last 3 months"
            icon={TrendingUp}
         />
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 lg:px-6">
        
        {/* Left Column (2/3) - Charts */}
        <div className="lg:col-span-2 space-y-6">
            <ClinicalActivity 
              trendData={data.trendData} 
              topMuscles={data.topMuscles} 
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <IndicationBreakdown data={data.indicationBreakdownData} />
            </div>
        </div>

        {/* Right Column (1/3) - Actions & Readiness */}
        <div className="space-y-6">
            <NextActions actions={actions} />
            <DocumentationQuality 
                followUpRateOverall={data.followUpRateOverall}
                followUpRateRecent={data.followUpRateRecent}
                masBaselineRate={data.masBaselineRate}
                masPeakRate={data.masPeakRate}
            />
        </div>
      </div>

      {/* Upsell Teaser - Full Width */}
      <div className="px-4 lg:px-6 mt-6">
         <UpsellTeaser />
      </div>

      {/* 3. Qualification & Compliance Subsection */}
      <div className="px-4 lg:px-6 mt-4">
        <Collapsible defaultOpen={enableCompliance} className="space-y-2">
            <div className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm">
                <div className="flex flex-col gap-1">
                    <h3 className="font-semibold leading-none tracking-tight">Qualification & Compliance</h3>
                    <p className="text-sm text-muted-foreground">Certification requirements and guidelines.</p>
                </div>
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-9 p-0">
                        <ChevronDown className="h-4 w-4" />
                        <span className="sr-only">Toggle</span>
                    </Button>
                </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="space-y-4 pt-2">
                <div className="rounded-lg border bg-card p-6 shadow-sm space-y-6">
                    <QualificationStats
                        totalTreatments={data.totalTreatmentsCount}
                        totalTreatmentsGoal={goals.totalTreatmentsGoal}
                        withFollowUp={data.followUpsCount}
                        withFollowUpGoal={goals.withFollowUpGoal}
                        indicationsCovered={data.indicationsCoveredCount}
                        indicationsCoveredGoal={goals.indicationsCoveredGoal}
                        spastikDystonie={data.spastikDystonieCount}
                        spastikDystonieGoal={goals.spastikDystonieGoal}
                        showGoals={true}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <GuidelinesChecklist
                            totalTreatments={data.totalTreatmentsCount}
                            totalTreatmentsGoal={goals.totalTreatmentsGoal}
                            withFollowUp={data.followUpsCount}
                            withFollowUpGoal={goals.withFollowUpGoal}
                            spastikDystonie={data.spastikDystonieCount}
                            spastikDystonieGoal={goals.spastikDystonieGoal}
                        />
                         <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                            <h4 className="font-medium text-foreground mb-2">Why this matters?</h4>
                            <p>To achieve full qualification, you need to demonstrate a broad range of treatments and consistent follow-up documentation. Use the filtered lists to identify gaps.</p>
                         </div>
                    </div>
                </div>
            </CollapsibleContent>
        </Collapsible>
      </div>

    </div>
  )
}
