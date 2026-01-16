import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, MessageCircle, Search, LifeBuoy, BadgeInfo } from "lucide-react"
import { ContactSupportForm } from "@/components/contact-support-form"
import { PricingDialog } from "@/components/pricing-dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const FAQ_CATEGORIES = [
    {
        category: "Clinical Workflow",
        items: [
            { q: "Can I re-open a signed record?", a: "Yes, Pro users can re-open signed records. However, this action is strictly logged in the Audit Trail, requiring a reason for the revision to ensure clinical accountability and compliance." },
            { q: "How do Smart Defaults work?", a: "The Dose Reference Assistant provides historical context by analyzing the patient's past procedures. It displays dosages and injection sites from the last successful treatment as a reference point." }
        ]
    },
    {
        category: "Billing & Privacy",
        items: [
            { q: "Is my clinical data secure?", a: "Yes. InjexPro uses industry-standard encryption and physically isolates Protected Health Information (PHI). During onboarding, you choose your data residency (EU or US) to comply with local regulations like GDPR or HIPAA." },
            { q: "How does seat-based billing work?", a: "On the Pro plan, we charge a flat fee for up to 5 active clinical members. If you need more seats or institutional features like EHR integration, please contact our Enterprise team." }
        ]
    },
    {
        category: "Account & Access",
        items: [
            { q: "Do you integrate with EPIC or KISIM?", a: "Full EHR/CMS integration is available as part of our Enterprise tier. We support HL7, FHIR, and custom API interfaces to ensure seamless data flow within your hospital infrastructure." }
        ]
    }
]

export default function SupportPage() {
  return (
    <div className="flex flex-col gap-8 pt-6 max-w-6xl mx-auto pb-12 px-4 lg:px-6">
      <div className="flex flex-col gap-4 text-center items-center py-8">
        <h1 className="text-4xl font-bold tracking-tight">How can we help?</h1>
        <div className="relative w-full max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-10 h-12" placeholder="Search for answers..." />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: FAQ */}
        <div className="lg:col-span-2 space-y-8">
            {FAQ_CATEGORIES.map((cat, idx) => (
                <div key={idx} className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        {cat.category === "Clinical Workflow" && <MessageCircle className="size-5 text-primary" />}
                        {cat.category}
                    </h3>
                    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                        <Accordion type="single" collapsible className="w-full">
                            {cat.items.map((item, i) => (
                                <AccordionItem key={i} value={`item-${idx}-${i}`} className="px-6 border-b last:border-0">
                                    <AccordionTrigger className="hover:no-underline py-4 text-left">{item.q}</AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground pb-4">
                                        {item.a}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            ))}
        </div>

        {/* Right Column: Contact Form */}
        <div className="space-y-6">
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

