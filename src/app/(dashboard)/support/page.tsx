import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, LifeBuoy, BadgeInfo } from "lucide-react"
import { ContactSupportForm } from "@/components/contact-support-form"
import { PricingDialog } from "@/components/pricing-dialog"
import { Badge } from "@/components/ui/badge"
import { FaqSection } from "@/components/support/faq-section"

export default function SupportPage() {
  const rightColumnContent = (
    <>
      <Card className="bg-muted/30 border-primary/20 shadow-md">
          <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>
                  Our team of clinical specialists is ready to help.
              </CardDescription>
          </CardHeader>
          <CardContent>
              <ContactSupportForm />
          </CardContent>
      </Card>

      <div className="grid gap-4">
          <Card className="flex flex-col justify-between border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                      <LifeBuoy className="size-6 text-primary mb-2" />
                      <Badge variant="secondary" className="bg-background">Priority</Badge>
                  </div>
                  <CardTitle className="text-base">Enterprise SLA</CardTitle>
                  <CardDescription>4-hour response window for institutions.</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                  <PricingDialog>
                      <Button variant="outline" size="sm" className="w-full">View Enterprise Plans</Button>
                  </PricingDialog>
              </CardContent>
          </Card>

          <Card className="flex flex-row items-center justify-between p-4">
              <div className="flex items-center gap-3">
                  <div className="bg-muted p-2 rounded-lg"><Mail className="size-4" /></div>
                  <div className="text-sm font-medium">Email us directly</div>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-xs">
                  <a href="mailto:support@injexpro.com">Open App</a>
              </Button>
          </Card>

          <Card className="flex flex-row items-center justify-between p-4 opacity-70">
              <div className="flex items-center gap-3">
                  <div className="bg-muted p-2 rounded-lg"><BadgeInfo className="size-4" /></div>
                  <div className="text-sm font-medium">Clinical Guides</div>
              </div>
              <Badge variant="outline" className="text-[10px]">Coming Soon</Badge>
          </Card>
      </div>
    </>
  )

  return (
    <div className="pt-6 max-w-6xl mx-auto pb-12 px-4 lg:px-6">
      <FaqSection rightColumn={rightColumnContent} />
    </div>
  )
}

