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
          <AlertDialogDescription className="text-center pt-2">
            To use InjexPro for clinical data, your organization must accept our Data Processing Agreement (DPA) to ensure compliance with GDPR and professional clinical standards.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-6 space-y-4">
            <div className="rounded-lg border p-4 bg-muted/30 space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Accepting this DPA covers:</p>
                <ul className="text-sm space-y-2">
                    <li className="flex items-start gap-2">
                        <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        <span>Legal basis for processing Special Category Health Data.</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        <span>Technical and Organizational Measures (TOMs).</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        <span>Authorized Subprocessors list.</span>
                    </li>
                </ul>
            </div>
            
            <div className="flex justify-center">
                <Button variant="link" asChild className="text-primary gap-1">
                    <Link href="/legal/dpa" target="_blank">
                        Review Full DPA <ExternalLink className="h-3 w-3" />
                    </Link>
                </Button>
            </div>
        </div>

        <AlertDialogFooter className="flex-col sm:flex-col gap-3">
          <AlertDialogAction 
            onClick={(e) => {
                e.preventDefault()
                handleAccept()
            }}
            className="w-full h-11"
            disabled={isPending}
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Accept DPA for Organization
          </AlertDialogAction>
          <p className="text-[10px] text-center text-muted-foreground">
            By clicking accept, you represent that you have the legal authority to bind the Controller to this agreement.
          </p>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
