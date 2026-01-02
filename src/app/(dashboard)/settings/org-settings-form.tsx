"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateOrganizationName } from "./actions"
import { useFormStatus } from "react-dom"
import { toast } from "sonner"

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save Changes"}
    </Button>
  )
}

export function OrgSettingsForm({ initialName }: { initialName: string }) {
  async function action(formData: FormData) {
    const result = await updateOrganizationName(formData)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Organization updated successfully")
    }
  }

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Organization Name</Label>
        <Input 
          id="name" 
          name="name" 
          defaultValue={initialName} 
          placeholder="e.g. My Clinic" 
          required 
          minLength={3}
        />
      </div>
      <SubmitButton />
    </form>
  )
}
