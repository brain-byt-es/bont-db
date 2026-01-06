"use client";

import { CircleCheck, Sparkles } from "lucide-react";
import { useTransition } from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createCheckoutSessionAction } from "@/app/actions/stripe";
import { Loader2 } from "lucide-react";

interface PricingFeature {
  text: string;
}

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: string;
  yearlyPrice: string;
  features: PricingFeature[];
  buttonText: string;
  isPro?: boolean;
}

const INJEXPRO_PLANS: PricingPlan[] = [
  {
    id: "basic",
    name: "Basic",
    description: "For individual practitioners",
    monthlyPrice: "Free",
    yearlyPrice: "Free",
    features: [
      { text: "1 User included" },
      { text: "Unlimited clinical documentation" },
      { text: "Smart Dose Engine (Manual)" },
      { text: "Basic Audit Log" },
      { text: "PII Protection Guard" },
    ],
    buttonText: "Current Plan",
  },
  {
    id: "pro",
    name: "Pro",
    description: "For practices that need audit-safe documentation",
    monthlyPrice: "€59",
    yearlyPrice: "€590",
    isPro: true,
    features: [
      { text: "Up to 5 active users" },
      { text: "Smart Defaults & Presets" },
      { text: "Audit-controlled re-opening of signed records" },
      { text: "Advanced Audit (Export)" },
      { text: "Clinical Insights & Analytics" },
      { text: "Team User Management" },
    ],
    buttonText: "Upgrade to Pro",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For organizations that require governed clinical systems",
    monthlyPrice: "Custom",
    yearlyPrice: "Custom",
    features: [
      { text: "Unlimited active users" },
      { text: "EHR / CMS Integrations" },
      { text: "SSO / SCIM Enforcement" },
      { text: "SLA & Priority Support" },
      { text: "Advanced Audit API" },
      { text: "Data Processing Agreements" },
    ],
    buttonText: "Contact Sales",
  },
];

