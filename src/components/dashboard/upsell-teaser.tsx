"use client"

"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, Sparkles } from "lucide-react"
import { UpgradeDialog } from "@/components/upgrade-dialog"
import { useState } from "react"

export function UpsellTeaser() {
  const [open, setOpen] = useState(false)

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-background border shadow-sm shrink-0">
            <Lock className="h-4 w-4 text-primary" />
          </div>
          <div className="space-y-1 text-left">
            <h3 className="font-semibold text-sm">Unlock Advanced Analytics</h3>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Gain access to detailed outcome trends, dose-response analysis, and research-grade exports.
            </p>
          </div>
        </div>
        
        <Button variant="default" size="sm" className="gap-2 shrink-0 w-full sm:w-auto" onClick={() => setOpen(true)}>
          <Sparkles className="h-3 w-3" />
          Upgrade to Pro
        </Button>

        <UpgradeDialog 
          open={open} 
          onOpenChange={setOpen}
          title="Clinical Analytics & Research"
          featureName="Advanced Analytics"
          description="Unlock deep insights into your clinical activity and patient outcomes. Required for institutional research and quality management."
        />
      </CardContent>
    </Card>
  )
}
