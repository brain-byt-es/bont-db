"use client"

import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PricingTable } from "@/components/pricing-table"
import { ReactNode } from "react"

interface PricingDialogProps {
  children?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function PricingDialog({ children, open, onOpenChange }: PricingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[95vw] lg:max-w-7xl w-full p-0 overflow-hidden border-none bg-transparent shadow-none">
        <div className="bg-background rounded-xl border shadow-2xl overflow-y-auto max-h-[92vh] w-full">
            <PricingTable className="py-10 px-4 md:px-8" />
        </div>
      </DialogContent>
    </Dialog>
  )
}
