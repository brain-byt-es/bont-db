"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useTransition, use } from "react"
import { resetPassword } from "@/app/actions/auth-reset"
import { toast } from "sonner"
import Link from "next/link"
import { Loader2, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ResetPasswordPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = use(searchParams)
  const token = params.token as string
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string
    
    startTransition(async () => {
        if (!token) {
            toast.error("Missing token")
            return
        }
      const result = await resetPassword(token, password, confirmPassword)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Password reset successfully. Please login.")
        router.push("/login?message=Password reset successfully. Please login.")
      }
    })
  }

  if (!token) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
            <div className="w-full max-w-md space-y-8 bg-background p-8 rounded-lg border shadow-sm text-center">
                <h2 className="text-xl font-bold text-destructive">Invalid Request</h2>
                <p className="text-muted-foreground">No reset token provided.</p>
                <Button asChild variant="outline">
                    <Link href="/login">Return to Login</Link>
                </Button>
            </div>
        </div>
      )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="w-full max-w-md space-y-8 bg-background p-8 rounded-lg border shadow-sm">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight">Set New Password</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Please enter your new password below.
          </p>
        </div>

        <form action={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={isPending}
                minLength={8}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                disabled={isPending}
                minLength={8}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Reset Password
          </Button>

          <div className="text-center">
              <Link href="/login" className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back to Login
              </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
