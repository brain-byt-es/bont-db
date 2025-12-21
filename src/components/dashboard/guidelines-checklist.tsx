"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { TreatmentDialog } from "@/components/treatment-create-dialog"

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
  const [dialogOpen, setDialogOpen] = useState(false)
  const [initialCategory, setInitialCategory] = useState<string | undefined>()

  const totalTreatmentsFulfilled = totalTreatments >= totalTreatmentsGoal;
  const withFollowUpFulfilled = withFollowUp >= withFollowUpGoal;
  const spastikDystonieFulfilled = spastikDystonie >= spastikDystonieGoal;

  const handleOpenDialog = (category?: string) => {
    setInitialCategory(category)
    setDialogOpen(true)
  }

  return (
    <>
      <TreatmentDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        initialData={initialCategory ? { category: initialCategory } : undefined}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Guidelines Checklist</CardTitle>
          <CardDescription>
            Track your progress towards qualification goals.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          
          {/* Total Treatments */}
          <div className="flex flex-col gap-2">
              <div className="flex items-center space-x-2">
              <Checkbox id="total-treatments-check" checked={totalTreatmentsFulfilled} disabled />
              <label
                  htmlFor="total-treatments-check"
                  className="text-sm font-medium leading-none"
              >
                  {totalTreatmentsGoal} Total Treatments
              </label>
              <span className="ml-auto text-sm text-muted-foreground">{totalTreatments}/{totalTreatmentsGoal}</span>
              </div>
              <Progress value={(totalTreatments / totalTreatmentsGoal) * 100} className="h-2" />
              {!totalTreatmentsFulfilled && (
                  <div className="flex justify-end">
                       <Button 
                          variant="link" 
                          size="sm" 
                          className="h-auto p-0 text-xs" 
                          onClick={() => handleOpenDialog()}
                        >
                          Log new treatment <ArrowRight className="ml-1 h-3 w-3" />
                       </Button>
                  </div>
              )}
          </div>

          {/* Follow-ups */}
          <div className="flex flex-col gap-2">
              <div className="flex items-center space-x-2">
              <Checkbox id="follow-ups-check" checked={withFollowUpFulfilled} disabled />
              <label
                  htmlFor="follow-ups-check"
                  className="text-sm font-medium leading-none"
              >
                  {withFollowUpGoal} Follow-ups
              </label>
              <span className="ml-auto text-sm text-muted-foreground">{withFollowUp}/{withFollowUpGoal}</span>
              </div>
              <Progress value={(withFollowUp / withFollowUpGoal) * 100} className="h-2" />
              {!withFollowUpFulfilled && (
                   <div className="flex justify-end">
                       <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
                          <Link href="/treatments?sort=date_asc">View treatments <ArrowRight className="ml-1 h-3 w-3" /></Link>
                       </Button>
                  </div>
              )}
          </div>

          {/* Indication */}
          <div className="flex flex-col gap-2">
              <div className="flex items-center space-x-2">
              <Checkbox id="spastik-dystonie-check" checked={spastikDystonieFulfilled} disabled />
              <label
                  htmlFor="spastik-dystonie-check"
                  className="text-sm font-medium leading-none"
              >
                  {spastikDystonieGoal} Spastik/Dystonie
              </label>
              <span className="ml-auto text-sm text-muted-foreground">{spastikDystonie}/{spastikDystonieGoal}</span>
              </div>
              <Progress value={(spastikDystonie / spastikDystonieGoal) * 100} className="h-2" />
               {!spastikDystonieFulfilled && (
                   <div className="flex justify-end">
                       <Button 
                          variant="link" 
                          size="sm" 
                          className="h-auto p-0 text-xs" 
                          onClick={() => handleOpenDialog("spastik")}
                        >
                          New Spastik treatment <ArrowRight className="ml-1 h-3 w-3" />
                       </Button>
                  </div>
              )}
          </div>

        </CardContent>
      </Card>
    </>
  )
}
