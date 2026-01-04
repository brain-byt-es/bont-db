"use client";

import { CircleCheck, Sparkles } from "lucide-react";
import { useTransition } from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
    description: "Ideal for individual practitioners",
    monthlyPrice: "Free",
    yearlyPrice: "Free",
    features: [
      { text: "Core clinical documentation" },
      { text: "Up to 100 treatment records" },
      { text: "Standard PREMPT templates" },
      { text: "Manual dose calculator" },
      { text: "PII protection guard" },
    ],
    buttonText: "Current Plan",
  },
  {
    id: "pro",
    name: "Pro",
    description: "For professional clinics & teams",
    monthlyPrice: "€59",
    yearlyPrice: "€590",
    isPro: true,
    features: [
      { text: "Unlimited treatment records" },
      { text: "Clinic-wide dosage standards" },
      { text: "Re-open signed encounters" },
      { text: "Advanced Audit Trails & CSV Export" },
      { text: "Outcome trends & dose analytics" },
      { text: "Organization-wide user management" },
    ],
    buttonText: "Upgrade to Pro",
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

  return (
    <section className={cn("py-12", className)}>
      <div className="container px-4">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Choose your level of oversight
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              From simple documentation to institutional-grade clinical management.
            </p>
          </div>
          
          <div className="flex flex-col items-stretch gap-6 md:flex-row mt-8">
            {INJEXPRO_PLANS.map((plan) => (
              <Card
                key={plan.id}
                className={cn(
                    "flex w-full md:w-80 flex-col justify-between text-left transition-all",
                    plan.isPro && "border-primary shadow-md relative"
                )}
              >
                {plan.isPro && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <Sparkles className="size-3" /> RECOMMENDED
                    </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{plan.name}</span>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {plan.description}
                  </p>
                  <div className="flex items-end mt-2">
                    <span className="text-3xl font-bold">
                      {plan.monthlyPrice}
                    </span>
                    {plan.id !== 'basic' && (
                        <span className="text-sm font-medium text-muted-foreground mb-1 ml-1">
                            / per provider / mo
                        </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <Separator className="mb-6" />
                  {plan.id === "pro" && (
                    <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Everything in Basic, plus:
                    </p>
                  )}
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm"
                      >
                        <CircleCheck className="size-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm leading-tight">{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="mt-auto">
                  <Button 
                    variant={plan.isPro ? "default" : "outline"} 
                    className="w-full"
                    disabled={plan.id === 'basic' || isPending}
                    onClick={plan.isPro ? handleUpgrade : undefined}
                  >
                    {isPending && plan.isPro ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                    {plan.buttonText}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
