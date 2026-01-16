"use client"

import * as React from "react"
import { 
    Accordion, 
    AccordionContent, 
    AccordionItem, 
    AccordionTrigger 
} from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { MessageCircle, Search, FileQuestion } from "lucide-react"

interface FaqItem {
    q: string
    a: string
}

interface FaqCategory {
    category: string
    items: FaqItem[]
}

const FAQ_DATA: FaqCategory[] = [
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

interface FaqSectionProps {
    rightColumn?: React.ReactNode
}

export function FaqSection({ rightColumn }: FaqSectionProps) {
    const [search, setSearch] = React.useState("")

    const filteredFaqs = FAQ_DATA.map(cat => ({
        ...cat,
        items: cat.items.filter(item => 
            item.q.toLowerCase().includes(search.toLowerCase()) || 
            item.a.toLowerCase().includes(search.toLowerCase())
        )
    })).filter(cat => cat.items.length > 0)

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4 text-center items-center py-8">
                <h1 className="text-4xl font-bold tracking-tight">How can we help?</h1>
                <div className="relative w-full max-w-lg">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        className="pl-10 h-12 shadow-sm" 
                        placeholder="Search for answers..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full">
                <div className="lg:col-span-2 space-y-8 min-w-0">
                    {filteredFaqs.length > 0 ? (
                        filteredFaqs.map((cat, idx) => (
                            <div key={idx} className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    {cat.category === "Clinical Workflow" && <MessageCircle className="size-5 text-primary" />}
                                    {cat.category}
                                </h3>
                                <div className="rounded-xl border bg-card shadow-sm overflow-hidden w-full">
                                    <Accordion type="single" collapsible className="w-full">
                                        {cat.items.map((item, i) => (
                                            <AccordionItem key={i} value={`item-${idx}-${i}`} className="px-6 border-b last:border-0">
                                                <AccordionTrigger className="hover:no-underline py-4 text-left font-medium w-full">
                                                    {item.q}
                                                </AccordionTrigger>
                                                <AccordionContent className="text-muted-foreground pb-4 leading-relaxed w-full">
                                                    {item.a}
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                            <FileQuestion className="h-12 w-12 mb-4 opacity-20" />
                            <p className="text-lg font-medium">No results found for &quot;{search}&quot;</p>
                            <p className="text-sm">Try using different keywords or contact support directly.</p>
                        </div>
                    )}
                </div>

                <div className="space-y-6 lg:sticky lg:top-6">
                    {rightColumn}
                </div>
            </div>
        </div>
    )
}
