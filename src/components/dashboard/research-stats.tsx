import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Beaker } from "lucide-react"

interface ResearchStatsProps {
  followUpRate: number
  masBaselineRate: number
  masPeakRate: number
}

export function ResearchStats({
  followUpRate,
  masBaselineRate,
  masPeakRate,
}: ResearchStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardDescription>Follow-up Rate</CardDescription>
            <Beaker className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {Math.round(followUpRate)}%
          </CardTitle>
        </CardHeader>
        <CardContent>
           <Progress value={followUpRate} className="h-2" />
           <p className="text-xs text-muted-foreground mt-2">Target: &gt;50% for high quality data</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardDescription>MAS Baseline (Spastik)</CardDescription>
            <Beaker className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {Math.round(masBaselineRate)}%
          </CardTitle>
        </CardHeader>
        <CardContent>
           <Progress value={masBaselineRate} className="h-2" />
           <p className="text-xs text-muted-foreground mt-2">Injections with baseline score</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardDescription>MAS Peak (Spastik)</CardDescription>
            <Beaker className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {Math.round(masPeakRate)}%
          </CardTitle>
        </CardHeader>
        <CardContent>
           <Progress value={masPeakRate} className="h-2" />
           <p className="text-xs text-muted-foreground mt-2">Injections with peak effect score</p>
        </CardContent>
      </Card>
    </div>
  )
}
