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
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to InjexPro</CardTitle>
          <CardDescription>
            Let&apos;s set up your new workspace. What is the name of your clinic or practice?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OnboardingForm defaultName={user.name ? `${user.name}'s Clinic` : ""} />
        </CardContent>
      </Card>
    </div>
  )
}
