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
import { Building2, ArrowRight, CheckCircle2 } from "lucide-react"

interface EnterpriseUpgradeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
}

export function EnterpriseUpgradeDialog({
  open,
  onOpenChange,
  title = "Built for organizations, not just teams"
}: EnterpriseUpgradeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">{title}</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Enterprise is designed for clinics that need integrations, compliance guarantees, and operational scale.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
            <div className="grid gap-3">
                <FeatureItem text="Unlimited active users" />
                <FeatureItem text="EHR / CMS integrations (EPIC, KISIM)" />
                <FeatureItem text="SLA & contractual compliance" />
                <FeatureItem text="Advanced audit & governance APIs" />
            </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button 
            className="w-full" 
            asChild
          >
            <a href="mailto:sales@injexpro.com?subject=Enterprise Inquiry">
                Contact Enterprise Sales <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => onOpenChange(false)}>
            Maybe later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function FeatureItem({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-3 text-sm">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
            <span className="text-muted-foreground">{text}</span>
        </div>
    )
}
