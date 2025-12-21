"use client"

import { useTransition, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { updatePatient } from "@/app/(dashboard)/patients/update-action"
import { toast } from "sonner"
import { PiiWarningDialog } from "@/components/pii-warning-dialog"
import { validatePII } from "@/lib/pii-validation"
import { AlertTriangle } from "lucide-react"

export interface PatientEditDialogProps {
  patient: {
    id: string
    patient_code: string
    birth_year: number
    notes: string | null
  }
  open: boolean
  onOpenChange: (open: boolean) => void
  children?: React.ReactNode 
}

export function PatientEditDialog({ patient, open, onOpenChange, children }: PatientEditDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [notesValue, setNotesValue] = useState(patient.notes || "")
  const [showPiiWarning, setShowPiiWarning] = useState(false)
  const [piiDetected, setPiiDetected] = useState<string[]>([])
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null)

  const piiResult = validatePII(notesValue)

  async function processSubmission(formData: FormData) {
    startTransition(async () => {
      try {
        await updatePatient(patient.id, formData)
        onOpenChange(false)
        toast.success("Patient updated successfully")
      } catch {
        toast.error("Failed to update patient")
      }
    })
  }

  const onFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const notes = formData.get("notes") as string
    
    const validation = validatePII(notes)
    
    if (validation.isCritical) {
      setPiiDetected(validation.detected)
      setPendingFormData(formData)
      setShowPiiWarning(true)
      return
    }

    processSubmission(formData)
  }

  const handlePiiConfirm = () => {
    setShowPiiWarning(false)
    if (pendingFormData) {
      processSubmission(pendingFormData)
      setPendingFormData(null)
    }
  }

  return (
    <>
    <PiiWarningDialog 
      open={showPiiWarning} 
      onOpenChange={setShowPiiWarning}
      detectedTypes={piiDetected}
      onConfirm={handlePiiConfirm}
      onCancel={() => setShowPiiWarning(false)}
    />
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Patient</DialogTitle>
          <DialogDescription>
            Update patient details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onFormSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="patient_code" className="text-right">
                Code
              </Label>
              <Input 
                id="patient_code" 
                name="patient_code" 
                defaultValue={patient.patient_code} 
                className="col-span-3" 
                required 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="birth_year" className="text-right">
                Birth Year
              </Label>
              <Input 
                id="birth_year" 
                name="birth_year" 
                type="number" 
                defaultValue={patient.birth_year} 
                className="col-span-3" 
                required 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <div className="col-span-3 space-y-2">
                <Textarea 
                  id="notes" 
                  name="notes" 
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                />
                {piiResult.score > 0 && (
                  <div className="text-xs text-yellow-600 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Possible PII: {piiResult.detected.join(", ")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  )
}
