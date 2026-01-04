"use client"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { updateComplianceSettings } from "./actions"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ComplianceToggleProps {
  initialValue: boolean
  disabled?: boolean
}

export function ComplianceToggle({ initialValue, disabled = false }: ComplianceToggleProps) {
  const [enabled, setEnabled] = useState(initialValue)
  const [isPending, startTransition] = useTransition()

  const handleToggle = (checked: boolean) => {
    setEnabled(checked)
    startTransition(async () => {
      try {
        await updateComplianceSettings(checked)
        toast.success(checked ? "Compliance views enabled" : "Compliance views disabled")
      } catch {
        setEnabled(!checked) // Revert on error
        toast.error("Failed to update settings")
      }
    })
  }

  return (
    <div className="flex items-center justify-between space-x-4">
      <div className="flex flex-col space-y-1">
        <div className="flex items-center space-x-2">
            <Label htmlFor="compliance-mode" className="text-base font-medium">Enable Compliance Views</Label>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="max-w-xs">InjexPro does not certify treatments. These views help structure documentation for institutional or regulatory review.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
        <span className="text-sm text-muted-foreground">
          Enable export formats and progress indicators commonly required by medical boards or institutions.
        </span>
      </div>
      <Switch
        id="compliance-mode"
        checked={enabled}
        onCheckedChange={handleToggle}
        disabled={isPending || disabled}
      />
    </div>
  )
}
