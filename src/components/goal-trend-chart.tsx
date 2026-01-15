"use client"

import * as React from "react"
import { 
    Line, 
    LineChart, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Legend
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GoalCategory } from "@/generated/client/enums"
import { format } from "date-fns"

interface Assessment {
    score: number
    assessedAt: Date
}

interface Goal {
    id: string
    description: string
    category: GoalCategory
    assessments: Assessment[]
}

interface GoalTrendChartProps {
    goals: Goal[]
}

interface ChartDataItem {
    date: string
    timestamp: number
    [key: string]: string | number
}

export function GoalTrendChart({ goals }: GoalTrendChartProps) {
    // Flatten data for the chart
    // Format: { date: string, [goalId]: score }
    const chartDataMap: Record<string, ChartDataItem> = {}
    
    goals.forEach(goal => {
        goal.assessments.forEach(ass => {
            const dateKey = format(new Date(ass.assessedAt), "MMM d")
            if (!chartDataMap[dateKey]) {
                chartDataMap[dateKey] = { date: dateKey, timestamp: new Date(ass.assessedAt).getTime() }
            }
            chartDataMap[dateKey][goal.description.substring(0, 15) + "..."] = ass.score
        })
    })

    const chartData = Object.values(chartDataMap).sort((a, b) => a.timestamp - b.timestamp)

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

    if (goals.length === 0 || chartData.length === 0) return null

    return (
        <Card className="shadow-none border">
            <CardHeader>
                <CardTitle className="text-sm font-medium">Goal Attainment Trends (GAS)</CardTitle>
                <CardDescription>Progress over the last treatment cycles.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                            <XAxis 
                                dataKey="date" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                                dy={10}
                            />
                            <YAxis 
                                domain={[-2, 2]} 
                                ticks={[-2, -1, 0, 1, 2]}
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: "hsl(var(--popover))", 
                                    borderColor: "hsl(var(--border))", 
                                    borderRadius: "var(--radius)",
                                    fontSize: "12px"
                                }}
                            />
                            <Legend 
                                verticalAlign="bottom" 
                                align="center" 
                                wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} 
                            />
                            {goals.map((goal, idx) => (
                                <Line 
                                    key={goal.id}
                                    type="monotone" 
                                    dataKey={goal.description.substring(0, 15) + "..."} 
                                    stroke={COLORS[idx % COLORS.length]} 
                                    strokeWidth={2}
                                    dot={{ r: 4, fill: COLORS[idx % COLORS.length] }}
                                    activeDot={{ r: 6 }}
                                    animationDuration={1500}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
