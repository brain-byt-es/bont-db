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
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
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
                    color: "hsl(var(--popover-foreground))" 
                  }}
                  itemStyle={{ color: "hsl(var(--primary))" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#8884d8" 
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
          <div className="space-y-4 mt-2">
            {topMuscles.length === 0 ? (
              <p className="text-sm text-muted-foreground">No muscle data recorded yet.</p>
            ) : (
              topMuscles.map((muscle, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-full space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{muscle.name}</span>
                      <span className="text-muted-foreground">{muscle.count}x</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${(muscle.count / topMuscles[0].count) * 100}%` }}
                      />
                    </div>
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
