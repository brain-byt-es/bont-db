"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateOrganizationName, updateOrganizationPreferences } from "./actions"
import { useFormStatus } from "react-dom"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save Changes"}
    </Button>
  )
}

export function OrgSettingsForm({ 
    initialName, 
    initialView = "timeline" 
}: { 
    initialName: string, 
    initialView?: string 
}) {
  async function action(formData: FormData) {
    const result = await updateOrganizationName(formData)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Organization updated successfully")
    }
  }

  return (
    <form action={action} className="space-y-6">
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

      <div className="grid gap-2 pt-4 border-t">
        <Label htmlFor="standard_view">Default Patient Detail View</Label>
        <Select 
            defaultValue={initialView} 
            onValueChange={async (value) => {
                const res = await updateOrganizationPreferences({ 
                    standard_patient_view: value as 'timeline' | 'records' | 'notes' 
                })
                if (res.success) toast.success("Default view updated")
                else toast.error("Failed to update preference")
            }}
        >
          <SelectTrigger id="standard_view">
            <SelectValue placeholder="Select default view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="timeline">Timeline</SelectItem>
            <SelectItem value="records">Records</SelectItem>
            <SelectItem value="notes">Notes</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-[11px] text-muted-foreground italic">
            Choose which tab opens by default when viewing a patient profile.
        </p>
      </div>

      <div className="pt-2">
        <SubmitButton />
      </div>
    </form>
  )
}