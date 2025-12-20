"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, Rocket, Sparkles } from "lucide-react"

interface UpgradeDialogProps {
  children: React.ReactNode
  title?: string
  description?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function UpgradeDialog({ 
  children, 
  title = "Upgrade to Pro", 
  description = "Unlock advanced features for research and compliance.",
  open,
  onOpenChange
}: UpgradeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-center p-4 bg-primary/5 rounded-lg border border-primary/10">
             <Rocket className="h-10 w-10 text-primary mb-2" />
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-2">
                <div className="mt-1 bg-green-100 text-green-600 rounded-full p-0.5">
                    <Check className="h-3 w-3" />
                </div>
                <div>
                    <h4 className="font-medium text-sm">Research Exports</h4>
                    <p className="text-xs text-muted-foreground">Flat injection-level data optimized for statistical analysis.</p>
                </div>
            </div>
            <div className="flex items-start gap-2">
                <div className="mt-1 bg-green-100 text-green-600 rounded-full p-0.5">
                    <Check className="h-3 w-3" />
                </div>
                <div>
                    <h4 className="font-medium text-sm">Compliance Exports</h4>
                    <p className="text-xs text-muted-foreground">Formats ready for institutional and board documentation.</p>
                </div>
            </div>
            <div className="flex items-start gap-2">
                <div className="mt-1 bg-green-100 text-green-600 rounded-full p-0.5">
                    <Check className="h-3 w-3" />
                </div>
                <div>
                    <h4 className="font-medium text-sm">Advanced Stats</h4>
                    <p className="text-xs text-muted-foreground">Track research KPIs and quality metrics.</p>
                </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" className="w-full">Get InjexPro Docs Pro</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
