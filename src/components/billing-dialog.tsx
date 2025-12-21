"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface BillingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BillingDialog({ open, onOpenChange }: BillingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Billing & Plans</DialogTitle>
          <DialogDescription>
            Manage your subscription and billing information.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="grid gap-1">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">Free Plan</span>
                        <Badge variant="secondary">Current</Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">Basic features for personal use</span>
                </div>
                <Button variant="outline" disabled>Current Plan</Button>
            </div>
            
             <div className="rounded-lg border p-4 opacity-75">
                <div className="grid gap-1">
                     <div className="flex items-center gap-2">
                        <span className="font-semibold">Pro Plan</span>
                        <Badge>Coming Soon</Badge>
                    </div>
                     <span className="text-sm text-muted-foreground">$29/month - Advanced analytics and unlimited records</span>
                </div>
                <Button className="mt-4" disabled>Upgrade</Button>
            </div>
            
            <div className="grid gap-2">
                <h4 className="text-sm font-medium">Payment Method</h4>
                <div className="flex items-center gap-4 rounded-md border p-4 text-sm text-muted-foreground">
                    No payment methods added.
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
