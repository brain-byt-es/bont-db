import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface DocumentationQualityProps {
  followUpRateOverall: number
  followUpRateRecent: number
  masBaselineRate: number
  masPeakRate: number
}

export function DocumentationQuality({
  followUpRateOverall,
  followUpRateRecent,
  masBaselineRate,
  masPeakRate
}: DocumentationQualityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Research Readiness</CardTitle>
        <CardDescription>Data quality for future analysis</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Follow-up Rate (Last 90 Days)</span>
            <span className="text-muted-foreground">{Math.round(followUpRateRecent)}%</span>
          </div>
          <Progress value={followUpRateRecent} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Follow-up Rate (All Time)</span>
            <span className="text-muted-foreground">{Math.round(followUpRateOverall)}%</span>
          </div>
          <Progress value={followUpRateOverall} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-2">
             <div className="flex justify-between text-xs">
                <span className="font-medium">MAS Baseline</span>
                <span className="text-muted-foreground">{Math.round(masBaselineRate)}%</span>
              </div>
             <Progress value={masBaselineRate} className="h-1.5" />
          </div>
          <div className="space-y-2">
             <div className="flex justify-between text-xs">
                <span className="font-medium">MAS Peak</span>
                <span className="text-muted-foreground">{Math.round(masPeakRate)}%</span>
              </div>
             <Progress value={masPeakRate} className="h-1.5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
