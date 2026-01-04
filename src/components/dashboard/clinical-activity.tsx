"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts"
import { Lock } from "lucide-react"
import { cn } from "@/lib/utils"

interface TreatmentTrend {
  date: string
  count: number
}

interface MuscleStat {
  name: string
  count: number
}

interface ClinicalActivityProps {
  trendData: TreatmentTrend[]
  topMuscles: MuscleStat[]
  isPro: boolean
}

export function ClinicalActivity({ trendData, topMuscles, isPro }: ClinicalActivityProps) {
  const displayTrend = isPro ? trendData : MOCK_TREND
  const displayMuscles = isPro ? topMuscles : MOCK_MUSCLES

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className={cn(!isPro && "relative overflow-hidden")}>
        {!isPro && <LockOverlay title="Activity Insights" />}
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Treatments over Time</CardTitle>
          <CardDescription>Last 6 months activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={cn("h-[200px] w-full mt-4", !isPro && "blur-[2px] opacity-40")}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayTrend}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  hide 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--popover))", 
                    borderColor: "hsl(var(--border))", 
                    borderRadius: "var(--radius)",
                    color: "hsl(var(--popover-foreground))",
                    boxShadow: "var(--shadow-sm)"
                  }}
                  itemStyle={{ color: "hsl(var(--primary))" }}
                  cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1, strokeDasharray: "4 4" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className={cn(!isPro && "relative overflow-hidden")}>
        {!isPro && <LockOverlay title="Anatomical Trends" />}
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Top Injected Muscles (Spastik)</CardTitle>
          <CardDescription>Most frequent targets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={cn("space-y-5 mt-4", !isPro && "blur-[2px] opacity-40")}>
            {displayMuscles.length === 0 ? (
              <p className="text-sm text-muted-foreground">No muscle data recorded yet.</p>
            ) : (
              displayMuscles.map((muscle, index) => (
                <div key={index} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{muscle.name}</span>
                      <span className="text-xs text-muted-foreground tabular-nums font-medium bg-muted px-1.5 py-0.5 rounded-md">{muscle.count}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/50">
                      <div
                        className="h-full bg-primary transition-all duration-500 ease-in-out"
                        style={{ width: `${(muscle.count / displayMuscles[0].count) * 100}%` }}
                      />
                    </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function LockOverlay({ title }: { title: string }) {
    return (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/5 p-6 text-center backdrop-blur-[1px]">
            <div className="rounded-full bg-background border shadow-sm p-3 mb-3">
                <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold">{title}</p>
            <p className="text-[10px] text-muted-foreground max-w-[150px]">Upgrade to analyze clinic activity.</p>
        </div>
    )
}

const MOCK_TREND = [
    { date: '1', count: 10 },
    { date: '2', count: 15 },
    { date: '3', count: 12 },
    { date: '4', count: 20 },
    { date: '5', count: 18 },
]

const MOCK_MUSCLES = [
    { name: 'M. gastrocnemius', count: 45 },
    { name: 'M. soleus', count: 38 },
    { name: 'M. biceps brachii', count: 32 },
    { name: 'M. pectoralis major', count: 28 },
]
