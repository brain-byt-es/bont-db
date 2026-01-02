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
      if (!hasBaseline("TWSTRS") && !hasBaseline("Tsui")) newWarnings.push("Recommended Baseline Score (TWSTRS or Tsui) missing")
    } else if (indication === "kopfschmerz") {
      if (!hasAny("HIT-6") && !hasBaseline("MIDAS")) newWarnings.push("Recommended Score (HIT-6 or MIDAS) missing")
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
    <Card className="border shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
        <div className="space-y-1">
          <CardTitle className="text-base">Assessments & Scores</CardTitle>
          <CardDescription>
             Manage clinical scores for this treatment.
          </CardDescription>
        </div>
        <Button onClick={addAssessment} size="sm" type="button" variant="outline" className="h-8">
          <Plus className="mr-2 h-3.5 w-3.5" />
          Add Score
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 px-4 pb-4">
        
        {/* Compliance Badges/Warnings */}
        <div className="flex flex-wrap gap-2 mb-4">
           {warnings.length > 0 ? (
               warnings.map((w, i) => (
                   <Badge key={i} variant="secondary" className="bg-amber-50 text-amber-900 hover:bg-amber-100 border-amber-200">
                       <AlertTriangle className="mr-1 h-3 w-3" />
                       {w}
                   </Badge>
               ))
           ) : (
               assessments.length > 0 && (
                   <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                       <CheckCircle2 className="mr-1 h-3 w-3" />
                       Score Recommendations Met
                   </Badge>
               )
           )}
        </div>

        {assessments.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8 border border-dashed rounded-md bg-muted/10">
            No assessments recorded.
          </div>
        ) : (
          <div className="space-y-3">
            {assessments.map((assessment) => (
              <div key={assessment.id} className="grid gap-3 md:grid-cols-[1fr_1fr_100px_140px_auto] items-end border p-3 rounded-lg bg-card/50 hover:bg-muted/10 transition-colors">
                 
                 {/* Scale Selector */}
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Scale</label>
                    <Select 
                        value={assessment.scale} 
                        onValueChange={(v) => updateAssessment(assessment.id, "scale", v)}
                    >
                        <SelectTrigger className="h-9">
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
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Timepoint</label>
                    <Select 
                        value={assessment.timepoint} 
                        onValueChange={(v) => updateAssessment(assessment.id, "timepoint", v)}
                    >
                        <SelectTrigger className="h-9">
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
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Value</label>
                    <Input 
                        type="number" 
                        value={assessment.value}
                        className="h-9"
                        onChange={(e) => updateAssessment(assessment.id, "value", parseFloat(e.target.value))}
                    />
                 </div>

                 {/* Date Picker */}
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Date</label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal text-xs h-9",
                                    !assessment.assessed_at && "text-muted-foreground"
                                )}
                            >
                                {assessment.assessed_at ? (
                                    format(assessment.assessed_at, "dd.MM.yyyy")
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
                 <div className="pb-0.5">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAssessment(assessment.id)}
                        type="button"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
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
