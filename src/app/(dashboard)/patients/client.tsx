"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SubjectsTable, Subject } from "@/components/subjects-table"
import { Plus, Search } from "lucide-react"
import { PatientCreateDialog } from "@/components/patient-create-dialog"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground text-sm">
            Manage your patient database and view their treatment history.
          </p>
        </div>
        <div className="flex w-full items-center gap-2 md:w-auto">
            <div className="relative flex-1 md:w-64 md:flex-none">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search patients..."
                  className="pl-8 bg-background"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <PatientCreateDialog>
                <Button>
                  <Plus className="mr-2 size-4" />
                  New Subject
                </Button>
            </PatientCreateDialog>
        </div>
      </div>
      <Card>
        <CardContent>
          <SubjectsTable subjects={filteredSubjects} />
        </CardContent>
      </Card>
    </div>
  )
}
