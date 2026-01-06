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
    <form action={handleSubmit} className="space-y-8">
      <div className="space-y-3">
        <Label htmlFor="orgName" className="text-sm font-semibold text-foreground">
          Clinic or Organization Name
        </Label>
        <Input
          id="orgName"
          name="orgName"
          placeholder="e.g. Praxis Dr. Weiss"
          required
          minLength={3}
          defaultValue={defaultName}
          className="h-12 px-4 bg-background text-base shadow-sm focus-visible:ring-primary"
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="country" className="text-sm font-semibold text-foreground">
          Data Residency (Location)
        </Label>
        {/* Hidden input to sync with form submission */}
        <input type="hidden" name="countryCode" value={country} />
        <CountryDropdown 
            value={country} 
            onChange={setCountry} 
            placeholder="Select your country"
        />
        
        <div className="mt-4 p-4 rounded-xl border bg-primary/5 border-primary/10 flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
            <div className="mt-0.5 rounded-full bg-primary/10 p-1">
                <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-1">
                <p className="text-[13px] font-medium leading-tight text-foreground">
                    Regional Data Isolation
                </p>
                <p className="text-[12px] text-muted-foreground leading-snug">
                    Clinical and PII data will be physically stored in the 
                    <span className="font-bold text-primary mx-1">
                        {COUNTRIES.find(c => c.code === country)?.region === 'US' ? 'United States' : 'European Union'}
                    </span> 
                    region.
                </p>
            </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20 animate-in shake-1">
            {error}
        </div>
      )}
      
      <div className="pt-4">
        <SubmitButton />
      </div>
    </form>
  )
}
