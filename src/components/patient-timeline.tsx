"use client"

import { format } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Activity, MapPin, FlaskConical } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimelineTreatment {
  id: string
  treatment_date: string
  treatment_site: string
  indication: string
  product: string
  total_units: number
  status: string
}

interface PatientTimelineProps {
  treatments: TimelineTreatment[]
}

export function PatientTimeline({ treatments }: PatientTimelineProps) {
  if (!treatments || treatments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Activity className="h-12 w-12 opacity-20 mb-4" />
        <p>No treatment history available for this patient.</p>
      </div>
    )
  }

  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-primary/50 before:via-border before:to-transparent">
      {treatments.map((treatment, index) => (
        <div key={treatment.id} className="relative flex items-start gap-6 animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
          {/* Timeline Dot */}
          <div className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full border bg-background shadow-sm ring-8 ring-background">
            <div className={cn(
                "h-2.5 w-2.5 rounded-full",
                treatment.status === 'SIGNED' ? "bg-primary" : "bg-amber-500 animate-pulse"
            )} />
          </div>

          <div className="ml-12 flex-1">
            <Card className={cn(
                "transition-all duration-300 hover:shadow-md border-l-4",
                treatment.status === 'SIGNED' ? "border-l-primary" : "border-l-amber-500"
            )}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(treatment.treatment_date), "PPP")}
                      {treatment.status !== 'SIGNED' && (
                          <Badge variant="outline" className="ml-2 text-[10px] text-amber-600 border-amber-200 bg-amber-50">Draft</Badge>
                      )}
                    </div>
                    <h4 className="text-lg font-bold capitalize">{treatment.indication}</h4>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 text-sm bg-muted/50 px-2.5 py-1 rounded-md border">
                        <FlaskConical className="h-3.5 w-3.5 text-primary" />
                        <span className="font-semibold">{treatment.total_units} U</span>
                        <span className="text-muted-foreground text-xs">{treatment.product}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{treatment.treatment_site}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ))}
    </div>
  )
}
