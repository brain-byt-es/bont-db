import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, Sparkles } from "lucide-react"
import { UpgradeDialog } from "@/components/upgrade-dialog"

export function UpsellTeaser() {
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
        <UpgradeDialog>
          <Button variant="default" size="sm" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Upgrade to Pro
          </Button>
        </UpgradeDialog>
      </CardContent>
    </Card>
  )
}
