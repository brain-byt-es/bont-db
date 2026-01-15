"use client"

import { useState, useTransition } from "react"
import { DecisionSupportMode } from "@/generated/client/enums"
import { updateDecisionSupportMode } from "./actions"
import { toast } from "sonner"
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface DecisionSupportToggleProps {
  initialValue: DecisionSupportMode
  disabled?: boolean
}

export function DecisionSupportToggle({ initialValue, disabled = false }: DecisionSupportToggleProps) {
  const [mode, setMode] = useState<DecisionSupportMode>(initialValue)
  const [isPending, startTransition] = useTransition()

  const handleValueChange = (value: string) => {
    const nextMode = value as DecisionSupportMode
    setMode(nextMode)
    startTransition(async () => {
      try {
        await updateDecisionSupportMode(nextMode)
        toast.success(`Policy updated: ${nextMode.replace('_', ' ')}`)
      } catch {
        setMode(mode) // Revert
        toast.error("Failed to update policy")
      }
    })
  }

  return (
    <div className="flex items-center justify-between space-x-4">
      <div className="flex flex-col space-y-1">
        <div className="flex items-center space-x-2">
            <Label htmlFor="decision-mode" className="text-base font-medium">Decision Support Policy</Label>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="max-w-xs">Controls the level of assistance provided during documentation. REFERENCE_ONLY allows historical context. STRICT disables all assists.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
        <span className="text-sm text-muted-foreground">
          Define how clinical history and references are presented to clinicians.
        </span>
      </div>
      <Select 
        defaultValue={mode} 
        onValueChange={handleValueChange}
        disabled={isPending || disabled}
      >
        <SelectTrigger className="w-[180px]">
            <SelectValue />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value={DecisionSupportMode.REFERENCE_ONLY}>Reference Only</SelectItem>
            <SelectItem value={DecisionSupportMode.STRICT}>Strict (Disabled)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
