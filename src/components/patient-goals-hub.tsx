"use client"

import * as React from "react"
import { 
    Target, 
    Plus, 
    TrendingUp, 
    CheckCircle2, 
    MoreHorizontal,
    Flag,
    Activity,
    User,
    Briefcase,
    History
} from "lucide-react"
import { format } from "date-fns"
import { GoalCategory, GoalStatus } from "@/generated/client/enums"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { addGoalAssessmentAction, updateGoalStatusAction } from "@/app/(dashboard)/patients/goal-actions"
import { toast } from "sonner"
import { GoalCreateDialog } from "./goal-create-dialog"

export interface Assessment {
    id: string
    score: number
    notes: string | null
    assessedAt: Date
    isBaseline: boolean
    assessedByMembership: {
        user: { displayName: string }
    }
}

export interface Goal {
    id: string
    description: string
    category: GoalCategory
    status: GoalStatus
    createdAt: Date
    indication: string | null
    targetRegion: string | null
    assessments: Assessment[]
}

interface PatientGoalsHubProps {
    patientId: string
    initialGoals: Goal[]
}

const GAS_SCALE = [
    { value: -2, label: "Worse", color: "text-red-600 bg-red-50", border: "border-red-200" },
    { value: -1, label: "Partial", color: "text-amber-600 bg-amber-50", border: "border-amber-200" },
    { value: 0, label: "Target", color: "text-emerald-600 bg-emerald-50", border: "border-emerald-200" },
    { value: 1, label: "Better", color: "text-blue-600 bg-blue-50", border: "border-blue-200" },
    { value: 2, label: "Exceeds", color: "text-purple-600 bg-purple-50", border: "border-purple-200" },
]

const CATEGORY_ICONS = {
    SYMPTOM: Activity,
    FUNCTION: User,
    PARTICIPATION: Briefcase,
}

export function PatientGoalsHub({ patientId, initialGoals }: PatientGoalsHubProps) {
    const [goals] = React.useState<Goal[]>(initialGoals)
    const [, startTransition] = React.useTransition()
    const [isCreateOpen, setIsCreateOpen] = React.useState(false)

    const activeGoals = goals.filter(g => g.status === GoalStatus.ACTIVE)

    const handleQuickScore = (goalId: string, score: number) => {
        startTransition(async () => {
            try {
                await addGoalAssessmentAction({ goalId, score, notes: "Quick assessment from Patient Hub" })
                toast.success("Goal score updated")
            } catch {
                toast.error("Failed to update goal")
            }
        })
    }

    const handleStatusUpdate = (goalId: string, status: GoalStatus) => {
        startTransition(async () => {
            try {
                await updateGoalStatusAction(goalId, status)
                toast.success(`Goal marked as ${status.toLowerCase()}`)
            } catch {
                toast.error("Failed to update status")
            }
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        Living Goals (GAS)
                    </h3>
                    <p className="text-sm text-muted-foreground">Long-term treatment objectives and attainment scaling.</p>
                </div>
                <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Long-term Goal
                </Button>
            </div>

            <GoalCreateDialog 
                patientId={patientId} 
                open={isCreateOpen} 
                onOpenChange={setIsCreateOpen} 
            />

            {activeGoals.length === 0 ? (
                <Card className="border-dashed shadow-none">
                    <CardContent className="py-10 text-center space-y-3">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                            <Flag className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-medium">No active goals</p>
                            <p className="text-xs text-muted-foreground">Define clinical goals to track longitudinal treatment efficacy.</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {activeGoals.map(goal => {
                        const latestAssessment = goal.assessments[0]
                        const CatIcon = CATEGORY_ICONS[goal.category] || Target
                        
                        return (
                            <Card key={goal.id} className="overflow-hidden border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-0">
                                    <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-start gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
                                                <CatIcon className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-[10px] h-4 px-1.5 uppercase font-bold tracking-tighter">
                                                        {goal.category}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">Set {format(new Date(goal.createdAt), "MMM d, yyyy")}</span>
                                                </div>
                                                <p className="font-bold text-base leading-tight">{goal.description}</p>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    {goal.indication && <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> {goal.indication}</span>}
                                                    {goal.targetRegion && <span className="flex items-center gap-1"><History className="h-3 w-3" /> {goal.targetRegion}</span>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 bg-muted/30 p-2 rounded-xl border border-muted">
                                            <div className="px-2 border-r border-muted min-w-[100px]">
                                                <p className="text-[10px] font-bold uppercase text-muted-foreground">Current GAS</p>
                                                {latestAssessment ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={cn(
                                                            "text-lg font-black",
                                                            latestAssessment.score >= 0 ? "text-emerald-600" : "text-amber-600"
                                                        )}>
                                                            {latestAssessment.score > 0 ? "+" : ""}{latestAssessment.score}
                                                        </span>
                                                        <Badge className={cn(
                                                            "text-[10px] h-4 py-0 font-normal",
                                                            GAS_SCALE.find(s => s.value === latestAssessment.score)?.color
                                                        )}>
                                                            {GAS_SCALE.find(s => s.value === latestAssessment.score)?.label}
                                                        </Badge>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-lg font-black text-muted-foreground">--</span>
                                                        <Badge variant="outline" className="text-[10px] h-4 py-0 font-normal">
                                                            Pending
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex gap-1">
                                                {GAS_SCALE.map(s => (
                                                    <button
                                                        key={s.value}
                                                        onClick={() => handleQuickScore(goal.id, s.value)}
                                                        className={cn(
                                                            "h-8 w-8 rounded flex items-center justify-center text-[10px] font-bold transition-all border",
                                                            latestAssessment?.score === s.value 
                                                                ? s.color + " " + s.border + " scale-110 shadow-sm"
                                                                : "bg-background hover:bg-muted text-muted-foreground border-transparent"
                                                        )}
                                                        title={s.label}
                                                    >
                                                        {s.value > 0 ? "+" : ""}{s.value}
                                                    </button>
                                                ))}
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(goal.id, GoalStatus.ACHIEVED)}>
                                                        <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-600" />
                                                        Mark Achieved
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(goal.id, GoalStatus.RETIRED)}>
                                                        <TrendingUp className="h-4 w-4 mr-2 text-muted-foreground" />
                                                        Retire Goal
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem>View Assessment History</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}