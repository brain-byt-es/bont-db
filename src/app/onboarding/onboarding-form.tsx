"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createOrganizationAction } from "./actions"
import { useFormStatus } from "react-dom"
import { toast } from "sonner"
import { useState } from "react"
import { COUNTRIES } from "@/lib/countries"
import { MapPin } from "lucide-react"
import { CountryDropdown } from "@/components/ui/country-dropdown"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={pending}>
      {pending ? "Creating Workspace..." : "Create Workspace"}
    </Button>
  )
}

export function OnboardingForm({ defaultName }: { defaultName: string }) {
  const [error, setError] = useState<string | null>(null)
  const [country, setCountry] = useState("DE")

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await createOrganizationAction(formData)
    if (result?.error) {
       setError(result.error)
       toast.error(result.error)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="orgName" className="text-sm font-medium">Clinic or Organization Name</Label>
        <Input
          id="orgName"
          name="orgName"
          placeholder="e.g. Praxis Dr. Weiss"
          required
          minLength={3}
          defaultValue={defaultName}
          className="h-11 px-3 bg-background"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="country" className="text-sm font-medium">Data Residency (Location)</Label>
        {/* Hidden input to sync with form submission */}
        <input type="hidden" name="countryCode" value={country} />
        <CountryDropdown 
            value={country} 
            onChange={setCountry} 
            placeholder="Select your country"
        />
        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 px-1 pt-1 leading-relaxed">
            <MapPin className="h-3 w-3 text-primary" />
            <span>
                Clinical and PII data will be physically isolated in the 
                <strong className="text-foreground mx-1">
                    {COUNTRIES.find(c => c.code === country)?.region === 'US' ? 'United States' : 'European Union'}
                </strong> 
                region.
            </span>
        </p>
      </div>

      {error && <p className="text-sm text-destructive font-medium">{error}</p>}
      <div className="pt-2">
        <SubmitButton />
      </div>
    </form>
  )
}
