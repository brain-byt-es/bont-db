import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface DocumentationQualityProps {
  followUpRateOverall: number
  followUpRateRecent: number
  masBaselineRate: number
  masPeakRate: number
  className?: string
}

function getProgressColor(value: number) {
  if (value >= 80) return "bg-emerald-500"
  if (value >= 50) return "bg-amber-500"
  return "bg-rose-500"
}

export function DocumentationQuality({
  followUpRateOverall,
  followUpRateRecent,
  masBaselineRate,
  masPeakRate,
  className
}: DocumentationQualityProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Research Readiness</CardTitle>
        <CardDescription>Data quality for future analysis</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Follow-up Rate (Last 90 Days)</span>
            <span className="text-muted-foreground tabular-nums">{Math.round(followUpRateRecent)}%</span>
          </div>
          <Progress 
            value={followUpRateRecent} 
            className="h-2 bg-secondary" 
            indicatorClassName={getProgressColor(followUpRateRecent)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Follow-up Rate (All Time)</span>
            <span className="text-muted-foreground tabular-nums">{Math.round(followUpRateOverall)}%</span>
          </div>
          <Progress 
             value={followUpRateOverall} 
             className="h-2 bg-secondary" 
             indicatorClassName={getProgressColor(followUpRateOverall)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-2">
             <div className="flex justify-between text-xs">
                <span className="font-medium text-muted-foreground">MAS Baseline</span>
                <span className="text-foreground font-medium tabular-nums">{Math.round(masBaselineRate)}%</span>
              </div>
             <Progress 
                value={masBaselineRate} 
                className="h-1.5 bg-secondary" 
                indicatorClassName={getProgressColor(masBaselineRate)}
             />
          </div>
          <div className="space-y-2">
             <div className="flex justify-between text-xs">
                <span className="font-medium text-muted-foreground">MAS Peak</span>
                <span className="text-foreground font-medium tabular-nums">{Math.round(masPeakRate)}%</span>
              </div>
             <Progress 
                value={masPeakRate} 
                className="h-1.5 bg-secondary" 
                indicatorClassName={getProgressColor(masPeakRate)}
             />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
