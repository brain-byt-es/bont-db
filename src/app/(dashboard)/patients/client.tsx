"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { SubjectsTable, Subject } from "@/components/subjects-table"
import { Plus, Search, X } from "lucide-react"
import { PatientCreateDialog } from "@/components/patient-create-dialog"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface PatientsClientProps {
  initialSubjects: Subject[]
}

export function PatientsClient({ initialSubjects }: PatientsClientProps) {
  const [search, setSearch] = useState("")
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredSubjects = initialSubjects.filter(s => 
    s.patient_code.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    if (isSearchExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isSearchExpanded])

  return (
    <div className="flex flex-col gap-4 pt-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground text-sm">
            Manage your patient database and view their treatment history.
          </p>
        </div>
        <div className="flex w-full items-center justify-end gap-2 md:w-auto">
            {/* Collapsible Search */}
            <div 
                onClick={() => { if (!isSearchExpanded) setIsSearchExpanded(true) }}
                className={cn(
                    "relative flex items-center transition-all duration-300 ease-in-out h-10 cursor-pointer",
                    isSearchExpanded || search 
                        ? "w-full md:w-64 border rounded-md bg-background px-3" 
                        : "w-10 border-transparent hover:bg-muted rounded-full justify-center"
                )}
            >
                <Search className={cn(
                    "h-4 w-4 text-muted-foreground transition-colors",
                    isSearchExpanded || search ? "shrink-0 mr-2" : ""
                )} />
                
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search patients..."
                  className={cn(
                    "bg-transparent border-none outline-none text-sm p-0 transition-all duration-300",
                    isSearchExpanded || search ? "flex-1 opacity-100 w-full" : "w-0 opacity-0 pointer-events-none"
                  )}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onBlur={() => { if (!search) setIsSearchExpanded(false) }}
                />

                {(isSearchExpanded || search) && search && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); setSearch(""); setIsSearchExpanded(false); }}
                        className="ml-2 text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                )}
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
