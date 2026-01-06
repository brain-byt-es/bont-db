import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Sparkles } from "lucide-react"
import { PricingDialog } from "@/components/pricing-dialog"

export function TeamUpgradeTeaser() {
  return (
    <Card className="bg-primary/5 border-primary/20 border-dashed">
      <CardContent className="flex flex-col md:flex-row items-center justify-between py-6 px-6 gap-6">
        <div className="flex items-center gap-4 text-center md:text-left">
            <div className="hidden sm:flex rounded-full bg-primary/10 p-3 shrink-0">
                <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
                <h3 className="font-semibold text-base leading-none">Collaborate with your Team</h3>
                <p className="text-sm text-muted-foreground max-w-[500px]">
                    Invite colleagues, share patient records, and manage your clinic together. 
                    Unlock role-based access control and clinic-wide standards.
                </p>
            </div>
        </div>

        <PricingDialog>
            <Button size="sm" className="shrink-0 gap-2 shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Upgrade to Pro
            </Button>
        </PricingDialog>
      </CardContent>
    </Card>
  )
}
