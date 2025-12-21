import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Circle, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface GoalCardProps {
  title: string
  current: number
  goal: number
  showGoal?: boolean
}

export function GoalCard({ title, current, goal, showGoal = true }: GoalCardProps) {
  const progress = Math.min((current / goal) * 100, 100)
  
  const getStatus = (c: number, g: number) => {
    if (c >= g) return { text: "Completed", color: "text-green-500", icon: CheckCircle2 }
    if (c >= g * 0.8) return { text: "On Track", color: "text-green-500", icon: Circle }
    if (c >= g * 0.5) return { text: "In Progress", color: "text-yellow-500", icon: Circle }
    return { text: "Action Needed", color: "text-red-500", icon: AlertCircle }
  }

  const status = getStatus(current, goal)
  const StatusIcon = status.icon

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between mb-1">
            <CardDescription className="text-xs font-medium uppercase tracking-wider">{title}</CardDescription>
            {showGoal && (
              <div className={cn("flex items-center gap-1 text-xs font-medium", status.color)}>
                <StatusIcon className="h-3 w-3" />
                <span>{status.text}</span>
              </div>
            )}
        </div>
        <CardTitle className="text-2xl font-bold tabular-nums">
          {current} {showGoal && <span className="text-sm font-normal text-muted-foreground">/ {goal}</span>}
        </CardTitle>
      </CardHeader>
      {showGoal && (
        <CardFooter className="p-4 pt-0">
          <Progress value={progress} className="h-2 w-full" indicatorClassName={status.color.replace("text-", "bg-")} />
        </CardFooter>
      )}
    </Card>
  )
}

interface QualificationStatsProps {
  totalTreatments: number
  totalTreatmentsGoal: number
  withFollowUp: number
  withFollowUpGoal: number
  indicationsCovered: number
  indicationsCoveredGoal: number
  spastikDystonie: number
  spastikDystonieGoal: number
  showGoals?: boolean
}

export function QualificationStats({
  totalTreatments,
  totalTreatmentsGoal,
  withFollowUp,
  withFollowUpGoal,
  indicationsCovered,
  indicationsCoveredGoal,
  spastikDystonie,
  spastikDystonieGoal,
  showGoals = true,
}: QualificationStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <GoalCard 
        title="Total Treatments" 
        current={totalTreatments} 
        goal={totalTreatmentsGoal} 
        showGoal={showGoals} 
      />
      <GoalCard 
        title="With Follow-up" 
        current={withFollowUp} 
        goal={withFollowUpGoal} 
        showGoal={showGoals} 
      />
      <GoalCard 
        title="Indications" 
        current={indicationsCovered} 
        goal={indicationsCoveredGoal} 
        showGoal={showGoals} 
      />
      <GoalCard 
        title="Spastik/Dystonie" 
        current={spastikDystonie} 
        goal={spastikDystonieGoal} 
        showGoal={showGoals} 
      />
    </div>
  )
}