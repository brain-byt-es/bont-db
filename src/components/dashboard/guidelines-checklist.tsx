import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"

interface GuidelinesChecklistProps {
  totalTreatments: number
  totalTreatmentsGoal: number
  withFollowUp: number
  withFollowUpGoal: number
  spastikDystonie: number
  spastikDystonieGoal: number
}

export function GuidelinesChecklist({
  totalTreatments,
  totalTreatmentsGoal,
  withFollowUp,
  withFollowUpGoal,
  spastikDystonie,
  spastikDystonieGoal,
}: GuidelinesChecklistProps) {
  const totalTreatmentsFulfilled = totalTreatments >= totalTreatmentsGoal;
  const withFollowUpFulfilled = withFollowUp >= withFollowUpGoal;
  const spastikDystonieFulfilled = spastikDystonie >= spastikDystonieGoal;

  return (
    <Card className="col-span-full md:col-span-2">
      <CardHeader>
        <CardTitle>Guidelines Checklist</CardTitle>
        <CardDescription>
          Track your progress towards qualification goals.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox id="total-treatments-check" checked={totalTreatmentsFulfilled} disabled />
          <label
            htmlFor="total-treatments-check"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {totalTreatmentsGoal} Total Treatments
          </label>
          <Progress value={(totalTreatments / totalTreatmentsGoal) * 100} className="ml-auto w-3/5" />
          <span className="text-sm text-muted-foreground">{totalTreatments}/{totalTreatmentsGoal}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="follow-ups-check" checked={withFollowUpFulfilled} disabled />
          <label
            htmlFor="follow-ups-check"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {withFollowUpGoal} Follow-ups
          </label>
          <Progress value={(withFollowUp / withFollowUpGoal) * 100} className="ml-auto w-3/5" />
          <span className="text-sm text-muted-foreground">{withFollowUp}/{withFollowUpGoal}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="spastik-dystonie-check" checked={spastikDystonieFulfilled} disabled />
          <label
            htmlFor="spastik-dystonie-check"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {spastikDystonieGoal} Spastik/Dystonie
          </label>
          <Progress value={(spastikDystonie / spastikDystonieGoal) * 100} className="ml-auto w-3/5" />
          <span className="text-sm text-muted-foreground">{spastikDystonie}/{spastikDystonieGoal}</span>
        </div>
      </CardContent>
    </Card>
  )
}
