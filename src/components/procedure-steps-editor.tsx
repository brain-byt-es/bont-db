"use client"


import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Trash2, Copy, Sparkles } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { MuscleSelector, Muscle, MuscleRegion } from "@/components/muscle-selector"
import { getDoseSuggestionsAction } from "@/app/(dashboard)/treatments/actions"
import { DoseSuggestion } from "@/lib/dose-engine"
import { useEffect, useState } from "react"

export interface ProcedureStep {
  id: string
  muscle_id: string
  side: "Left" | "Right" | "Midline" | "Bilateral"
  numeric_value: number
  volume_ml?: number
  mas_baseline?: string
  mas_peak?: string
}

interface ProcedureStepsEditorProps {
  steps: ProcedureStep[]
  onChange: (steps: ProcedureStep[]) => void
  muscles: Muscle[]
  regions: MuscleRegion[]
  disabled?: boolean
  unitsPerMl?: number
  patientId?: string
}

function DoseSuggestionHint({ 
    muscleId, 
    patientId, 
    onApply 
}: { 
    muscleId: string, 
    patientId?: string, 
    onApply: (units: number, side: ProcedureStep["side"]) => void 
}) {
    const [suggestion, setSuggestion] = useState<DoseSuggestion | null>(null)

    useEffect(() => {
        if (!muscleId || !patientId) return
        const fetchSuggestion = async () => {
            const results = await getDoseSuggestionsAction(patientId, muscleId)
            if (results.length > 0) setSuggestion(results[0])
        }
        fetchSuggestion()
    }, [muscleId, patientId])

    if (!suggestion) return null

    return (
        <Button
            variant="ghost"
            size="sm"
            className="h-6 px-1.5 text-[10px] text-primary bg-primary/5 hover:bg-primary/10 flex items-center gap-1 mt-1"
            onClick={() => onApply(suggestion.units, suggestion.side)}
            type="button"
            title={`Suggestion based on patient history: ${suggestion.units} U`}
        >
            <Sparkles className="size-2.5" />
            Apply {suggestion.units} U
        </Button>
    )
}

