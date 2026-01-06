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
    <Card className="bg-muted/30 border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-6 text-center gap-4">
        <div className="p-3 rounded-full bg-muted">
          <Lock className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">Unlock Advanced Analytics</h3>
          <p className="text-sm text-muted-foreground max-w-[400px] mx-auto">
            Gain access to detailed outcome trends, dose-response analysis, and research-grade exports. 
            Track your patient cohorts (Stroke vs MS) and visualize improvement over time.
          </p>
        </div>
        
        <Button variant="default" size="sm" className="gap-2" onClick={() => setOpen(true)}>
          <Sparkles className="h-4 w-4" />
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
