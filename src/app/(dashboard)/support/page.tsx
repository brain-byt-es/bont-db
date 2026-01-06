import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, MessageCircle, BookOpen, ExternalLink, LifeBuoy } from "lucide-react"

export default function SupportPage() {
  return (
    <div className="flex flex-col gap-8 pt-6 max-w-4xl mx-auto pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Support & FAQ</h1>
        <p className="text-muted-foreground">
          Find answers to common questions or reach out to our clinical and technical support team.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="mb-2 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="size-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Email Support</CardTitle>
            <CardDescription>Direct line to our experts.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="outline" className="w-full mt-2" asChild>
                <a href="mailto:support@injexpro.com">Contact Us</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="mb-2 w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <BookOpen className="size-5 text-blue-600" />
            </div>
            <CardTitle className="text-lg">Documentation</CardTitle>
            <CardDescription>Guides and best practices.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="outline" className="w-full mt-2" asChild>
                <a href="/legal/disclaimer">Clinical Guides <ExternalLink className="ml-2 size-3" /></a>
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <div className="mb-2 w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <LifeBuoy className="size-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Enterprise SLA</CardTitle>
            <CardDescription>Priority support for institutions.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="default" className="w-full mt-2" asChild>
                <a href="/pricing">View Plans</a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4 mt-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
            <MessageCircle className="size-5 text-primary" />
            Frequently Asked Questions
        </h2>
        
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="px-6 border-b-0">
                    <AccordionTrigger className="hover:no-underline py-4">Is my clinical data secure?</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                        Yes. InjexPro uses industry-standard encryption and physically isolates Protected Health Information (PHI). During onboarding, you choose your data residency (EU or US) to comply with local regulations like GDPR or HIPAA.
                    </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2" className="px-6 border-t border-b-0">
                    <AccordionTrigger className="hover:no-underline py-4">How does seat-based billing work?</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                        On the Pro plan, we charge a flat fee for up to 5 active clinical members. If you need more seats or institutional features like EHR integration, please contact our Enterprise team.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="px-6 border-t border-b-0">
                    <AccordionTrigger className="hover:no-underline py-4">Can I re-open a signed record?</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                        Yes, Pro users can re-open signed records. However, this action is strictly logged in the Audit Trail, requiring a reason for the revision to ensure clinical accountability and compliance.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4" className="px-6 border-t border-b-0">
                    <AccordionTrigger className="hover:no-underline py-4">How do Smart Defaults work?</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                        The Advanced Dose Engine analyzes the patient&apos;s history and automatically suggests dosages and injection sites based on the last successful treatment. This significantly reduces documentation time while maintaining precision.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5" className="px-6 border-t border-b-0">
                    <AccordionTrigger className="hover:no-underline py-4">Do you integrate with EPIC or KISIM?</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                        Full EHR/CMS integration is available as part of our Enterprise tier. We support HL7, FHIR, and custom API interfaces to ensure seamless data flow within your hospital infrastructure.
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
      </div>

      <div className="bg-muted/50 rounded-xl p-8 text-center space-y-4 border border-dashed">
        <h3 className="font-semibold">Still have questions?</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Our team of clinical specialists and engineers is ready to help you optimize your workflow.
        </p>
        <Button asChild>
            <a href="mailto:support@injexpro.com">
                Send us a message
            </a>
        </Button>
      </div>
    </div>
  )
}
