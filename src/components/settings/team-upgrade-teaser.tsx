import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Sparkles, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export function TeamUpgradeTeaser() {
  return (
    <Card className="border-dashed bg-muted/30">
      <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-6">
        <div className="rounded-full bg-primary/10 p-4">
          <Users className="h-10 w-10 text-primary" />
        </div>
        
        <div className="space-y-2 max-w-md">
          <CardTitle className="text-2xl">Collaborate with your Team</CardTitle>
          <CardDescription className="text-base">
            You are currently on a single-user plan. Upgrade to Pro to invite colleagues, share patient records, and manage your clinic together.
          </CardDescription>
        </div>

        <div className="grid gap-3 w-full max-w-sm text-left">
            <FeatureItem text="Up to 5 active clinical members" />
            <FeatureItem text="Shared patient & treatment database" />
            <FeatureItem text="Role-based access control" />
            <FeatureItem text="Clinic-wide standards & presets" />
        </div>

        <Button asChild size="lg" className="px-8 shadow-lg shadow-primary/20">
          <Link href="/pricing" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Explore Pro Plan
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function FeatureItem({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>{text}</span>
        </div>
    )
}
