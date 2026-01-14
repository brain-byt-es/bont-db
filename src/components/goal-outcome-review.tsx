"use client"

import * as React from "react"
import { CheckCircle2, AlertCircle, TrendingUp, TrendingDown, Minus } from "lucide-react"

import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TreatmentGoal } from "./goal-manager"

export interface GoalOutcome {
  id?: string // optional for new ones
  goalId: string
  score: number
  notes?: string | null
}

interface GoalOutcomeReviewProps {
  previousGoals: TreatmentGoal[]
  outcomes: GoalOutcome[]
  onChange: (outcomes: GoalOutcome[]) => void
  disabled?: boolean
  previousDate?: Date
}

const GAS_SCALE = [
  { value: -2, label: "Worse", color: "bg-red-100 text-red-700 border-red-200", icon: TrendingDown },
  { value: -1, label: "Partial", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Minus },
  { value: 0, label: "Target", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 }, // Target is 0
  { value: 1, label: "Better", color: "bg-blue-100 text-blue-700 border-blue-200", icon: TrendingUp },
  { value: 2, label: "Exceeds", color: "bg-purple-100 text-purple-700 border-purple-200", icon: AlertCircle }, // Using AlertCircle as star-like placeholder
]

export function GoalOutcomeReview({ previousGoals, outcomes, onChange, disabled = false, previousDate }: GoalOutcomeReviewProps) {

  const handleScoreChange = (goalId: string, score: number) => {
    const existingIndex = outcomes.findIndex(o => o.goalId === goalId)
    const newOutcomes = [...outcomes]
    
    if (existingIndex >= 0) {
        newOutcomes[existingIndex] = { ...newOutcomes[existingIndex], score }
    } else {
        newOutcomes.push({ goalId, score, notes: "" })
    }
    onChange(newOutcomes)
  }

  const handleNotesChange = (goalId: string, notes: string) => {
    const existingIndex = outcomes.findIndex(o => o.goalId === goalId)
    const newOutcomes = [...outcomes]
    
    if (existingIndex >= 0) {
        newOutcomes[existingIndex] = { ...newOutcomes[existingIndex], notes }
    } else {
        newOutcomes.push({ goalId, score: 0, notes }) // Default to 0 if notes typed first
    }
    onChange(newOutcomes)
  }

  if (!previousGoals || previousGoals.length === 0) return null

  return (
    <Card className="border-l-4 border-l-blue-500 shadow-sm bg-blue-50/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
          <CheckCircle2 className="h-5 w-5 text-blue-600" />
          Review Goals from {previousDate ? previousDate.toLocaleDateString() : "Previous Visit"}
        </CardTitle>
        <CardDescription>
            Did the patient achieve the goals set in the last encounter?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {previousGoals.map(goal => {
            const outcome = outcomes.find(o => o.goalId === goal.id)
            const currentScore = outcome ? outcome.score : null

            return (
                <div key={goal.id} className="space-y-3 pb-4 border-b last:border-0 last:pb-0">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                {goal.category}
                            </span>
                            <p className="font-medium text-foreground text-sm mt-1">
                                {goal.description}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="grid grid-cols-5 gap-1 md:gap-2">
                            {GAS_SCALE.map((step) => {
                                const isSelected = currentScore === step.value
                                const Icon = step.icon
                                return (
                                    <button
                                        key={step.value}
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => handleScoreChange(goal.id, step.value)}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-2 rounded-md border transition-all text-center",
                                            isSelected 
                                                ? step.color + " ring-2 ring-offset-1 ring-blue-500/30 font-semibold shadow-sm" 
                                                : "bg-white border-muted hover:bg-muted/50 text-muted-foreground opacity-70 hover:opacity-100",
                                            disabled && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        <Icon className="h-4 w-4 mb-1" />
                                        <span className="text-[10px] md:text-xs">{step.label}</span>
                                        <span className="text-[10px] opacity-50 font-mono">({step.value > 0 ? "+" : ""}{step.value})</span>
                                    </button>
                                )
                            })}
                        </div>
                        
                        <div className="pt-1">
                            <Textarea 
                                placeholder="Outcome notes (e.g. why was it not reached?)..."
                                value={outcome?.notes || ""}
                                onChange={(e) => handleNotesChange(goal.id, e.target.value)}
                                className="h-16 text-xs resize-none bg-white"
                                disabled={disabled}
                            />
                        </div>
                    </div>
                </div>
            )
        })}
      </CardContent>
    </Card>
  )
}
