"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RecentRecordsTable, TreatmentRecord } from "@/components/recent-records-table"
import { TreatmentDialog } from "@/components/treatment-create-dialog"
import { Plus, Search } from "lucide-react"

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Treatments</h1>
        <TreatmentDialog patients={patients}>
          <Button>
            <Plus className="mr-2 size-4" />
            New Treatment
          </Button>
        </TreatmentDialog>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search treatments..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
        </div>
      </div>

      <RecentRecordsTable records={filteredTreatments} />
    </div>
  )
}
