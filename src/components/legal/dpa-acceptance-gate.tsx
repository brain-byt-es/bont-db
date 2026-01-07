"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { ExternalLink, ShieldCheck, Loader2 } from "lucide-react"
import { useState, useTransition } from "react"
import { acceptDPAAction } from "@/app/actions/legal"
import { toast } from "sonner"
import Link from "next/link"

interface DPAAcceptanceGateProps {
  needed: boolean
}

export function DPAAcceptanceGate({ needed }: DPAAcceptanceGateProps) {
  const [open, setOpen] = useState(needed)
  const [isPending, startTransition] = useTransition()

  const handleAccept = () => {
    startTransition(async () => {
      try {
        const result = await acceptDPAAction()
        if (result.success) {
          toast.success("DPA accepted successfully")
          setOpen(false)
        }
      } catch (error) {
        toast.error("Failed to accept DPA. Please try again.")
        console.error(error)
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <AlertDialogTitle className="text-center text-xl">
            Data Processing Agreement Required
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center pt-2 space-y-2" asChild>
            <div>
              <p>
                To document and process clinical data, InjexPro requires your organization to accept our Data Processing Agreement (DPA).
              </p>
              <p>
                This is a standard requirement under GDPR and ensures that patient data is processed securely, lawfully, and only on your organization&apos;s instructions.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4 space-y-4">
            <div className="rounded-lg border p-4 bg-muted/30 space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Accepting the DPA confirms:</p>
                <ul className="text-sm space-y-2">
                    <li className="flex items-start gap-2">
                        <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        <span>The legal basis for processing special category health data</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        <span>The agreed <Link href="/legal/toms" target="_blank" className="underline decoration-muted-foreground/50 hover:text-foreground">Technical and Organizational Measures (TOMs)</Link></span>
                    </li>
                    <li className="flex items-start gap-2">
                        <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        <span>The use of <Link href="/legal/subprocessors" target="_blank" className="underline decoration-muted-foreground/50 hover:text-foreground">authorized subprocessors</Link> (e.g. hosting, payments)</span>
                    </li>
                </ul>
            </div>
        </div>

        <AlertDialogFooter className="flex-col sm:flex-col gap-3 sm:space-x-0">
          <AlertDialogAction 
            onClick={(e) => {
                e.preventDefault()
                handleAccept()
            }}
            className="w-full h-11"
            disabled={isPending}
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Accept DPA for this Organization
          </AlertDialogAction>
          
          <Button variant="ghost" asChild className="w-full text-muted-foreground hover:text-foreground">
            <Link href="/legal/dpa" target="_blank">
                Review Full DPA
            </Link>
          </Button>

          <p className="text-[10px] text-center text-muted-foreground px-4">
            By clicking “Accept”, you confirm that you are authorized to accept this agreement on behalf of the organization (Controller).
          </p>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}