export function PricingTable({ className }: { className?: string }) {
  const [isPending, startTransition] = useTransition();

  const handleUpgrade = () => {
    startTransition(async () => {
      try {
        await createCheckoutSessionAction();
      } catch (e) {
        console.error("Upgrade failed", e);
      }
    });
  };

  const COMPARISON_GRID = [
    { label: "Intended for", basic: "Individuals", pro: "Practices & teams", ent: "Clinics & institutions" },
    { label: "Pricing", basic: "Free", pro: "€59 / org / mo", ent: "Custom" },
    { label: "Users included", basic: "1", pro: "Up to 5", ent: "Unlimited" },
    { label: "Clinical documentation", basic: true, pro: true, ent: true },
    { label: "Smart Dose Engine", basic: "Manual", pro: "Smart Defaults", ent: "Protocol-driven & integrated" },
    { label: "Audit log", basic: "Basic", pro: "Advanced (Export)", ent: "Advanced + API" },
    { label: "EHR / CMS integrations", basic: false, pro: false, ent: true },
    { label: "SSO / SCIM", basic: false, pro: false, ent: true },
    { label: "SLA & Contracts", basic: false, pro: false, ent: true },
  ]

  return (
    <section className={cn("py-12", className)}>
      <div className="container mx-auto px-4">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-12">
          
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl text-balance">
              Built for clinics that need audit safety, integration, and scale.
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto text-balance">
              InjexPro Enterprise is designed for organizations that require system integration, 
              contractual compliance, and operational governance — not just documentation.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {INJEXPRO_PLANS.map((plan) => (
              <Card
                key={plan.id}
                className={cn(
                    "flex flex-col justify-between text-left transition-all border-2",
                    plan.isPro ? "border-primary shadow-xl scale-105 z-10 relative" : "border-border shadow-sm"
                )}
              >
                {plan.isPro && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 tracking-wider">
                        <Sparkles className="size-3" /> RECOMMENDED
                    </div>
                )}
                <CardHeader className="pb-8">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-sm mt-2 min-h-[40px]">
                    {plan.description}
                  </CardDescription>
                  <div className="flex flex-col mt-6">
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold tracking-tight">
                        {plan.monthlyPrice}
                        </span>
                        {plan.id === 'pro' && (
                            <span className="text-sm font-medium text-muted-foreground">
                                / month / org
                            </span>
                        )}
                    </div>
                    {plan.id === 'enterprise' && (
                        <p className="text-xs text-primary font-semibold mt-2">
                            Required for integrations, contracts, and external audits.
                        </p>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-6">
                  <Separator />
                  <ul className="space-y-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm">
                        <CircleCheck className="size-5 text-primary shrink-0" />
                        <span className="leading-snug">{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-8 pb-8">
                  {plan.id === 'enterprise' ? (
                      <Button variant="outline" className="w-full h-12 text-base font-semibold border-primary text-primary hover:bg-primary/5" asChild>
                          <a href="mailto:sales@injexpro.com?subject=Enterprise Inquiry">
                              {plan.buttonText}
                          </a>
                      </Button>
                  ) : (
                    <Button 
                        variant={plan.isPro ? "default" : "outline"} 
                        className="w-full h-12 text-base font-semibold"
                        disabled={plan.id === 'basic' || isPending}
                        onClick={plan.id === 'pro' ? handleUpgrade : undefined}
                    >
                        {isPending && plan.isPro ? <Loader2 className="mr-2 size-5 animate-spin" /> : null}
                        {plan.buttonText}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Comparison Section */}
          <div className="w-full mt-12 space-y-8">
            <div className="text-center">
                <h3 className="text-2xl font-bold">Plan Comparison</h3>
                <p className="text-muted-foreground mt-2 text-sm">Detailed feature breakdown for clinical institutions.</p>
            </div>
            <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
                <div className="grid grid-cols-4 bg-muted/50 p-4 font-bold border-b text-sm md:text-base">
                    <div>Capability</div>
                    <div className="text-center">Basic</div>
                    <div className="text-center">Pro</div>
                    <div className="text-center text-primary">Enterprise</div>
                </div>
                <div className="divide-y">
                    {COMPARISON_GRID.map((row, i) => (
                        <div key={i} className="grid grid-cols-4 p-4 items-center text-sm">
                            <div className="font-medium">{row.label}</div>
                            <div className="text-center flex justify-center text-muted-foreground">
                                {typeof row.basic === 'boolean' ? (
                                    row.basic ? <CircleCheck className="size-4 text-primary/60" /> : "-"
                                ) : row.basic}
                            </div>
                            <div className="text-center flex justify-center font-medium">
                                {typeof row.pro === 'boolean' ? (
                                    row.pro ? <CircleCheck className="size-4 text-primary" /> : "-"
                                ) : row.pro}
                            </div>
                            <div className="text-center flex justify-center font-bold text-primary">
                                {typeof row.ent === 'boolean' ? (
                                    row.ent ? <CircleCheck className="size-5" /> : "-"
                                ) : row.ent}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <p className="text-xs text-center text-muted-foreground">
                Integrations and enterprise security features are only available as part of an Enterprise agreement.
            </p>
          </div>

          {/* Enterprise Narrative Section */}
          <div className="grid md:grid-cols-2 gap-12 w-full pt-12 border-t">
            <div className="space-y-6">
                <h3 className="text-3xl font-bold">Why Enterprise?</h3>
                <p className="text-muted-foreground text-lg">Enterprise customers choose InjexPro because risk and documentation must be contractually governed.</p>
                <div className="space-y-4">
                    <NarrativePoint title="Audit-Proof Documentation" desc="Every clinical action is part of a governed system with full attribution." />
                    <NarrativePoint title="System Integration" desc="Existing EHR systems are integrated, not replaced, eliminating double documentation." />
                    <NarrativePoint title="Governance & Risk" desc="Data handling and access are contractually secured with enterprise-grade SLAs." />
                </div>
            </div>
            <Card className="bg-primary text-primary-foreground p-8 flex flex-col justify-center items-center text-center space-y-6 shadow-2xl">
                <h3 className="text-2xl font-bold">Ready to discuss Enterprise?</h3>
                <ul className="text-left space-y-2 opacity-90 text-sm">
                    <li>• EPIC, KISIM & HL7 Integrations</li>
                    <li>• Security & Compliance Requirements</li>
                    <li>• Large Organization Scale</li>
                </ul>
                <Button size="lg" variant="secondary" className="w-full text-primary font-bold" asChild>
                    <a href="mailto:sales@injexpro.com?subject=Enterprise Inquiry">Contact Sales</a>
                </Button>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

function NarrativePoint({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="space-y-1">
            <h4 className="font-bold text-foreground flex items-center gap-2">
                <CircleCheck className="size-4 text-primary" /> {title}
            </h4>
            <p className="text-muted-foreground text-sm pl-6">{desc}</p>
        </div>
    )
}
