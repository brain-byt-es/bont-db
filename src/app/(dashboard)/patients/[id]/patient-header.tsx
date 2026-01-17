"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DialogTrigger } from "@/components/ui/dialog"
import { Edit } from "lucide-react"
import { PatientEditDialog } from "@/components/patient-edit-dialog"
import { PatientIdentityRevealer } from "@/components/patient-identity-revealer"
import { useTranslation } from "@/lib/i18n/i18n-context"

interface PatientHeaderProps {
  patient: {
    id: string
    patient_code: string
    birth_year: number
    notes: string | null
    last_activity?: string
  }
}

export function PatientHeader({ patient }: PatientHeaderProps) {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <div className="flex items-start justify-between w-full">
      <div className="space-y-2">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">{patient.patient_code}</h1>
            <p className="text-muted-foreground">
            {t('patients.table.born')}: {patient.birth_year}
            </p>
        </div>
        <PatientIdentityRevealer patientId={patient.id} />
      </div>
      <PatientEditDialog patient={patient} open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Edit className="mr-2 size-4" />
            {t('common.edit')} {t('treatment.labels.patient')}
          </Button>
        </DialogTrigger>
      </PatientEditDialog>
    </div>
  )
}