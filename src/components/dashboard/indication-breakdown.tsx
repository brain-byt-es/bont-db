"use client"

import * as React from "react"
import { Pie, PieChart, Cell } from "recharts"
import { Lock } from "lucide-react"
import { cn } from "@/lib/utils"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943']; // Placeholder colors

interface IndicationBreakdownProps {
  data: { name: string; value: number }[]
  isPro: boolean
}

export function IndicationBreakdown({ data, isPro }: IndicationBreakdownProps) {
  const displayData = isPro ? data : MOCK_PIE_DATA

  const chartConfig = displayData.reduce((acc, item, index) => {
    acc[item.name] = {
      label: item.name,
      color: COLORS[index % COLORS.length],
    };
    return acc;
  }, {} as ChartConfig);

  return (
    <Card className={cn("flex flex-col relative overflow-hidden", !isPro && "border-dashed")}>
      {!isPro && <LockOverlay title="Indication Mix" />}
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-sm font-medium">Indication Breakdown</CardTitle>
        <CardDescription>
          Distribution of treatments
        </CardDescription>
      </CardHeader>
      <CardContent className={cn("flex-1 pb-0", !isPro && "blur-[2px] opacity-40")}>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[250px]"
        >
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={displayData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={80}
              strokeWidth={5}
            >
              {displayData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className={cn("flex-col gap-2 text-sm", !isPro && "blur-[2px] opacity-40")}>
        {displayData.length === 0 ? (
          <div className="text-muted-foreground">No data available</div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {displayData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="size-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="truncate max-w-[100px] text-xs">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}

function LockOverlay({ title }: { title: string }) {
    return (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/5 p-6 text-center backdrop-blur-[1px]">
            <div className="rounded-full bg-background border shadow-sm p-2 mb-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs font-semibold">{title}</p>
        </div>
    )
}

const MOCK_PIE_DATA = [
    { name: 'Spastik', value: 40 },
    { name: 'Dystonie', value: 25 },
    { name: 'Headache', value: 20 },
    { name: 'Other', value: 15 },
]
