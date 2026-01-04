"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateOrganizationPreferences } from "@/app/(dashboard)/settings/actions"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Save } from "lucide-react"

interface ClinicalSettingsFormProps {
  initialVialSize: number
  initialDilution: number
  disabled?: boolean
}

export function ClinicalSettingsForm({ 
  initialVialSize, 
  initialDilution,
  disabled = false 
}: ClinicalSettingsFormProps) {
  const [vialSize, setVialSize] = useState(initialVialSize)
  const [dilution, setDilution] = useState(initialDilution)
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    startTransition(async () => {
      try {
        const result = await updateOrganizationPreferences({
          standard_vial_size: vialSize,
          standard_dilution_ml: dilution
        })
        if (result?.success) {
          toast.success("Clinic standards updated")
        }
      } catch {
        toast.error("Failed to update clinic standards")
      }
    })
  }

  return (
    <Card className={disabled ? "opacity-60 grayscale-[0.5]" : ""}>
      <CardHeader>
        <CardTitle>Clinic Standards</CardTitle>
        <CardDescription>
          Set the default vial size and dilution for your clinic. These values will be pre-filled for all new treatments.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="std-vial">Default Vial Size (Units)</Label>
            <Input
              id="std-vial"
              type="number"
              value={vialSize}
              onChange={(e) => setVialSize(parseFloat(e.target.value))}
              disabled={disabled || isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="std-dilution">Default Dilution (ml Saline)</Label>
            <Input
              id="std-dilution"
              type="number"
              step="0.1"
              value={dilution}
              onChange={(e) => setDilution(parseFloat(e.target.value))}
              disabled={disabled || isPending}
            />
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={disabled || isPending}>
            <Save className="mr-2 h-4 w-4" />
            {isPending ? "Saving..." : "Save Clinic Standards"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
