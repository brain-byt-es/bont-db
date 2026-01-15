"use client"

import { useState, useEffect } from "react"
import { TreatmentDialog } from "./treatment-create-dialog"
import { getTreatment } from "@/app/(dashboard)/treatments/actions"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Timepoint } from "@/generated/client/enums"
import { InitialFormData } from "./record-form"

interface TreatmentEditDialogProps {
  treatmentId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface InjectionAssessment {
    scale: string
    timepoint: string
    valueText: string
}

export function TreatmentEditDialog({ treatmentId, open, onOpenChange }: TreatmentEditDialogProps) {
  const [initialData, setInitialData] = useState<InitialFormData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<string>("DRAFT")
  const [patientId, setPatientId] = useState<string>("")
  const [patientCode, setPatientCode] = useState<string>("")

  useEffect(() => {
    if (open && treatmentId) {
      const fetchFullData = async () => {
        setIsLoading(true)
        try {
          const treatment = await getTreatment(treatmentId)
          if (treatment) {
            // Helper to find MAS scores
            const getMasScore = (injAssessments: InjectionAssessment[], timepoint: string) => {
                const score = injAssessments?.find((a) => a.scale === 'MAS' && a.timepoint === timepoint)
                return score ? score.valueText : ""
            }

            // Transform data for the form
            const data: InitialFormData = {
              subject_id: treatment.patientId,
              date: treatment.encounterLocalDate,
              location: treatment.treatmentSite,
              category: treatment.indication,
              product_label: treatment.product?.name || '',
              notes: treatment.effectNotes ?? undefined,
              assessments: (treatment.assessments || []).map((a: { id: string, scale: string, timepoint: Timepoint, valueNum: number | null, assessedAt: Date, notes: string | null }) => ({
                id: a.id,
                scale: a.scale,
                timepoint: a.timepoint,
                value: a.valueNum || 0,
                assessed_at: a.assessedAt,
                notes: a.notes || undefined,
              })),
              steps: (treatment.injections || []).map((inj: { id: string, muscleId: string | null, side: string, units: number, injectionAssessments: InjectionAssessment[] }) => ({
                id: inj.id,
                muscle_id: inj.muscleId || '', 
                side: (inj.side === 'L' ? 'Left' : inj.side === 'R' ? 'Right' : inj.side === 'B' ? 'Bilateral' : 'Midline') as "Left" | "Right" | "Bilateral" | "Midline",
                numeric_value: inj.units,
                mas_baseline: getMasScore(inj.injectionAssessments, 'baseline'),
                mas_peak: getMasScore(inj.injectionAssessments, 'peak_effect')
              })),
              targetedGoalIds: treatment.targetedGoals?.map((g: { id: string }) => g.id) || [],
              goalAssessments: treatment.goalAssessments?.map((ga: { goalId: string, score: number, notes: string | null }) => ({
                  goalId: ga.goalId,
                  score: ga.score,
                  notes: ga.notes
              })) || []
            }
            setInitialData(data)
            setStatus(treatment.status)
            setPatientId(treatment.patientId)
            setPatientCode(treatment.patient.systemLabel || "Unknown")
          }
        } catch (error) {
          console.error(error)
          toast.error("Failed to load treatment details")
          onOpenChange(false)
        } finally {
          setIsLoading(false)
        }
      }
      fetchFullData()
    } else if (!open) {
        // Reset when closed
        setInitialData(null)
    }
  }, [open, treatmentId, onOpenChange])

  if (isLoading && !initialData) {
      return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-5xl h-[90vh] flex flex-col items-center justify-center">
                <DialogHeader>
                    <DialogTitle>Loading Treatment...</DialogTitle>
                </DialogHeader>
                <Spinner className="size-8" />
            </DialogContent>
        </Dialog>
      )
  }

  return (
    <TreatmentDialog
      open={open}
      onOpenChange={onOpenChange}
      treatmentId={treatmentId || undefined}
      initialData={initialData || undefined}
      isEditing
      status={status}
      defaultPatientId={patientId}
      patients={patientId ? [{ id: patientId, patient_code: patientCode }] : []}
    />
  )
}