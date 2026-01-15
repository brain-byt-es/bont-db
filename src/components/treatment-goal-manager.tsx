"use client"

import * as React from "react"
import { 
    Target, 
    CheckCircle2, 
    Activity, 
    User, 
    Briefcase, 
    TrendingUp, 
    TrendingDown, 
    Minus,
    Plus,
    ChevronDown,
    ChevronUp,
    History as HistoryIcon
} from "lucide-react"
import { GoalCategory, GoalStatus } from "@/generated/client/enums"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { getPatientGoalsAction } from "@/app/(dashboard)/patients/goal-actions"
import { GoalCreateDialog } from "./goal-create-dialog"

interface GoalAssessment {
    goalId: string
    score: number
    notes?: string | null
}

interface Goal {
    id: string
    description: string
    category: GoalCategory
    status: GoalStatus
}

interface TreatmentGoalManagerProps {
    patientId: string
    targetedGoalIds: string[]
    onTargetedGoalsChange: (ids: string[]) => void
    goalAssessments: GoalAssessment[]
    onGoalAssessmentsChange: (assessments: GoalAssessment[]) => void
    disabled?: boolean
    previousTargetedGoals?: Goal[]
}

const GAS_SCALE = [
    { value: -2, label: "Worse", color: "text-red-700 bg-red-50", border: "border-red-200", icon: TrendingDown },
    { value: -1, label: "Partial", color: "text-amber-700 bg-amber-50", border: "border-amber-200", icon: Minus },
    { value: 0, label: "Target", color: "text-emerald-700 bg-emerald-50", border: "border-emerald-200", icon: CheckCircle2 },
    { value: 1, label: "Better", color: "text-blue-700 bg-blue-50", border: "border-blue-200", icon: TrendingUp },
    { value: 2, label: "Exceeds", color: "text-purple-700 bg-purple-50", border: "border-purple-200", icon: Activity },
]

const CATEGORY_ICONS = {
    SYMPTOM: Activity,
    FUNCTION: User,
    PARTICIPATION: Briefcase,
}

