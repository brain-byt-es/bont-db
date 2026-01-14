"use client"

import * as React from "react"
import { Plus, Trash2, Target, Activity, User, Briefcase } from "lucide-react"

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

export type GoalCategory = "SYMPTOM" | "FUNCTION" | "PARTICIPATION"

export interface TreatmentGoal {
  id: string
  category: GoalCategory
  description: string
}

interface GoalManagerProps {
  goals: TreatmentGoal[]
  onChange: (goals: TreatmentGoal[]) => void
  disabled?: boolean
}

const CATEGORY_CONFIG = {
  SYMPTOM: { label: "Symptom", icon: Activity, color: "text-blue-500", bg: "bg-blue-50" },
  FUNCTION: { label: "Function", icon: User, color: "text-emerald-500", bg: "bg-emerald-50" },
  PARTICIPATION: { label: "Participation", icon: Briefcase, color: "text-purple-500", bg: "bg-purple-50" }
}

export function GoalManager({ goals, onChange, disabled = false }: GoalManagerProps) {

  const addGoal = () => {
    if (goals.length >= 5) return // Hard cap
    const newGoal: TreatmentGoal = {
      id: Math.random().toString(36).substr(2, 9),
      category: "FUNCTION",
      description: ""
    }
    onChange([...goals, newGoal])
  }

  const updateGoal = (id: string, field: keyof TreatmentGoal, value: string) => {
    const newGoals = goals.map((g) =>
      g.id === id ? { ...g, [field]: value } : g
    )
    onChange(newGoals)
  }

  const removeGoal = (id: string) => {
    onChange(goals.filter((g) => g.id !== id))
  }

  return (
    <Card className="border shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
        <div className="space-y-1">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            Treatment Goals (GAS)
          </CardTitle>
          <CardDescription>
             Define 1-3 SMART goals for this treatment cycle.
          </CardDescription>
        </div>
        <Button onClick={addGoal} size="sm" type="button" variant="outline" className="h-8" disabled={disabled || goals.length >= 5}>
          <Plus className="mr-2 h-3.5 w-3.5" />
          Add Goal
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 px-4 pb-4">
        
        {goals.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-6 border border-dashed rounded-md bg-muted/10">
            No goals defined. Set specific goals to improve defensibility.
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((goal) => {
               const CatIcon = CATEGORY_CONFIG[goal.category].icon
               return (
                <div key={goal.id} className="grid gap-3 md:grid-cols-[140px_1fr_auto] items-start border p-3 rounded-lg bg-card/50 hover:bg-muted/10 transition-colors">
                   
                   {/* Category Selector */}
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Type</label>
                      <Select 
                          value={goal.category} 
                          onValueChange={(v) => updateGoal(goal.id, "category", v as GoalCategory)}
                          disabled={disabled}
                      >
                          <SelectTrigger className="h-9">
                              <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                               <SelectItem value="SYMPTOM">Symptom</SelectItem>
                               <SelectItem value="FUNCTION">Function</SelectItem>
                               <SelectItem value="PARTICIPATION">Participation</SelectItem>
                          </SelectContent>
                      </Select>
                   </div>

                   {/* Description Input */}
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Goal Description (SMART)</label>
                      <div className="relative">
                        <Input 
                            value={goal.description}
                            placeholder="e.g. Walk 500m to the bakery without stopping..."
                            className="h-9 pr-8"
                            maxLength={140}
                            onChange={(e) => updateGoal(goal.id, "description", e.target.value)}
                            disabled={disabled}
                        />
                        <CatIcon className={`absolute right-2.5 top-2.5 h-4 w-4 ${CATEGORY_CONFIG[goal.category].color}`} />
                      </div>
                   </div>

                   {/* Actions */}
                   <div className="pt-6">
                      {!disabled && (
                      <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeGoal(goal.id)}
                          type="button"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                      </Button>
                      )}
                   </div>
                </div>
               )
            })}
          </div>
        )}
        
        {/* Recommendation Badge */}
        {goals.length > 0 && goals.length < 3 && (
            <div className="flex justify-center">
                <Badge variant="secondary" className="text-xs text-muted-foreground bg-muted font-normal">
                    Recommended: 1-3 goals
                </Badge>
            </div>
        )}
      </CardContent>
    </Card>
  )
}
