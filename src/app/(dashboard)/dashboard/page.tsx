import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { QualificationStats } from "@/components/dashboard/qualification-stats"
import { IndicationBreakdown } from "@/components/dashboard/indication-breakdown"
import { GuidelinesChecklist } from "@/components/dashboard/guidelines-checklist"

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    // This should ideally be caught by middleware redirect, but good fallback
    return <div>Please log in</div>
  }

  // Fetch stats
  const { count: totalTreatmentsCount, error: treatmentsError } = await supabase
    .from('treatments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { count: followUpsCount, error: followUpsError } = await supabase
    .from('followups')
    .select('treatment_id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { data: indicationsData, error: indicationsError } = await supabase
    .from('treatments')
    .select('indication')
    .eq('user_id', user.id)

  const distinctIndications = indicationsData ? [...new Set(indicationsData.map(t => t.indication))] : []
  const indicationsCoveredCount = distinctIndications.length;

  const spastikDystonieCount = indicationsData ? indicationsData.filter(
    t => t.indication === 'spastik' || t.indication === 'dystonie'
  ).length : 0;

  // Indication Breakdown data
  const indicationCounts: { [key: string]: number } = {}
  if (indicationsData) {
    indicationsData.forEach(t => {
      indicationCounts[t.indication] = (indicationCounts[t.indication] || 0) + 1
    })
  }
  const indicationBreakdownData = Object.entries(indicationCounts).map(([name, value]) => ({ name, value }))


  // Goals (hardcoded for now)
  const goals = {
    totalTreatmentsGoal: 100,
    withFollowUpGoal: 50,
    indicationsCoveredGoal: 2, // User specified 2 distinct areas
    spastikDystonieGoal: 25,
  }

  const enableCompliance = user.user_metadata?.enable_compliance_views || false

  if (treatmentsError || followUpsError || indicationsError) {
    console.error("Error fetching dashboard data:", treatmentsError || followUpsError || indicationsError)
    return <div>Error loading dashboard data.</div>
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 pt-6">
      <div className="flex flex-col gap-2 px-4 lg:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Qualification Progress Tracker</p>
      </div>
      
      <QualificationStats
        totalTreatments={totalTreatmentsCount || 0}
        totalTreatmentsGoal={goals.totalTreatmentsGoal}
        withFollowUp={followUpsCount || 0}
        withFollowUpGoal={goals.withFollowUpGoal}
        indicationsCovered={indicationsCoveredCount}
        indicationsCoveredGoal={goals.indicationsCoveredGoal}
        spastikDystonie={spastikDystonieCount}
        spastikDystonieGoal={goals.spastikDystonieGoal}
        showGoals={enableCompliance}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 lg:px-6 mt-4">
        <IndicationBreakdown data={indicationBreakdownData} />
        {enableCompliance && (
          <GuidelinesChecklist
            totalTreatments={totalTreatmentsCount || 0}
            totalTreatmentsGoal={goals.totalTreatmentsGoal}
            withFollowUp={followUpsCount || 0}
            withFollowUpGoal={goals.withFollowUpGoal}
            spastikDystonie={spastikDystonieCount}
            spastikDystonieGoal={goals.spastikDystonieGoal}
          />
        )}
      </div>
    </div>
  )
}
