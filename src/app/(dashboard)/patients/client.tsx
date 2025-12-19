"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SubjectsTable, Subject } from "@/components/subjects-table"
import { Plus, Search } from "lucide-react"
import { PatientCreateDialog } from "@/components/patient-create-dialog"

interface PatientsClientProps {
  initialSubjects: Subject[]
}

export function PatientsClient({ initialSubjects }: PatientsClientProps) {
  const [search, setSearch] = useState("")

  const filteredSubjects = initialSubjects.filter(s => 
    s.patient_code.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-4 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Patients</h1>
        <PatientCreateDialog>
            <Button>
              <Plus className="mr-2 size-4" />
              New Subject
            </Button>
        </PatientCreateDialog>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search patients..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
        </div>
      </div>
      <SubjectsTable subjects={filteredSubjects} />
    </div>
  )
}