export function TreatmentGoalManager({ 
    patientId, 
    targetedGoalIds, 
    onTargetedGoalsChange,
    goalAssessments,
    onGoalAssessmentsChange,
    disabled = false,
    previousTargetedGoals = []
}: TreatmentGoalManagerProps) {
    const [allGoals, setAllGoals] = React.useState<Goal[]>([])
    const [isCreateOpen, setIsCreateOpen] = React.useState(false)
    const [isExpanded, setIsExpanded] = React.useState(true)

    React.useEffect(() => {
        const fetchGoals = async () => {
            const goals = await getPatientGoalsAction(patientId)
            setAllGoals(goals as unknown as Goal[])
        }
        if (patientId) fetchGoals()
    }, [patientId, isCreateOpen])

    const handleToggleGoal = (goalId: string) => {
        if (targetedGoalIds.includes(goalId)) {
            onTargetedGoalsChange(targetedGoalIds.filter(id => id !== goalId))
            onGoalAssessmentsChange(goalAssessments.filter(a => a.goalId !== goalId))
        } else {
            onTargetedGoalsChange([...targetedGoalIds, goalId])
            // Initialize assessment with 0 (Target)
            onGoalAssessmentsChange([...goalAssessments, { goalId, score: 0, notes: "" }])
        }
    }

    const handleScoreChange = (goalId: string, score: number) => {
        const newAssessments = [...goalAssessments]
        const idx = newAssessments.findIndex(a => a.goalId === goalId)
        if (idx >= 0) {
            newAssessments[idx] = { ...newAssessments[idx], score }
        } else {
            newAssessments.push({ goalId, score, notes: "" })
        }
        onGoalAssessmentsChange(newAssessments)
    }

    const activeGoals = allGoals.filter(g => g.status === GoalStatus.ACTIVE)

    return (
        <Card className="border shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
                <div className="space-y-1">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Treatment Goals (GAS)
                    </CardTitle>
                    <CardDescription>
                        Review previous outcomes and set focus for this session.
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        onClick={() => setIsCreateOpen(true)} 
                        size="sm" 
                        type="button" 
                        variant="outline" 
                        className="h-8" 
                        disabled={disabled}
                    >
                        <Plus className="mr-2 h-3.5 w-3.5" />
                        New Long-term Goal
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                </div>
            </CardHeader>

            <GoalCreateDialog 
                patientId={patientId} 
                open={isCreateOpen} 
                onOpenChange={setIsCreateOpen} 
            />

            {isExpanded && (
                <CardContent className="space-y-6 px-4 pb-4">
                    {/* 1. Review Section: Goals targeted in PREVIOUS encounter */}
                    {previousTargetedGoals.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2">
                                <HistoryIcon className="h-3 w-3" />
                                Review Results (from previous session)
                            </h4>
                            <div className="grid gap-3">
                                {previousTargetedGoals.map(goal => {
                                    const assessment = goalAssessments.find(a => a.goalId === goal.id)
                                    const CatIcon = CATEGORY_ICONS[goal.category] || Target
                                    
                                    return (
                                        <div key={goal.id} className="border rounded-lg p-3 bg-blue-50/20">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex gap-2">
                                                    <CatIcon className="h-4 w-4 text-blue-600 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-semibold leading-tight">{goal.description}</p>
                                                        <Badge variant="outline" className="text-[9px] h-3 px-1 mt-1">{goal.category}</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-5 gap-1">
                                                {GAS_SCALE.map(s => (
                                                    <button
                                                        key={s.value}
                                                        type="button"
                                                        onClick={() => handleScoreChange(goal.id, s.value)}
                                                        className={cn(
                                                            "flex flex-col items-center p-1.5 rounded border text-[10px] transition-all",
                                                            assessment?.score === s.value 
                                                                ? s.color + " " + s.border + " font-bold shadow-sm ring-1 ring-blue-500/20"
                                                                : "bg-background border-muted hover:bg-muted/50 text-muted-foreground"
                                                        )}
                                                    >
                                                        <s.icon className="h-3 w-3 mb-0.5" />
                                                        {s.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* 2. Focus Selection Section: All Active Goals */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-2">
                            <Target className="h-3 w-3" />
                            Session Goal Focus
                        </h4>
                        
                        {activeGoals.length === 0 ? (
                            <div className="text-center py-6 border border-dashed rounded-lg text-xs text-muted-foreground">
                                No active clinical goals. Create one above to track progress.
                            </div>
                        ) : (
                            <div className="grid gap-2">
                                {activeGoals.map(goal => {
                                    const isTargeted = targetedGoalIds.includes(goal.id)
                                    const CatIcon = CATEGORY_ICONS[goal.category] || Target
                                    
                                    return (
                                        <div 
                                            key={goal.id} 
                                            className={cn(
                                                "border rounded-lg transition-all",
                                                isTargeted ? "bg-emerald-50/10 border-emerald-200 ring-1 ring-emerald-500/10 shadow-sm" : "hover:bg-muted/30"
                                            )}
                                        >
                                            <div className="p-3 flex items-start gap-3">
                                                <Checkbox 
                                                    id={`goal-${goal.id}`}
                                                    checked={isTargeted}
                                                    onCheckedChange={() => handleToggleGoal(goal.id)}
                                                    className="mt-1 border-emerald-500/50 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                                                />
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <CatIcon className={cn("h-3 w-3", isTargeted ? "text-emerald-600" : "text-muted-foreground")} />
                                                        <label 
                                                            htmlFor={`goal-${goal.id}`}
                                                            className="text-sm font-medium leading-none cursor-pointer"
                                                        >
                                                            {goal.description}
                                                        </label>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-[9px] h-3 px-1 uppercase tracking-tighter">{goal.category}</Badge>
                                                        {isTargeted && (
                                                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest animate-in fade-in slide-in-from-left-1">Targeted</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </CardContent>
            )}
        </Card>
    )
}