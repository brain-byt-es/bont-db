"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Edit, Lock } from "lucide-react"
import { TreatmentDialog } from "@/components/treatment-create-dialog"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { reopenTreatmentAction } from "../status-actions"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface TreatmentHeaderProps {
  treatment: { id: string; status: string; patientId: string; encounterLocalDate: Date }
  patientCode: string
  initialData: unknown
}

export function TreatmentHeader({ treatment, patientCode, initialData }: TreatmentHeaderProps) {
  const [, startTransition] = useTransition()
  const [showReopenDialog, setShowReopenDialog] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [reopenReason, setReopenReason] = useState("")
  const router = useRouter()

  const isSigned = treatment.status === "SIGNED"

  const handleEditClick = () => {
      if (isSigned) {
          setShowReopenDialog(true)
      } else {
          setEditDialogOpen(true)
      }
  }

  const confirmReopen = () => {
      startTransition(async () => {
          try {
              await reopenTreatmentAction(treatment.id, reopenReason)
              toast.success("Treatment re-opened")
              router.refresh()
              setShowReopenDialog(false)
              setEditDialogOpen(true) 
          } catch {
              toast.error("Failed to re-open treatment")
          }
      })
  }

  return (
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/patients/${treatment.patientId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Treatment Details</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>Patient: {patientCode} • {treatment.encounterLocalDate.toLocaleDateString()}</span>
              {isSigned && <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100">Signed</Badge>}
              {treatment.status === "DRAFT" && <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200">Draft</Badge>}
            </div>
          </div>
        </div>

        <AlertDialog open={showReopenDialog} onOpenChange={setShowReopenDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Edit Signed Record?</AlertDialogTitle>
                <AlertDialogDescription>
                    This record is currently finalized. Do you want to re-open it for editing? This action will be logged.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="reason">Reason for re-opening (Required)</Label>
                        <Textarea 
                            id="reason" 
                            value={reopenReason} 
                            onChange={(e) => setReopenReason(e.target.value)} 
                            placeholder="e.g. Correction of dose..." 
                        />
                    </div>
                </div>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmReopen} disabled={!reopenReason.trim()}>Re-open & Edit</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <TreatmentDialog 
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          treatmentId={treatment.id} 
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          initialData={initialData as any} 
          isEditing 
          patients={[{ id: treatment.patientId, patient_code: patientCode }]}
          defaultPatientId={treatment.patientId}
          // Force status to DRAFT if we just reopened it (optimistic)
          // We can add a key to force re-mount if needed
          key={treatment.status} 
          status={isSigned && !showReopenDialog && editDialogOpen ? "DRAFT" : treatment.status} 
        >
          <Button variant="outline" onClick={(e) => { e.preventDefault(); handleEditClick() }}>
            {isSigned ? <Lock className="mr-2 size-4" /> : <Edit className="mr-2 size-4" />}
            {isSigned ? "Unlock & Edit" : "Edit Record"}
          </Button>
        </TreatmentDialog>
      </div>
  )
}
