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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Treatments</h1>
          <p className="text-muted-foreground text-sm">
            Browse and manage all recorded Botulinum toxin procedures.
          </p>
        </div>
        <div className="flex w-full items-center gap-2 md:w-auto">
            <div className="relative flex-1 md:w-64 md:flex-none">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search treatments..."
                  className="pl-8 bg-background"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <TreatmentDialog patients={patients}>
              <Button>
                <Plus className="mr-2 size-4" />
                New Treatment
              </Button>
            </TreatmentDialog>
        </div>
      </div>
      <Card>
        <CardContent>
          <RecentRecordsTable records={filteredTreatments} />
        </CardContent>
      </Card>
    </div>
  )
}
