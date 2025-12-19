"use client"

import { useTransition } from "react"
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

export interface PatientEditDialogProps {
  patient: {
    id: string
    patient_code: string
    birth_year: number
    notes: string | null
  }
  open: boolean
  onOpenChange: (open: boolean) => void
  children?: React.ReactNode // To act as trigger if needed, or controlled externally
}

export function PatientEditDialog({ patient, open, onOpenChange, children }: PatientEditDialogProps) {
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Patient</DialogTitle>
          <DialogDescription>
            Update patient details.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
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
              <Textarea 
                id="notes" 
                name="notes" 
                defaultValue={patient.notes || ""} 
                className="col-span-3" 
              />
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
  )
}
