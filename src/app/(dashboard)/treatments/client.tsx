"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RecentRecordsTable, TreatmentRecord } from "@/components/recent-records-table"
import { TreatmentDialog } from "@/components/treatment-create-dialog"
import { Plus, Search } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface PatientOption {
  id: string
  patient_code: string
}

interface TreatmentsClientProps {
  initialTreatments: TreatmentRecord[]
  patients: PatientOption[]
}

export function TreatmentsClient({ initialTreatments, patients }: TreatmentsClientProps) {
  const [search, setSearch] = useState("")

  const filteredTreatments = initialTreatments.filter(record => {
    const searchLower = search.toLowerCase()
    return (
      record.patient?.patient_code.toLowerCase().includes(searchLower) ||
      record.indication.toLowerCase().includes(searchLower) ||
      record.treatment_site.toLowerCase().includes(searchLower) ||
      record.product.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="flex flex-col gap-4 pt-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold">Treatments</CardTitle>
            <CardDescription>
              Browse and manage all recorded Botulinum toxin procedures.
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search treatments..."
                  className="pl-8 h-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <TreatmentDialog patients={patients}>
              <Button size="sm">
                <Plus className="mr-2 size-4" />
                New Treatment
              </Button>
            </TreatmentDialog>
          </div>
        </CardHeader>
        <CardContent>
          <RecentRecordsTable records={filteredTreatments} />
        </CardContent>
      </Card>
    </div>
  )
}
