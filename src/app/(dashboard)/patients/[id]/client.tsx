"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RecentRecordsTable } from "@/components/recent-records-table"
import { Plus } from "lucide-react"
import { TreatmentDialog } from "@/components/treatment-create-dialog"
import { PatientHeader } from "./patient-header"
import { PatientTimeline } from "@/components/patient-timeline"
import { OrganizationPreferences } from "@/app/(dashboard)/settings/actions"
import { PatientGoalsHub, Goal } from "@/components/patient-goals-hub"
import { GoalTrendChart } from "@/components/goal-trend-chart"
import Link from "next/link"
import { TrendingUp } from "lucide-react"

interface Patient {
  id: string;
  notes: string | null;
  patient_code: string;
  birth_year: number;
  last_activity?: string;
}

interface Treatment {
  id: string;
  treatment_date: string;
  treatment_site: string;
  indication: string;
  product: string;
  total_units: number;
  status: string;
  patient?: { patient_code: string };
}

interface PatientPageProps {
  patient: Patient
  treatments: Treatment[]
  goals: Goal[]
  organization?: {
    name?: string
    preferences?: OrganizationPreferences | null
  }
}

export default function PatientPage({ patient, treatments, goals, organization }: PatientPageProps) {
  const [treatmentDialogOpen, setTreatmentDialogOpen] = useState(false)

  // Map treatments to replace "Main Clinic" with organization name for better branding
  const displayTreatments = (treatments || []).map(t => ({
    ...t,
    treatment_site: (t.treatment_site === "Main Clinic" || !t.treatment_site) 
        ? (organization?.name || "Clinic") 
        : t.treatment_site
  }))

  return (
    <div className="flex flex-col gap-4 pt-6">
      <div className="flex items-center justify-between">
        <PatientHeader patient={patient} />
        <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
                <Link href={`/patients/${patient.id}/insights`}>
                    <TrendingUp className="mr-2 size-4" />
                    Clinical Insights
                </Link>
            </Button>
            <TreatmentDialog 
              open={treatmentDialogOpen} 
              onOpenChange={setTreatmentDialogOpen} 
              defaultPatientId={patient.id}
              patients={[patient]}
              organization={organization}
            >
              <Button onClick={() => setTreatmentDialogOpen(true)}>
                <Plus className="mr-2 size-4" />
                New Record
              </Button>
            </TreatmentDialog>
        </div>
      </div>

      <Tabs defaultValue={organization?.preferences?.standard_patient_view || "timeline"} className="w-full">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="goals">Goals & GAS</TabsTrigger>
          <TabsTrigger value="records">Records</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        <TabsContent value="timeline" className="pt-4">
            <PatientTimeline treatments={displayTreatments} />
        </TabsContent>
        <TabsContent value="goals" className="pt-4 space-y-6">
            <GoalTrendChart goals={goals} />
            <PatientGoalsHub patientId={patient.id} initialGoals={goals} />
        </TabsContent>
        <TabsContent value="records">
          <Card>
            <CardHeader>
              <CardTitle>Treatment Records</CardTitle>
              <CardDescription>
                History of treatments for this patient.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentRecordsTable records={displayTreatments} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Clinical Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{patient.notes || "No notes available."}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
