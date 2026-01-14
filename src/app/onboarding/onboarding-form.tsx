"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { createOrganizationAction } from "./actions"
import { seedDemoOrganizationAction } from "@/app/actions/demo-seed"
import { useFormStatus } from "react-dom"
import { toast } from "sonner"
import { useState, useTransition } from "react"
import { COUNTRIES } from "@/lib/countries"
import { MapPin, ShieldCheck, Sparkles } from "lucide-react"
import { CountryDropdown } from "@/components/ui/country-dropdown"
import Link from "next/link"
import { useRouter } from "next/navigation"

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
  const [isDemoPending, startDemoTransition] = useTransition()
  const router = useRouter()

  const isEU = COUNTRIES.find(c => c.code === country)?.region === 'EU'

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await createOrganizationAction(formData)
    if (result?.error) {
       setError(result.error)
       toast.error(result.error)
    }
  }

  const handleLaunchDemo = () => {
      startDemoTransition(async () => {
          try {
              toast.info("Generating your high-fidelity demo environment...")
              const result = await seedDemoOrganizationAction()
              if (result.success) {
                  toast.success("Demo Center launched! Redirecting...")
                  router.push("/dashboard")
              }
          } catch {
              toast.error("Failed to launch demo center. Please try again.")
          }
      })
  }

  return (
    <div className="space-y-10">
    <form action={handleSubmit} className="space-y-8">
      {/* ... existing fields ... */}
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
                        {isEU ? 'European Union' : 'United States'}
                    </span> 
                    region.
                </p>
            </div>
        </div>
      </div>

      {isEU && (
        <div className="space-y-4 animate-in fade-in pt-2">
            <div className="rounded-xl border p-4 bg-muted/30 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-sm">Data Processing Agreement (DPA)</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    To document and process clinical data, InjexPro requires your organization to accept our DPA. This is a standard requirement under GDPR and ensures that patient data is processed securely, lawfully, and only on your organization&apos;s instructions.
                </p>
                
                <div className="pt-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">This agreement confirms:</p>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                        <li className="flex items-start gap-2">
                            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                            <span>The legal basis for processing special category health data</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                            <span>The agreed <Link href="/legal/toms" target="_blank" className="underline decoration-muted-foreground/50 hover:text-foreground">Technical and Organizational Measures (TOMs)</Link></span>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                            <span>The use of <Link href="/legal/subprocessors" target="_blank" className="underline decoration-muted-foreground/50 hover:text-foreground">authorized subprocessors</Link></span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="flex items-start space-x-2 px-1">
                <Checkbox id="dpa" name="dpa" required className="mt-1" />
                <label
                    htmlFor="dpa"
                    className="text-sm font-medium leading-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    I accept the <Link href="/legal/dpa" target="_blank" className="underline hover:text-primary">Data Processing Agreement (DPA)</Link> and confirm that I am authorized to accept this agreement on behalf of the organization (Controller).
                </label>
            </div>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20 animate-in shake-1">
            {error}
        </div>
      )}
      
      <div className="pt-4">
        <SubmitButton />
      </div>
    </form>

    <div className="relative pt-4">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-muted"></div>
        </div>
        <div className="relative flex justify-center text-sm font-medium leading-6">
            <span className="bg-white px-4 text-muted-foreground uppercase tracking-widest text-[10px]">Or explore first</span>
        </div>
    </div>

    <div className="space-y-4">
        <Button 
            variant="outline" 
            className="w-full h-12 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary group transition-all"
            onClick={handleLaunchDemo}
            disabled={isDemoPending}
        >
            <Sparkles className="mr-2 h-4 w-4 animate-pulse group-hover:scale-110 transition-transform" />
            Launch Demo Center
        </Button>
        <p className="text-[11px] text-muted-foreground text-center italic px-4">
            Try InjexPro with 12 months of pre-seeded clinical data. No setup required.
        </p>
    </div>
    </div>
  )
}
