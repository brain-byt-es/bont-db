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
}

export function ProcedureStepsEditor({ steps, onChange, muscles, regions }: ProcedureStepsEditorProps) {
  const addStep = () => {
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Injection Sites</h3>
        <Button onClick={addStep} variant="outline" size="sm" type="button">
          <Plus className="mr-2 size-4" />
          Add Site
        </Button>
      </div>
      <div className="rounded-md border">
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
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={step.side}
                      onValueChange={(value) => updateStep(step.id, "side", value as ProcedureStep["side"])}
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
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={step.mas_baseline || ""}
                      onValueChange={(value) => updateStep(step.id, "mas_baseline", value)}
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
