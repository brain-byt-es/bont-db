"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts"

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
}

export function ClinicalActivity({ trendData, topMuscles }: ClinicalActivityProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Treatments over Time</CardTitle>
          <CardDescription>Last 6 months activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
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

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Top Injected Muscles (Spastik)</CardTitle>
          <CardDescription>Most frequent targets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-5 mt-4">
            {topMuscles.length === 0 ? (
              <p className="text-sm text-muted-foreground">No muscle data recorded yet.</p>
            ) : (
              topMuscles.map((muscle, index) => (
                <div key={index} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{muscle.name}</span>
                      <span className="text-xs text-muted-foreground tabular-nums font-medium bg-muted px-1.5 py-0.5 rounded-md">{muscle.count}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/50">
                      <div
                        className="h-full bg-primary transition-all duration-500 ease-in-out"
                        style={{ width: `${(muscle.count / topMuscles[0].count) * 100}%` }}
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
