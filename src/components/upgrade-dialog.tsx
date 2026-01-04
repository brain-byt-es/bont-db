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
import { ShieldCheck, Sparkles, ArrowRight, Loader2, CircleCheck, ChevronDown } from "lucide-react"
import { createCheckoutSessionAction } from "@/app/actions/stripe"
import { useTransition, useState } from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

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
  const [isPending, startTransition] = useTransition()
  const [showComparison, setShowComparison] = useState(false)

  const handleUpgrade = () => {
    startTransition(async () => {
        try {
            await createCheckoutSessionAction()
        } catch (e) {
            console.error(e)
        }
    })
  }

  const COMPARISON = [
    { feature: "Treatment Records", basic: "Up to 100", pro: "Unlimited" },
    { feature: "Core Documentation", basic: true, pro: true },
    { feature: "Standard Templates", basic: true, pro: true },
    { feature: "Dose Engine", basic: "Manual Calc", pro: "Clinic Standards" },
    { feature: "Unlock Signed Records", basic: false, pro: true },
    { feature: "Audit Logs (Filter/Export)", basic: false, pro: true },
    { feature: "Clinical Analytics", basic: false, pro: true },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
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

            <Collapsible open={showComparison} onOpenChange={setShowComparison} className="w-full">
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full justify-between text-xs text-muted-foreground hover:bg-transparent">
                        Compare Basic vs. Pro
                        <ChevronDown className={cn("h-3 w-3 transition-transform", showComparison && "rotate-180")} />
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                    <div className="rounded-md border text-[11px]">
                        <div className="grid grid-cols-3 bg-muted/50 p-2 font-bold border-b">
                            <div>Feature</div>
                            <div className="text-center">Basic</div>
                            <div className="text-center text-primary">Pro</div>
                        </div>
                        <div className="divide-y">
                            {COMPARISON.map((row, i) => (
                                <div key={i} className="grid grid-cols-3 p-2 items-center">
                                    <div className="font-medium">{row.feature}</div>
                                    <div className="text-center flex justify-center">
                                        {typeof row.basic === 'boolean' ? (
                                            row.basic ? <CircleCheck className="h-3 w-3 text-muted-foreground" /> : "-"
                                        ) : row.basic}
                                    </div>
                                    <div className="text-center flex justify-center font-bold">
                                        {typeof row.pro === 'boolean' ? (
                                            row.pro ? <CircleCheck className="h-3 w-3 text-primary" /> : "-"
                                        ) : row.pro}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button 
            className="w-full" 
            onClick={handleUpgrade}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Unlock Pro Access <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => onOpenChange(false)} disabled={isPending}>
            Maybe later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}