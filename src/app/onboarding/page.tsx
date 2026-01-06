import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getUserContext } from "@/lib/auth-context"
// import { redirect } from "next/navigation" // Removed as we don't force redirect anymore
// import prisma from "@/lib/prisma" // Not needed anymore
import { OnboardingForm } from "./onboarding-form"

export default async function OnboardingPage() {
  const { user } = await getUserContext()

  // We intentionally allow access here even if the user has memberships,
  // to support the "Add Team" workflow.

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-2xl border-none">
        <CardHeader className="text-center pt-8 pb-4">
          <CardTitle className="text-3xl font-extrabold tracking-tight">Setup your Workspace</CardTitle>
          <CardDescription className="text-base pt-2 text-balance px-4">
            Initialize your clinical environment. Clinical data is isolated by region for maximum security.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-8">
          <OnboardingForm defaultName={user.name ? `${user.name}'s Clinic` : ""} />
        </CardContent>
      </Card>
    </div>
  )
}
