"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RecentRecordsTable } from "@/components/recent-records-table"
import { Plus } from "lucide-react"
// notFound will be handled in the server component
import { TreatmentDialog } from "@/components/treatment-create-dialog"
import { PatientHeader } from "./patient-header"

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
}

export default function PatientPage({ patient, treatments }: PatientPageProps) {
  const [treatmentDialogOpen, setTreatmentDialogOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4 pt-6">
      <div className="flex items-center justify-between">
        <PatientHeader patient={patient} />
        <TreatmentDialog 
          open={treatmentDialogOpen} 
          onOpenChange={setTreatmentDialogOpen} 
          defaultPatientId={patient.id}
          patients={[patient]}
        >
          <Button>
            <Plus className="mr-2 size-4" />
            New Record
          </Button>
        </TreatmentDialog>
      </div>

      <Tabs defaultValue="records" className="w-full">
        <TabsList>
          <TabsTrigger value="records">Records</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        <TabsContent value="records">
          <Card>
            <CardHeader>
              <CardTitle>Treatment Records</CardTitle>
              <CardDescription>
                History of treatments for this patient.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentRecordsTable records={treatments || []} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Clinical Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{patient.notes || "No notes available."}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}