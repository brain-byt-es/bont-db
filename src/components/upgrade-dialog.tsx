"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Sparkles, ArrowRight } from "lucide-react"

interface UpgradeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  featureName?: string
  children?: React.ReactNode
}

export function UpgradeDialog({ 
  open, 
  onOpenChange,
  title = "Unlock Pro Feature",
  description = "This feature is designed for professional clinics requiring advanced oversight and accountability.",
  featureName = "This action",
  children
}: UpgradeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">{title}</DialogTitle>
          <DialogDescription className="text-center pt-2">
            {featureName} requires the <strong>Pro Plan</strong> for audit and compliance reasons.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
            <div className="flex items-start gap-3 rounded-lg border p-3 bg-muted/30">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
                <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Full Audit Trail</p>
                    <p className="text-xs text-muted-foreground">Every change is tracked and attributed for institutional review.</p>
                </div>
            </div>
            <p className="text-sm text-center text-muted-foreground px-4">
                {description}
            </p>
            {children}
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button className="w-full" onClick={() => window.open('https://injexpro.com/pricing', '_blank')}>
            View Pro Pricing <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => onOpenChange(false)}>
            Maybe later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
