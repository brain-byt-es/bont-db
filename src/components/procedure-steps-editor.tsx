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
import { Plus, Trash2, Copy } from "lucide-react"
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

export interface ProcedureStep {
  id: string
  muscle_id: string
  side: "Left" | "Right" | "Midline" | "Bilateral"
  numeric_value: number
  mas_baseline?: string
  mas_peak?: string
}

interface ProcedureStepsEditorProps {
  steps: ProcedureStep[]
  onChange: (steps: ProcedureStep[]) => void
  muscles: Muscle[]
  regions: MuscleRegion[]
  disabled?: boolean
}

export function ProcedureStepsEditor({ steps, onChange, muscles, regions, disabled = false }: ProcedureStepsEditorProps) {
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
    const newSteps = steps.map((step) =>
      step.id === id ? { ...step, [field]: value } : step
    )
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
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">MAS Base</label>
                    <Select
                      value={step.mas_baseline || ""}
                      onValueChange={(value) => updateStep(step.id, "mas_baseline", value)}
                      disabled={disabled}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0</SelectItem>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="1+">1+</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">MAS Peak</label>
                    <Select
                      value={step.mas_peak || ""}
                      onValueChange={(value) => updateStep(step.id, "mas_peak", value)}
                      disabled={disabled}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0</SelectItem>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="1+">1+</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
        <div className="hidden md:block rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Target Structure</TableHead>
                <TableHead className="w-[150px]">Side</TableHead>
                <TableHead className="w-[120px]">Units</TableHead>
                <TableHead className="w-[100px]">MAS Base</TableHead>
                <TableHead className="w-[100px]">MAS Peak</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {steps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
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
                    </TableCell>
                    <TableCell>
                      <Select
                        value={step.mas_baseline || ""}
                        onValueChange={(value) => updateStep(step.id, "mas_baseline", value)}
                        disabled={disabled}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="-" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="1+">1+</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={step.mas_peak || ""}
                        onValueChange={(value) => updateStep(step.id, "mas_peak", value)}
                        disabled={disabled}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="-" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="1+">1+</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
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
