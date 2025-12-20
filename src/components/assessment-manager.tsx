"use client"

import * as React from "react"
import { Plus, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

export interface Assessment {
  id: string
  scale: string
  timepoint: string
  value: number
  assessed_at: Date
  notes?: string
}

interface AssessmentManagerProps {
  assessments: Assessment[]
  onChange: (assessments: Assessment[]) => void
  indication: string
}

const SCALES = {
  spastik: ["Tardieu", "GAS"],
  dystonie: ["TWSTRS", "Tsui"],
  kopfschmerz: ["HIT-6", "MIDAS"],
  autonom: ["HDSS"],
  andere: ["TWSTRS", "HIT-6", "HDSS", "Other"]
}

const ALL_SCALES = Array.from(new Set(Object.values(SCALES).flat()))

export function AssessmentManager({ assessments, onChange, indication }: AssessmentManagerProps) {
  const [warnings, setWarnings] = React.useState<string[]>([])

  const checkCompliance = React.useCallback(() => {
    const newWarnings: string[] = []
    const hasBaseline = (scale: string) => assessments.some(a => a.scale === scale && a.timepoint === "baseline")
    const hasAny = (scale: string) => assessments.some(a => a.scale === scale)

    if (indication === "dystonie") {
      if (!hasBaseline("TWSTRS") && !hasBaseline("Tsui")) newWarnings.push("Empfohlener Baseline-Score (TWSTRS oder Tsui) fehlt")
    } else if (indication === "kopfschmerz") {
      if (!hasAny("HIT-6")) newWarnings.push("Empfohlener Score (HIT-6) fehlt")
    }

    setWarnings(newWarnings)
  }, [assessments, indication])

  React.useEffect(() => {
    checkCompliance()
  }, [checkCompliance])

  const addAssessment = () => {
    // Determine default scale based on indication
    let defaultScale = "Other"
    if (indication === "spastik") defaultScale = "Tardieu"
    if (indication === "dystonie") defaultScale = "TWSTRS"
    if (indication === "kopfschmerz") defaultScale = "HIT-6"
    if (indication === "autonom") defaultScale = "HDSS"

    const newAssessment: Assessment = {
      id: Math.random().toString(36).substr(2, 9),
      scale: defaultScale,
      timepoint: "baseline",
      value: 0,
      assessed_at: new Date(),
      notes: ""
    }
    onChange([...assessments, newAssessment])
  }

  const updateAssessment = (id: string, field: keyof Assessment, value: string | number | Date) => {
    const newAssessments = assessments.map((a) =>
      a.id === id ? { ...a, [field]: value } : a
    )
    onChange(newAssessments)
  }

  const removeAssessment = (id: string) => {
    onChange(assessments.filter((a) => a.id !== id))
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Assessments & Scores</CardTitle>
          <CardDescription>
             Manage clinical scores for this treatment.
          </CardDescription>
        </div>
        <Button onClick={addAssessment} size="sm" type="button">
          <Plus className="mr-2 h-4 w-4" />
          Add Score
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Compliance Badges/Warnings */}
        <div className="flex flex-wrap gap-2 mb-4">
           {warnings.length > 0 ? (
               warnings.map((w, i) => (
                   <Badge key={i} variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300">
                       <AlertTriangle className="mr-1 h-3 w-3" />
                       {w}
                   </Badge>
               ))
           ) : (
               assessments.length > 0 && (
                   <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                       <CheckCircle2 className="mr-1 h-3 w-3" />
                       Score-Empfehlungen erfüllt
                   </Badge>
               )
           )}
        </div>

        {assessments.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-4 border border-dashed rounded-md">
            No assessments recorded.
          </div>
        ) : (
          <div className="space-y-4">
            {assessments.map((assessment) => (
              <div key={assessment.id} className="grid gap-4 md:grid-cols-[1fr_1fr_100px_150px_auto] items-start border p-4 rounded-md bg-card">
                 
                 {/* Scale Selector */}
                 <div className="space-y-2">
                    <span className="text-xs font-medium text-muted-foreground">Scale</span>
                    <Select 
                        value={assessment.scale} 
                        onValueChange={(v) => updateAssessment(assessment.id, "scale", v)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                             {ALL_SCALES.map(s => (
                                 <SelectItem key={s} value={s}>{s}</SelectItem>
                             ))}
                        </SelectContent>
                    </Select>
                 </div>

                 {/* Timepoint Selector */}
                 <div className="space-y-2">
                    <span className="text-xs font-medium text-muted-foreground">Timepoint</span>
                    <Select 
                        value={assessment.timepoint} 
                        onValueChange={(v) => updateAssessment(assessment.id, "timepoint", v)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                             <SelectItem value="baseline">Baseline</SelectItem>
                             <SelectItem value="peak_effect">Peak Effect</SelectItem>
                             <SelectItem value="follow_up">Follow-up</SelectItem>
                             <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>

                 {/* Value Input */}
                 <div className="space-y-2">
                    <span className="text-xs font-medium text-muted-foreground">Value</span>
                    <Input 
                        type="number" 
                        value={assessment.value}
                        onChange={(e) => updateAssessment(assessment.id, "value", parseFloat(e.target.value))}
                    />
                 </div>

                 {/* Date Picker */}
                 <div className="space-y-2">
                    <span className="text-xs font-medium text-muted-foreground">Date</span>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal text-xs h-10",
                                    !assessment.assessed_at && "text-muted-foreground"
                                )}
                            >
                                {assessment.assessed_at ? (
                                    format(assessment.assessed_at, "PP")
                                ) : (
                                    <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-3 w-3 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={assessment.assessed_at}
                                onSelect={(d) => d && updateAssessment(assessment.id, "assessed_at", d)}
                                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                 </div>

                 {/* Actions */}
                 <div className="pt-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAssessment(assessment.id)}
                        type="button"
                    >
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                 </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
