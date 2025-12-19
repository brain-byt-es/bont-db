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
import { Plus, Trash2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface ProcedureStep {
  id: string
  target_structure: string
  side: "Left" | "Right" | "Midline" | "Bilateral"
  numeric_value: number
}

interface ProcedureStepsEditorProps {
  steps: ProcedureStep[]
  onChange: (steps: ProcedureStep[]) => void
}

export function ProcedureStepsEditor({ steps, onChange }: ProcedureStepsEditorProps) {
  const addStep = () => {
    const newStep: ProcedureStep = {
      id: Math.random().toString(36).substr(2, 9),
      target_structure: "",
      side: "Left",
      numeric_value: 0,
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
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {steps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No injection sites added.
                </TableCell>
              </TableRow>
            ) : (
              steps.map((step) => (
                <TableRow key={step.id}>
                  <TableCell>
                    <Input
                      value={step.target_structure}
                      onChange={(e) => updateStep(step.id, "target_structure", e.target.value)}
                      placeholder="e.g. Frontalis"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={step.side}
                      onValueChange={(value) => updateStep(step.id, "side", value)}
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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeStep(step.id)}
                      type="button"
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
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
