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

interface TreatmentHeaderProps {
  treatment: { id: string; status: string; patientId: string; encounterLocalDate: Date }
  patientCode: string
  initialData: unknown
}

export function TreatmentHeader({ treatment, patientCode, initialData }: TreatmentHeaderProps) {
  const [, startTransition] = useTransition()
  const [showReopenDialog, setShowReopenDialog] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
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
              await reopenTreatmentAction(treatment.id)
              toast.success("Treatment re-opened")
              router.refresh()
              setShowReopenDialog(false)
              setEditDialogOpen(true) // Open edit dialog immediately after reopen?
              // Wait, router.refresh() is async but doesn't await re-render.
              // If we open dialog immediately, the props passed to it (status) might still be SIGNED until refresh completes.
              // However, since we just called the action, the backend state is DRAFT.
              // The `TreatmentDialog` uses `initialData` which we passed from Server Component.
              // That `initialData` has the OLD status.
              // So `RecordForm` inside might still think it's Signed?
              // Actually, RecordForm logic depends on `status` prop.
              // We need to update the status passed to RecordForm.
              // Since this is a Client Component, we can't easily "update" the server-passed initialData without refresh.
              
              // Alternative: Just refresh and let user click edit again? No, bad UX.
              // Better: Optimistically update status passed to Dialog.
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
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmReopen}>Re-open & Edit</AlertDialogAction>
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
