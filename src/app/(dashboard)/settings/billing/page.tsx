import { getOrganizationContext } from "@/lib/auth-context"
import { getEffectivePlan, checkPlan, PLAN_SEAT_LIMITS } from "@/lib/permissions"
import { Plan, SubscriptionStatus } from "@/generated/client/enums"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CreditCard, Users, Info, AlertTriangle, ExternalLink, Mail } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { calculateBillableSeats } from "@/lib/stripe-billing"
import { createCustomerPortalAction } from "@/app/actions/stripe"
import { PricingDialog } from "@/components/pricing-dialog"

export default async function BillingSettingsPage() {
    const ctx = await getOrganizationContext()
    if (!ctx) redirect("/onboarding")

    const userPlan = getEffectivePlan(ctx.organization)
    const isPro = checkPlan(userPlan, Plan.PRO)
    const isEnterprise = userPlan === Plan.ENTERPRISE
    const isOverrideActive = !!(ctx.organization.planOverride || (ctx.organization.proUntil && new Date(ctx.organization.proUntil) > new Date()))
    
    const seatCount = await calculateBillableSeats(ctx.organizationId)
    const seatLimit = PLAN_SEAT_LIMITS[userPlan]
    const subStatus = ctx.organization.subscriptionStatus
    const periodEnd = ctx.organization.stripeCurrentPeriodEnd

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Billing & Plan</h3>
                <p className="text-sm text-muted-foreground">Manage your subscription and usage limits.</p>
            </div>

            <Card className={cn(isPro ? "border-primary/20 bg-primary/5" : "")}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Subscription Plan
                            </CardTitle>
                            <CardDescription>
                                Manage your billing and seats.
                            </CardDescription>
                        </div>
                        <Badge variant={isEnterprise ? "default" : isPro ? "default" : "secondary"} className={cn("text-base px-3 py-1", isEnterprise && "bg-purple-600 hover:bg-purple-700")}>
                            {userPlan}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {isOverrideActive && (
                        <Alert className="mb-6 bg-primary/5 text-primary border-primary/20">
                            <Info className="h-4 w-4" />
                            <AlertTitle>Manual Override Active</AlertTitle>
                            <AlertDescription>
                                Your plan is currently managed manually by support. Standard Stripe billing might be paused or overridden.
                                {ctx.organization.proUntil && ` Access guaranteed until ${format(new Date(ctx.organization.proUntil), "MMM d, yyyy")}.`}
                            </AlertDescription>
                        </Alert>
                    )}

                    {isPro ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="p-3 bg-background rounded-md border">
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Status</p>
                                    <div className="mt-1 flex items-center gap-2">
                                        <div className={cn("h-2 w-2 rounded-full", 
                                            isEnterprise ? "bg-primary" :
                                            subStatus === SubscriptionStatus.ACTIVE ? "bg-primary" :
                                            subStatus === SubscriptionStatus.PAST_DUE ? "bg-destructive" : "bg-destructive"
                                        )} />
                                        <span className="font-semibold capitalize">{isEnterprise ? 'Active' : subStatus.toLowerCase().replace('_', ' ')}</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-background rounded-md border">
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Seats</p>
                                    <div className="mt-1 flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-semibold">
                                            {seatCount} {seatLimit !== Infinity ? `/ ${seatLimit}` : '/ Unlimited'}
                                        </span>
                                    </div>
                                </div>
                                {periodEnd && !isEnterprise && (
                                    <div className="p-3 bg-background rounded-md border">
                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Renews On</p>
                                        <div className="mt-1 font-semibold">
                                            {format(periodEnd, 'MMM d, yyyy')}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {subStatus === SubscriptionStatus.PAST_DUE && !isOverrideActive && !isEnterprise && (
                                <Alert className="bg-destructive/5 text-destructive border-destructive/20">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Payment Past Due</AlertTitle>
                                    <AlertDescription>
                                        We couldn&apos;t process your last payment. Please update your payment method to avoid losing access to Pro features.
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="flex items-center justify-between pt-2">
                                <p className="text-sm text-muted-foreground max-w-md">
                                    {isEnterprise 
                                        ? "Your organization is on an Enterprise plan. Billing and seats are managed via your account manager."
                                        : "Your clinic has access to all Pro features including Audit Logs, Clinical Insights, and unlimited treatments."}
                                </p>
                                
                                {isEnterprise ? (
                                    <Button variant="outline" asChild>
                                        <a href="mailto:support@injexpro.com">
                                            Contact Support <Mail className="ml-2 h-4 w-4" />
                                        </a>
                                    </Button>
                                ) : (
                                    <form action={createCustomerPortalAction}>
                                        <Button variant="default" type="submit">
                                            Manage Billing & Invoices <ExternalLink className="ml-2 h-4 w-4" />
                                        </Button>
                                    </form>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Basic plans include unlimited clinical documentation for a single user. Upgrade for team collaboration and advanced oversight tools.
                            </p>
                            <PricingDialog>
                                <Button size="lg" className="w-full md:w-auto">Upgrade to Pro</Button>
                            </PricingDialog>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
