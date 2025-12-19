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

interface TreatmentCreateDialogProps {
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  patients?: { id: string; patient_code: string }[]
  defaultPatientId?: string
}

export function TreatmentCreateDialog({ children, open: controlledOpen, onOpenChange, patients, defaultPatientId }: TreatmentCreateDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [fetchedPatients, setFetchedPatients] = useState<{ id: string; patient_code: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen
  const setIsOpen = isControlled ? onOpenChange : setInternalOpen

  useEffect(() => {
    let mounted = true;
    const fetchPatients = async () => {
      if (isOpen && !patients) {
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Treatment Record</DialogTitle>
          <DialogDescription>
            Enter details for the new procedure.
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
            onCancel={() => setIsOpen && setIsOpen(false)}
            onSuccess={() => setIsOpen && setIsOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