export function ProcedureStepsEditor({
  steps,
  onChange,
  muscles,
  regions,
  disabled = false,
  unitsPerMl = 0,
  patientId
}: ProcedureStepsEditorProps) {
  const addStep = () => {
    if (disabled) return
    const newStep: ProcedureStep = {
      id: Math.random().toString(36).substr(2, 9),
      muscle_id: "",
      side: "Left",
      numeric_value: 0,
      mas_baseline: "",
      mas_peak: ""
    }
    onChange([...steps, newStep])
  }

  const duplicateStep = (step: ProcedureStep) => {
    const newStep: ProcedureStep = {
        ...step,
        id: Math.random().toString(36).substr(2, 9),
    }
    onChange([...steps, newStep])
  }

  const updateStep = (id: string, field: keyof ProcedureStep, value: ProcedureStep[typeof field]) => {
      const newSteps = steps.map((step) => {
        if (step.id !== id) return step
        
        const updatedStep = { ...step, [field]: value }
  
        // Smart Dose Calculation
        if (unitsPerMl > 0) {
            if (field === 'numeric_value') {
                updatedStep.volume_ml = parseFloat((Number(value) / unitsPerMl).toFixed(3))
            } else if (field === 'volume_ml') {
                updatedStep.numeric_value = parseFloat((Number(value) * unitsPerMl).toFixed(1))
            }
        }
  
        return updatedStep
      })
      onChange(newSteps)
    }
    const removeStep = (id: string) => {
    onChange(steps.filter((step) => step.id !== id))
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Injection Sites</CardTitle>
          <CardDescription>
             Define target muscles and dosage.
          </CardDescription>
        </div>
        <Button onClick={addStep} size="sm" type="button" disabled={disabled}>
          <Plus className="mr-2 size-4" />
          Add Site
        </Button>
      </CardHeader>
      <CardContent>
        {/* Mobile Layout (Cards) */}
        <div className="space-y-4 md:hidden">
          {steps.length === 0 ? (
            <div className="h-24 flex items-center justify-center text-sm text-muted-foreground border border-dashed rounded-md">
              No injection sites added.
            </div>
          ) : (
            steps.map((step) => (
              <div key={step.id} className="p-4 border rounded-md space-y-4 bg-muted/30">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Target Structure</label>
                  <MuscleSelector 
                      value={step.muscle_id}
                      onSelect={(val) => updateStep(step.id, "muscle_id", val)}
                      muscles={muscles}
                      regions={regions}
                      disabled={disabled}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Side</label>
                    <Select
                      value={step.side}
                      onValueChange={(value) => updateStep(step.id, "side", value as ProcedureStep["side"])}
                      disabled={disabled}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Left">Left</SelectItem>
                        <SelectItem value="Right">Right</SelectItem>
                        <SelectItem value="Bilateral">Bilateral</SelectItem>
                        <SelectItem value="Midline">Midline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Units</label>
                    <Input
                      type="number"
                      value={step.numeric_value}
                      onChange={(e) => updateStep(step.id, "numeric_value", parseFloat(e.target.value))}
                      disabled={disabled}
                    />
                    {!disabled && patientId && step.muscle_id && (
                        <DoseSuggestionHint 
                            muscleId={step.muscle_id} 
                            patientId={patientId} 
                            onApply={(units, side) => {
                                updateStep(step.id, "numeric_value", units)
                                updateStep(step.id, "side", side)
                            }}
                        />
                    )}
                  </div>
                  {unitsPerMl > 0 && (
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Volume (ml)</label>
                        <Input
                            type="number"
                            step="0.01"
                            value={step.volume_ml || (step.numeric_value / unitsPerMl) || 0}
                            onChange={(e) => updateStep(step.id, "volume_ml", parseFloat(e.target.value))}
                            disabled={disabled}
                            className="bg-primary/5 border-primary/20"
                        />
                    </div>
                  )}
                </div>

                {!disabled && (
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => duplicateStep(step)}
                    type="button"
                    className="h-8"
                  >
                    <Copy className="mr-2 size-3" />
                    Duplicate
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStep(step.id)}
                    type="button"
                    className="h-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="mr-2 size-3" />
                    Remove
                  </Button>
                </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Desktop Layout (Table) */}
        <div className="hidden md:block rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Target Structure</TableHead>
                <TableHead className="w-[130px]">Side</TableHead>
                <TableHead className="w-[100px]">Units</TableHead>
                {unitsPerMl > 0 && <TableHead className="w-[100px]">Vol (ml)</TableHead>}
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {steps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={unitsPerMl > 0 ? 5 : 4} className="h-24 text-center">
                    No injection sites added.
                  </TableCell>
                </TableRow>
              ) : (
                steps.map((step) => (
                  <TableRow key={step.id}>
                    <TableCell>
                      <MuscleSelector 
                          value={step.muscle_id}
                          onSelect={(val) => updateStep(step.id, "muscle_id", val)}
                          muscles={muscles}
                          regions={regions}
                          disabled={disabled}
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={step.side}
                        onValueChange={(value) => updateStep(step.id, "side", value as ProcedureStep["side"])}
                        disabled={disabled}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Left">Left</SelectItem>
                          <SelectItem value="Right">Right</SelectItem>
                          <SelectItem value="Bilateral">Bilateral</SelectItem>
                          <SelectItem value="Midline">Midline</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={step.numeric_value}
                        onChange={(e) => updateStep(step.id, "numeric_value", parseFloat(e.target.value))}
                        disabled={disabled}
                      />
                      {!disabled && patientId && step.muscle_id && (
                        <DoseSuggestionHint 
                            muscleId={step.muscle_id} 
                            patientId={patientId} 
                            onApply={(units, side) => {
                                updateStep(step.id, "numeric_value", units)
                                updateStep(step.id, "side", side)
                            }}
                        />
                      )}
                    </TableCell>
                    {unitsPerMl > 0 && (
                        <TableCell>
                            <Input
                                type="number"
                                step="0.01"
                                value={step.volume_ml || (step.numeric_value / unitsPerMl) || 0}
                                onChange={(e) => updateStep(step.id, "volume_ml", parseFloat(e.target.value))}
                                disabled={disabled}
                                className="bg-primary/5 border-primary/20"
                            />
                        </TableCell>
                    )}
                    <TableCell>
                      {!disabled && (
                      <div className="flex items-center gap-1">
                          <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => duplicateStep(step)}
                          type="button"
                          title="Duplicate row"
                          >
                          <Copy className="size-4" />
                          </Button>
                          <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeStep(step.id)}
                          type="button"
                          >
                          <Trash2 className="size-4 text-destructive" />
                          </Button>
                      </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
