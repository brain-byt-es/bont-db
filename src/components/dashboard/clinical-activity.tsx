"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { Lock, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const chartConfig = {
  count: {
    label: "Treatments",
    color: "#8b5cf6", // violet-500
  },
} satisfies ChartConfig

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

export function ActivityTrendCard({ trendData, isPro, className }: { trendData: TreatmentTrend[], isPro: boolean, className?: string }) {
  const displayTrend = isPro ? trendData : MOCK_TREND
  return (
      <Card className={cn("h-full", !isPro && "relative overflow-hidden", className)}>
        {!isPro && <LockOverlay title="Activity Insights" />}
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
                <TrendingUp className="h-4 w-4 text-violet-600" />
            </div>
            <div>
                <CardTitle className="text-sm font-medium">Clinical Activity</CardTitle>
                <CardDescription>Treatments per month</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className={cn("mt-4", !isPro && "blur-[2px] opacity-40")}>
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[250px] w-full"
            >
              <AreaChart data={displayTrend}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                />
                <ChartTooltip
                  cursor={{ stroke: "#8b5cf6", strokeWidth: 1 }}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Area 
                  type="natural" 
                  dataKey="count" 
                  stroke="#8b5cf6" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
  )
}

export function TopMusclesCard({ topMuscles, isPro, className }: { topMuscles: MuscleStat[], isPro: boolean, className?: string }) {
  const displayMuscles = isPro ? topMuscles : MOCK_MUSCLES
  return (
      <Card className={cn("h-full", !isPro && "relative overflow-hidden", className)}>
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
                        style={{ width: `${(muscle.count / (displayMuscles[0]?.count || 1)) * 100}%` }}
                      />
                    </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
  )
}

export function ClinicalActivity({ trendData, topMuscles, isPro }: ClinicalActivityProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ActivityTrendCard trendData={trendData} isPro={isPro} />
      <TopMusclesCard topMuscles={topMuscles} isPro={isPro} />
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