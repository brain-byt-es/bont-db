"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useTransition } from "react"
import { requestPasswordReset } from "@/app/actions/auth-reset"
import { toast } from "sonner"
import Link from "next/link"
import { Loader2, ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    const email = formData.get("email") as string
    
    startTransition(async () => {
      const result = await requestPasswordReset(email)
      if (result.error) {
        toast.error(result.error)
      } else {
        setSuccess(true)
        toast.success("If an account exists, a reset link has been sent.")
      }
    })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="w-full max-w-md space-y-8 bg-background p-8 rounded-lg border shadow-sm">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight">Forgot Password</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        {success ? (
          <div className="space-y-6">
            <div className="rounded-md bg-green-50 p-4 border border-green-200 dark:bg-green-900/20 dark:border-green-900">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Check your email</h3>
                  <div className="mt-2 text-sm text-green-700 dark:text-green-400">
                    <p>
                      We have sent a password reset link to your email address.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <Button asChild className="w-full" variant="outline">
                <Link href="/login">Return to Login</Link>
            </Button>
          </div>
        ) : (
          <form action={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={isPending}
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Send Reset Link
            </Button>

            <div className="text-center">
                <Link href="/login" className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back to Login
                </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
