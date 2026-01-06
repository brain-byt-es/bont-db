"use client"

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight } from "lucide-react"
import { UpgradeDialog } from "@/components/upgrade-dialog"
import { useState } from "react"

export function ComplianceUpgradeTeaser() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                  <Sparkles className="h-5 w-5" />
                  Upgrade to Pro for Compliance
              </CardTitle>
              <CardDescription>
                  Institutional review and regulatory audits require advanced logging and structured documentation.
              </CardDescription>
          </CardHeader>
          <CardContent>
              <Button className="w-full sm:w-auto" onClick={() => setOpen(true)}>
                  Unlock Pro Features <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
          </CardContent>
      </Card>

      <UpgradeDialog 
        open={open} 
        onOpenChange={setOpen}
        title="Institutional Compliance"
        featureName="Compliance Exports & Logs"
        description="Maintain institutional documentation standards and pass regulatory audits with ease. Pro enables advanced logging and structured export formats."
      />
    </>
  )
}
