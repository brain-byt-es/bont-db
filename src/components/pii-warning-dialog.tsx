"use client"

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
import { AlertTriangle } from "lucide-react"

interface PiiWarningDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  onCancel: () => void
  detectedTypes: string[]
}

export function PiiWarningDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  detectedTypes
}: PiiWarningDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-yellow-600">
            <AlertTriangle className="h-5 w-5" />
            Possible Identification Data Detected
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Please do not store names, addresses, phone numbers, emails, or full birth dates in free-text fields.
            </p>
            {detectedTypes.length > 0 && (
              <div className="rounded-md bg-muted p-3 text-sm">
                <p className="font-medium mb-1">Detected:</p>
                <ul className="list-disc pl-4 text-muted-foreground">
                  {detectedTypes.map((type, i) => (
                    <li key={i}>{type}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              We recommend removing this data to ensure data security and privacy compliance.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Go Back & Edit</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-yellow-600 hover:bg-yellow-700 text-white">
            Save Anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
