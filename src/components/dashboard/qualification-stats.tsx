import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

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
  const totalTreatmentsProgress = (totalTreatments / totalTreatmentsGoal) * 100;
  const withFollowUpProgress = (withFollowUp / withFollowUpGoal) * 100;
  const indicationsCoveredProgress = (indicationsCovered / indicationsCoveredGoal) * 100;
  const spastikDystonieProgress = (spastikDystonie / spastikDystonieGoal) * 100;

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card>
        <CardHeader>
          <CardDescription>Total Treatments</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalTreatments}
          </CardTitle>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="font-medium">Goal: {totalTreatmentsGoal}</div>
            <Progress value={totalTreatmentsProgress} className="w-full" />
          </CardFooter>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>With Follow-up</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {withFollowUp}
          </CardTitle>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="font-medium">Goal: {withFollowUpGoal}</div>
            <Progress value={withFollowUpProgress} className="w-full" />
          </CardFooter>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Indications Covered</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {indicationsCovered}
          </CardTitle>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="font-medium">Goal: {indicationsCoveredGoal}</div>
            <Progress value={indicationsCoveredProgress} className="w-full" />
          </CardFooter>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Spastik/Dystonie</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {spastikDystonie}
          </CardTitle>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="font-medium">Goal: {spastikDystonieGoal}</div>
            <Progress value={spastikDystonieProgress} className="w-full" />
          </CardFooter>
        </CardHeader>
      </Card>
    </div>
  )
}
