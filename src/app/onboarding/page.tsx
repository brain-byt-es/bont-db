import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getUserContext } from "@/lib/auth-context"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { OnboardingForm } from "./onboarding-form"

export default async function OnboardingPage() {
  const { userId, user } = await getUserContext()

  // Double check: if user already has an org, send them to dashboard
  const existingMembership = await prisma.organizationMembership.findFirst({
    where: { userId: userId, status: "ACTIVE" },
  })

  if (existingMembership) {
    redirect("/dashboard")
  }

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
