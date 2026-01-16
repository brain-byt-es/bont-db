import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, LifeBuoy, BadgeInfo } from "lucide-react"
import { ContactSupportForm } from "@/components/contact-support-form"
import { PricingDialog } from "@/components/pricing-dialog"
import { Badge } from "@/components/ui/badge"
import { FaqSection } from "@/components/support/faq-section"

export default function SupportPage() {
  return (
    <div className="flex flex-col gap-8 pt-6 max-w-6xl mx-auto pb-12 px-4 lg:px-6">
      
      <FaqSection />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Spacer or future content */}
        <div className="lg:col-span-2">
            {/* FAQ Section is now above the split for better search focus, 
                or we can move it inside the split if preferred. 
                Per spec: Top: Large Search, Middle Left: FAQ, Middle Right: Form.
            */}
        </div>

        {/* Right Column: Contact Form */}
        <div className="space-y-6 lg:-mt-[120px]"> 
            {/* Negative margin to pull form up next to FAQ content on desktop */}
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
        </div>
      </div>
    </div>
  )
}

