"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { signIn } from "next-auth/react"

interface SignupFormProps extends React.ComponentProps<"form"> {
  message?: string
}

export function SignupForm({
  className,
  message,
  ...props
}: SignupFormProps) {
  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={(e) => e.preventDefault()} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Fill in the form below to create your account
          </p>
        </div>
        {message && (
          <div className="text-sm font-medium text-destructive text-center">{message}</div>
        )}
        
        <Field className="opacity-60">
          <FieldLabel htmlFor="name">Full Name</FieldLabel>
          <Input id="name" name="name" type="text" placeholder="John Doe" disabled />
        </Field>
        <Field className="opacity-60">
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" placeholder="m@example.com" disabled />
          <FieldDescription>
            We&apos;ll use this to contact you. We will not share your email
            with anyone else.
          </FieldDescription>
        </Field>
        <Field className="opacity-60">
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input id="password" name="password" type="password" disabled />
          <FieldDescription>
            Must be at least 8 characters long.
          </FieldDescription>
        </Field>
        <Field className="opacity-60">
          <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
          <Input id="confirm-password" name="confirm-password" type="password" disabled />
          <FieldDescription>Please confirm your password.</FieldDescription>
        </Field>
        <div className="flex items-start space-x-2 opacity-60">
          <Checkbox id="terms" name="terms" disabled />
          <label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 pt-1"
          >
            I accept the <a href="/terms" className="underline hover:text-primary pointer-events-none">Terms of Service</a> and <a href="/privacy" className="underline hover:text-primary pointer-events-none">Privacy Policy</a>
          </label>
        </div>
        <Field className="opacity-60">
          <Button type="submit" disabled>Create Account</Button>
        </Field>

        <FieldSeparator>Or continue with</FieldSeparator>
        <div className="grid grid-cols-1 gap-4">
          <Button variant="outline" type="button" onClick={() => signIn("azure-ad", { callbackUrl: "/dashboard" })}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21" className="mr-2 h-4 w-4">
                <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
            </svg>
            Sign up with Microsoft
          </Button>
          <Button variant="outline" type="button" onClick={() => signIn("linkedin", { callbackUrl: "/dashboard" })}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
              <path
                d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                fill="currentColor"
              />
            </svg>
            Sign up with LinkedIn
          </Button>
          <Button variant="outline" type="button" onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign up with Google
          </Button>
        </div>
        <Field>
          <FieldDescription className="px-6 text-center mt-2">
            Already have an account? <a href="/login">Sign in</a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
