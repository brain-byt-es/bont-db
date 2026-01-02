"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createOrganizationAction } from "./actions"
import { useFormStatus } from "react-dom"
import { toast } from "sonner"
import { useState } from "react"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Creating..." : "Create Workspace"}
    </Button>
  )
}

export function OnboardingForm({ defaultName }: { defaultName: string }) {
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await createOrganizationAction(formData)
    if (result?.error) {
       setError(result.error)
       toast.error(result.error)
    }
    // If successful, the action redirects, so we don't need to do anything here.
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="orgName">Organization Name</Label>
        <Input
          id="orgName"
          name="orgName"
          placeholder="e.g. Praxis Dr. Weiss"
          required
          minLength={3}
          defaultValue={defaultName}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <SubmitButton />
    </form>
  )
}
