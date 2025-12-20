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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold">Patients</CardTitle>
            <CardDescription>
              Manage your patient database and view their treatment history.
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search patients..."
                  className="pl-8 h-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <PatientCreateDialog>
                <Button size="sm">
                  <Plus className="mr-2 size-4" />
                  New Subject
                </Button>
            </PatientCreateDialog>
          </div>
        </CardHeader>
        <CardContent>
          <SubjectsTable subjects={filteredSubjects} />
        </CardContent>
      </Card>
    </div>
  )
}
