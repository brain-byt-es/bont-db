/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { QualificationStats } from "@/components/dashboard/qualification-stats"
import { IndicationBreakdown } from "@/components/dashboard/indication-breakdown"
import { GuidelinesChecklist } from "@/components/dashboard/guidelines-checklist"
import { ClinicalActivity } from "@/components/dashboard/clinical-activity"
import { NextActions } from "@/components/dashboard/next-actions"
import { DocumentationQuality } from "@/components/dashboard/documentation-quality"
import { UpsellTeaser } from "@/components/dashboard/upsell-teaser"
import { StatsCard } from "@/components/stats-card"
import { getMuscles } from "@/app/(dashboard)/treatments/actions"
import { format, subDays } from "date-fns"
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// Add type interfaces
interface InjectionAssessment {
  scale: string;
  timepoint: string;
}

export default async function Page() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    return <div>Please log in</div>
  }

  const userId = session.user.entraUserId || 'unknown-user'

  // Since we are migrating away from Supabase Auth, the RLS policies might block access
  // or the data might not exist for the Azure user. 
  // We will attempt to fetch, but gracefully fallback to empty data.
  
  const cookieStore = await cookies()
  // Note: This client is now effectively anonymous or using whatever cookies remain, 
  // but lacks the Supabase Auth context for the new user.
  const supabase = createClient(cookieStore) 

  let treatments: any[] = []
  let followUps: any[] = []
  let spastikInjections: any[] = []
  let musclesList: any[] = []
  let patients: any[] = []

  try {
      const [
        treatmentsResponse, 
        followUpsResponse, 
        spastikInjectionsResponse,
        musclesListResponse,
        patientsResponse
      ] = await Promise.all([
        supabase
          .from('treatments')
          .select('id, treatment_date, indication, patient_id')
          .eq('user_id', userId)
          .order('treatment_date', { ascending: true }),
        supabase
          .from('followups')
          .select('treatment_id, created_at')
          .eq('user_id', userId),
        supabase
          .from('injections')
          .select(`
            id,
            muscle,
            treatments!inner(indication, treatment_date),
            injection_assessments(scale, timepoint)
          `)
          .eq('treatments.indication', 'spastik')
          .eq('user_id', userId),
        getMuscles(),
        supabase
          .from('treatments') 
          .select('patient_id', { count: 'exact', head: false })
          .eq('user_id', userId)
      ])

      treatments = treatmentsResponse.data || []
      followUps = followUpsResponse.data || []
      spastikInjections = spastikInjectionsResponse.data || []
      musclesList = musclesListResponse || []
      patients = patientsResponse.data || []

  } catch (error) {
      console.warn("Error fetching data from Supabase (expected during migration):", error)
      // Fallback to defaults
  }
  
  // Calculate distinct patients
  const patientIds = new Set(patients.map((t: any) => t.patient_id));
  const totalPatientsCount = patientIds.size;


  // --- Processing Data ---

  // 1. Core Counts
  const totalTreatmentsCount = treatments?.length || 0
  const followUpsCount = followUps?.length || 0
  const followUpIds = new Set(followUps?.map((f: any) => f.treatment_id))

  // 2. Indications
  const indications = treatments?.map((t: any) => t.indication) || []
  const distinctIndications = [...new Set(indications)]
  const indicationsCoveredCount = distinctIndications.length
  const spastikDystonieCount = indications.filter((i: any) => i === 'spastik' || i === 'dystonie').length
  
  const indicationCounts: { [key: string]: number } = {}
  indications.forEach((i: any) => {
    indicationCounts[i] = (indicationCounts[i] || 0) + 1
  })
  const indicationBreakdownData = Object.entries(indicationCounts).map(([name, value]) => ({ name, value }))

  // 3. Clinical Activity Trend (Treatments per Month)
  const treatmentsByMonth: { [key: string]: number } = {}
  treatments?.forEach((t: any) => {
    if (t.treatment_date) {
      const date = new Date(t.treatment_date)
      const key = format(date, 'MMM yyyy') // e.g., "Jan 2024"
      treatmentsByMonth[key] = (treatmentsByMonth[key] || 0) + 1
    }
  })
  const trendData = Object.entries(treatmentsByMonth).map(([date, count]) => ({ date, count }))

  // 4. Top Muscles (Spastik)
  const muscleCounts: { [key: string]: number } = {}
  spastikInjections?.forEach((inj: any) => {
    if (inj.muscle) {
      muscleCounts[inj.muscle] = (muscleCounts[inj.muscle] || 0) + 1
    }
  })
  
  const topMuscles = Object.entries(muscleCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id, count]) => {
      const muscleDef = musclesList.find((m: any) => m.id === id)
      return {
        name: muscleDef ? muscleDef.name : id, // Fallback to ID if name not found
        count
      }
    })

  // 5. Documentation Quality
  // Overall Follow-up Rate
  const followUpRate = totalTreatmentsCount ? (followUpsCount / totalTreatmentsCount) * 100 : 0

  // Recent Follow-up Rate (Last 90 Days)
  const ninetyDaysAgo = subDays(new Date(), 90)
  const recentTreatments = treatments?.filter((t: any) => new Date(t.treatment_date) >= ninetyDaysAgo) || []
  const recentFollowUps = recentTreatments.filter((t: any) => followUpIds.has(t.id)).length
  const recentFollowUpRate = recentTreatments.length ? (recentFollowUps / recentTreatments.length) * 100 : 0

  // MAS stats
  let masBaselineCount = 0
  let masPeakCount = 0
  const totalSpastikInjectionsCount = spastikInjections?.length || 0

  if (spastikInjections) {
    spastikInjections.forEach((inj: any) => {
      const assessments = inj.injection_assessments || []
      if (assessments.some((a: InjectionAssessment) => a.scale === 'MAS' && a.timepoint === 'baseline')) masBaselineCount++
      if (assessments.some((a: InjectionAssessment) => a.scale === 'MAS' && a.timepoint === 'peak_effect')) masPeakCount++
    })
  }
  const masBaselineRate = totalSpastikInjectionsCount ? (masBaselineCount / totalSpastikInjectionsCount) * 100 : 0
  const masPeakRate = totalSpastikInjectionsCount ? (masPeakCount / totalSpastikInjectionsCount) * 100 : 0

  // 6. Next Actions
  const actions: { id: string, label: string, count: number, href: string, type: 'warning' | 'info' | 'success' }[] = []

  // Action: Missing Follow-ups (Treatments older than 28 days with no follow-up)
  const twentyEightDaysAgo = subDays(new Date(), 28)
  const overdueFollowUps = treatments?.filter((t: any) => 
    new Date(t.treatment_date) < twentyEightDaysAgo && 
    !followUpIds.has(t.id)
  ).length || 0

  if (overdueFollowUps > 0) {
    actions.push({
      id: 'missing-followups',
      label: 'treatments overdue for follow-up',
      count: overdueFollowUps,
      href: '/treatments?filter=missing-followup', // Hypothetical filter
      type: 'warning'
    })
  }

  // Action: Missing Baseline Assessments (Recent Spastik injections without baseline)
  // Logic: check recent spastik injections for missing baseline
  const missingBaselineCount = spastikInjections?.filter((inj: any) => {
    const assessments = inj.injection_assessments || []
    return !assessments.some((a: InjectionAssessment) => a.scale === 'MAS' && a.timepoint === 'baseline')
  }).length || 0
  
  // Just show general alert if significant number
  if (missingBaselineCount > 0) {
     actions.push({
      id: 'missing-baseline',
      label: 'injections missing MAS baseline',
      count: missingBaselineCount,
      href: '/treatments?indication=spastik',
      type: 'info'
    })
  }

  // Goals
  const goals = {
    totalTreatmentsGoal: 100,
    withFollowUpGoal: 50,
    indicationsCoveredGoal: 2,
    spastikDystonieGoal: 25,
  }
  const enableCompliance = false // Default to false as user metadata is not available from NextAuth session by default easily without mapping

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
            value={totalPatientsCount} 
            subtext="Distinct patients treated"
         />
         <StatsCard 
            title="Total Treatments" 
            value={totalTreatmentsCount} 
            subtext="All records logged"
         />
         <StatsCard 
            title="Follow-up Rate (90d)" 
            value={`${Math.round(recentFollowUpRate)}%`}
            subtext="Treatments in last 3 months"
         />
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 lg:px-6">
        
        {/* Left Column (2/3) - Charts */}
        <div className="lg:col-span-2 space-y-6">
            <ClinicalActivity 
              trendData={trendData} 
              topMuscles={topMuscles} 
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <IndicationBreakdown data={indicationBreakdownData} />
                 {/* Top Muscles could go here if spastik dominates, or Upsell */}
            </div>
        </div>

        {/* Right Column (1/3) - Actions & Readiness */}
        <div className="space-y-6">
            <NextActions actions={actions} />
            <DocumentationQuality 
                followUpRateOverall={followUpRate}
                followUpRateRecent={recentFollowUpRate}
                masBaselineRate={masBaselineRate}
                masPeakRate={masPeakRate}
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
                        totalTreatments={totalTreatmentsCount}
                        totalTreatmentsGoal={goals.totalTreatmentsGoal}
                        withFollowUp={followUpsCount}
                        withFollowUpGoal={goals.withFollowUpGoal}
                        indicationsCovered={indicationsCoveredCount}
                        indicationsCoveredGoal={goals.indicationsCoveredGoal}
                        spastikDystonie={spastikDystonieCount}
                        spastikDystonieGoal={goals.spastikDystonieGoal}
                        showGoals={true}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <GuidelinesChecklist
                            totalTreatments={totalTreatmentsCount}
                            totalTreatmentsGoal={goals.totalTreatmentsGoal}
                            withFollowUp={followUpsCount}
                            withFollowUpGoal={goals.withFollowUpGoal}
                            spastikDystonie={spastikDystonieCount}
                            spastikDystonieGoal={goals.spastikDystonieGoal}
                        />
                         {/* Placeholder for explanation or other content if needed */}
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