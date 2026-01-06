"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createOrganizationAction } from "./actions"
import { useFormStatus } from "react-dom"
import { toast } from "sonner"
import { useState } from "react"
import { COUNTRIES } from "@/lib/countries"
import { Globe, MapPin } from "lucide-react"

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
  const [country, setCountry] = useState("DE")

  async function handleSubmit(formData: FormData) {
    setError(null)
    // Add selected country to formData manually if needed, 
    // or just let the hidden input/select name handle it.
    const result = await createOrganizationAction(formData)
    if (result?.error) {
       setError(result.error)
       toast.error(result.error)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="orgName">Clinic or Organization Name</Label>
        <Input
          id="orgName"
          name="orgName"
          placeholder="e.g. Praxis Dr. Weiss"
          required
          minLength={3}
          defaultValue={defaultName}
          className="h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">Data Residency (Location)</Label>
        <Select name="countryCode" defaultValue="DE" onValueChange={setCountry}>
          <SelectTrigger className="h-11">
            <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Select your country" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 px-1">
            <MapPin className="h-3 w-3" />
            Your clinical data will be stored in the <strong>{COUNTRIES.find(c => c.code === country)?.region === 'US' ? 'United States' : 'European Union'}</strong> region.
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <SubmitButton />
    </form>
  )
}
