import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Circle } from "lucide-react"
import { cn } from "@/lib/utils"

interface QualificationStatsProps {
  totalTreatments: number
  totalTreatmentsGoal: number
  withFollowUp: number
  withFollowUpGoal: number
  indicationsCovered: number
  indicationsCoveredGoal: number
  spastikDystonie: number
  spastikDystonieGoal: number
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
}: QualificationStatsProps) {
  const totalTreatmentsProgress = Math.min((totalTreatments / totalTreatmentsGoal) * 100, 100);
  const withFollowUpProgress = Math.min((withFollowUp / withFollowUpGoal) * 100, 100);
  const indicationsCoveredProgress = Math.min((indicationsCovered / indicationsCoveredGoal) * 100, 100);
  const spastikDystonieProgress = Math.min((spastikDystonie / spastikDystonieGoal) * 100, 100);

  const getStatusColor = (current: number, goal: number) => {
    if (current >= goal) return "text-green-500 fill-green-500"
    if (current >= goal * 0.8) return "text-yellow-500 fill-yellow-500"
    return "text-red-500 fill-red-500"
  }

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardDescription>Total Treatments</CardDescription>
            <Circle className={cn("h-3 w-3", getStatusColor(totalTreatments, totalTreatmentsGoal))} />
          </div>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalTreatments} <span className="text-sm font-normal text-muted-foreground">/ {totalTreatmentsGoal}</span>
          </CardTitle>
          <CardFooter className="flex-col items-start gap-1.5 text-sm p-0 pt-2">
            <Progress value={totalTreatmentsProgress} className="w-full" />
          </CardFooter>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardDescription>With Follow-up</CardDescription>
            <Circle className={cn("h-3 w-3", getStatusColor(withFollowUp, withFollowUpGoal))} />
          </div>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {withFollowUp} <span className="text-sm font-normal text-muted-foreground">/ {withFollowUpGoal}</span>
          </CardTitle>
          <CardFooter className="flex-col items-start gap-1.5 text-sm p-0 pt-2">
            <Progress value={withFollowUpProgress} className="w-full" />
          </CardFooter>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardDescription>Indications Covered</CardDescription>
            <Circle className={cn("h-3 w-3", getStatusColor(indicationsCovered, indicationsCoveredGoal))} />
          </div>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {indicationsCovered} <span className="text-sm font-normal text-muted-foreground">/ {indicationsCoveredGoal}</span>
          </CardTitle>
          <CardFooter className="flex-col items-start gap-1.5 text-sm p-0 pt-2">
            <Progress value={indicationsCoveredProgress} className="w-full" />
          </CardFooter>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardDescription>Spastik/Dystonie</CardDescription>
            <Circle className={cn("h-3 w-3", getStatusColor(spastikDystonie, spastikDystonieGoal))} />
          </div>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {spastikDystonie} <span className="text-sm font-normal text-muted-foreground">/ {spastikDystonieGoal}</span>
          </CardTitle>
          <CardFooter className="flex-col items-start gap-1.5 text-sm p-0 pt-2">
            <Progress value={spastikDystonieProgress} className="w-full" />
          </CardFooter>
        </CardHeader>
      </Card>
    </div>
  )
}
