"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RecentRecordsTable, TreatmentRecord } from "@/components/recent-records-table"
import { TreatmentDialog } from "@/components/treatment-create-dialog"
import { Plus, Search, X } from "lucide-react"
import { IconVaccine } from "@tabler/icons-react"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/ui/empty"

interface PatientOption {
  id: string
  patient_code: string
}

interface TreatmentsClientProps {
  initialTreatments: TreatmentRecord[]
  patients: PatientOption[]
  usageLimitReached?: boolean
  organization?: {
      preferences?: {
          standard_vial_size?: number
          standard_dilution_ml?: number
          enable_compliance_views?: boolean
      } | null
  }
}

export function TreatmentsClient({
  initialTreatments,
  patients,
  usageLimitReached = false,
  organization
}: TreatmentsClientProps) {
  const [search, setSearch] = useState("")
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredTreatments = initialTreatments.filter(record => {
    const searchLower = search.toLowerCase()
    return (
      record.patient?.patient_code.toLowerCase().includes(searchLower) ||
      record.indication.toLowerCase().includes(searchLower) ||
      record.treatment_site.toLowerCase().includes(searchLower) ||
      record.product.toLowerCase().includes(searchLower)
    )
  })

  useEffect(() => {
    if (isSearchExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isSearchExpanded])

  return (
    <div className="flex flex-col gap-4 pt-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Treatments</h1>
          <p className="text-muted-foreground text-sm">
            Browse and manage all recorded Botulinum toxin procedures.
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
                  placeholder="Search treatments..."
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

            <TreatmentDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                patients={patients}
                usageLimitReached={usageLimitReached}
                organization={organization}
            >
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2 size-4" />
                New Treatment
              </Button>
            </TreatmentDialog>
        </div>
      </div>

      {initialTreatments.length === 0 ? (
        <EmptyState 
            title="No treatments recorded"
            description="Start documenting procedures to build your clinical database and unlock research insights."
            icon={IconVaccine}
            action={{
                label: "Log your first treatment",
                onClick: () => setCreateOpen(true),
                icon: Plus
            }}
        />
      ) : (
        <Card>
            <CardContent>
            <RecentRecordsTable records={filteredTreatments} />
            </CardContent>
        </Card>
      )}
    </div>
  )
}
