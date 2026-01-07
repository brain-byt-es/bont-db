"use client"

import { useState, useEffect } from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RecordForm } from "@/components/record-form"
import { getPatients } from "@/app/(dashboard)/patients/actions"
import { Spinner } from "@/components/ui/spinner"
import { ProcedureStep } from "@/components/procedure-steps-editor"

import { UpgradeDialog } from "@/components/upgrade-dialog"

interface InitialFormData {
  location?: string;
  subject_id?: string;
  date?: string | Date;
  category?: string;
  product_label?: string;
  vial_size?: number;
  dilution_ml?: number;
  notes?: string;
  steps?: ProcedureStep[];
}

interface TreatmentDialogProps {
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  patients?: { id: string; patient_code: string }[]
  defaultPatientId?: string
  treatmentId?: string
  initialData?: InitialFormData
  isEditing?: boolean
  status?: string
  userRole?: string
  usageLimitReached?: boolean
  organization?: {
      preferences?: {
          standard_vial_size?: number
          standard_dilution_ml?: number
          enable_compliance_views?: boolean
      } | null
  }
}

export function TreatmentDialog({
  children,
  open: controlledOpen,
  onOpenChange,
  patients,
  defaultPatientId,
  treatmentId,
  initialData,
  isEditing = false,
  status,
  userRole,
  usageLimitReached = false,
  organization
}: TreatmentDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [fetchedPatients, setFetchedPatients] = useState<{ id: string; patient_code: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen
  const setIsOpen = isControlled ? onOpenChange : setInternalOpen

  useEffect(() => {
    let mounted = true;
    const fetchPatients = async () => {
      if (isOpen && (!patients || patients.length === 0)) {
        setIsLoading(true)
        try {
          const data = await getPatients()
          if (mounted) {
            setFetchedPatients(data)
          }
        } finally {
          if (mounted) {
            setIsLoading(false)
          }
        }
      }
    }
    fetchPatients()
    return () => {
      mounted = false;
    }
  }, [isOpen, patients])

  const effectivePatients = patients || fetchedPatients

  const handleOpenChange = (open: boolean) => {
      if (open && usageLimitReached && !isEditing) {
          setShowUpgrade(true)
          return
      }
      if (setIsOpen) setIsOpen(open)
  }

  return (
    <>
        <UpgradeDialog 
            open={showUpgrade} 
            onOpenChange={setShowUpgrade}
            title="Team Expansion Required"
            featureName="Adding more team members"
            description="Your current plan has reached its user limit. Upgrade to Pro or Enterprise to collaborate with more colleagues."
        />
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Treatment Record" : "New Treatment Record"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update details for this procedure." : "Enter details for the new procedure."}
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Spinner className="size-8" />
          </div>
        ) : (
          <RecordForm 
            patients={effectivePatients}
            defaultSubjectId={defaultPatientId}
            initialData={initialData}
            treatmentId={treatmentId}
            isEditing={isEditing}
            onCancel={() => setIsOpen && setIsOpen(false)}
            onSuccess={() => setIsOpen && setIsOpen(false)}
            status={status}
            userRole={userRole}
            organization={organization}
          />
        )}
      </DialogContent>
    </Dialog>
    </>
  )
}