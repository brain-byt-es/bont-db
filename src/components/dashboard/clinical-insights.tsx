"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart,
  Pie,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Cell,
  Legend,
  Tooltip
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { Lock, TrendingUp, FlaskConical, PieChart as PieIcon, Activity, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { PricingDialog } from "@/components/pricing-dialog"

const outcomeConfig = {
  improvement: {
    label: "Improvement",
    color: "#10b981", // emerald-500
  },
} satisfies ChartConfig

interface OutcomeTrend {
  date: string
  improvement: number
}

interface DoseStat {
  name: string
  avgUnits: number
}

interface MixStat {
  name: string
  value: number
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function OutcomeTrendsCard({ outcomeTrends, isPro, className, showBadge }: { outcomeTrends: OutcomeTrend[], isPro: boolean, className?: string, showBadge?: boolean }) {
  return (
        <Card className={cn("h-full", !isPro && "relative overflow-hidden", className)}>
          {!isPro && !showBadge && <LockOverlay />}
          <CardHeader>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-medium">MAS Improvement</CardTitle>
                        <CardDescription>Average therapeutic gain over time</CardDescription>
                    </div>
                </div>
                {showBadge && <Badge variant="secondary" className="text-[10px] font-normal bg-muted text-muted-foreground border-muted-foreground/20">Sample Data</Badge>}
            </div>
          </CardHeader>
          <CardContent>
            <div className={cn("mt-4", !isPro && !showBadge && "blur-[2px] opacity-40")}>
              <ChartContainer
                config={outcomeConfig}
                className="aspect-auto h-[250px] w-full"
              >
                <LineChart data={isPro ? outcomeTrends : MOCK_OUTCOME_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tickMargin={10}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    width={30}
                  />
                  <ChartTooltip
                    cursor={{ stroke: "#10b981", strokeWidth: 1 }}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Line 
                    type="natural" 
                    dataKey="improvement" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    dot={{ fill: "hsl(var(--background))", stroke: "#10b981", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    animationDuration={1500}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
  )
}

export function DoseDistributionCard({ dosePerIndication, isPro, className }: { dosePerIndication: DoseStat[], isPro: boolean, className?: string }) {
  const chartConfig = {
    avgUnits: {
      label: "Avg Units",
      color: "#3b82f6", // blue-500
    },
  } satisfies ChartConfig

  return (
        <Card className={cn("h-full", !isPro && "relative overflow-hidden", className)}>
          {!isPro && <LockOverlay />}
          <CardHeader>
            <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <FlaskConical className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                    <CardTitle className="text-sm font-medium">Average Dosage</CardTitle>
                    <CardDescription>Units per indication</CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className={cn("mt-4", !isPro && "blur-[2px] opacity-40")}>
              <ChartContainer
                config={chartConfig}
                className="aspect-auto h-[250px] w-full"
              >
                <BarChart data={isPro ? dosePerIndication : MOCK_DOSE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickMargin={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    width={30}
                  />
                  <ChartTooltip
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                    content={<ChartTooltipContent indicator="dashed" />}
                  />
                  <Bar dataKey="avgUnits" radius={[4, 4, 0, 0]} barSize={30}>
                    {(isPro ? dosePerIndication : MOCK_DOSE_DATA).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
  )
}

export function CaseMixCard({ data, isPro, className }: { data: MixStat[], isPro: boolean, className?: string }) {
  return (
        <Card className={cn("h-full", !isPro && "relative overflow-hidden", className)}>
          {!isPro && <LockOverlay />}
          <CardHeader>
            <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <PieIcon className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                    <CardTitle className="text-sm font-medium">Case Mix</CardTitle>
                    <CardDescription>Indication breakdown</CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className={cn("h-[250px] w-full", !isPro && "blur-[2px] opacity-40")}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={isPro ? data : MOCK_MIX_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {(isPro ? data : MOCK_MIX_DATA).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                        backgroundColor: "hsl(var(--popover))", 
                        borderColor: "hsl(var(--border))", 
                        borderRadius: "var(--radius)",
                        fontSize: "12px"
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
  )
}

export function ProductUtilizationCard({ data, isPro, className }: { data: MixStat[], isPro: boolean, className?: string }) {
  const chartConfig = {
    value: {
      label: "Treatments",
      color: "#8b5cf6", // violet-500
    },
  } satisfies ChartConfig

  return (
        <Card className={cn("h-full", !isPro && "relative overflow-hidden", className)}>
          {!isPro && <LockOverlay />}
          <CardHeader>
            <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Activity className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                    <CardTitle className="text-sm font-medium">Product Mix</CardTitle>
                    <CardDescription>Toxin utilization</CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className={cn("mt-4", !isPro && "blur-[2px] opacity-40")}>
              <ChartContainer
                config={chartConfig}
                className="aspect-auto h-[250px] w-full"
              >
                <BarChart layout="vertical" data={isPro ? data : MOCK_PRODUCT_DATA} margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--muted))" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    width={70}
                  />
                  <ChartTooltip
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                    {(isPro ? data : MOCK_PRODUCT_DATA).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} opacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
  )
}

export function ClinicalInsightsPreview() {
    return (
        <div className="relative overflow-hidden rounded-xl border bg-background shadow-sm">
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm p-6 text-center">
                <div className="rounded-full bg-gradient-to-br from-primary/20 to-primary/5 p-4 mb-4 border border-primary/10">
                    <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-2">Unlock Clinical Intelligence</h3>
                <p className="text-sm text-muted-foreground max-w-md mb-6">
                    Gain deep visibility into your treatment outcomes, dosing patterns, and documentation quality.
                </p>
                <PricingDialog>
                    <Button size="lg" className="shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-primary/90 hover:to-primary text-primary-foreground">
                        <Lock className="mr-2 h-4 w-4" /> Unlock Pro Analytics
                    </Button>
                </PricingDialog>
            </div>
            
            {/* Background Content (Blurred) */}
            <div className="grid md:grid-cols-2 gap-6 p-6 opacity-50 pointer-events-none filter blur-[1px]">
                <OutcomeTrendsCard outcomeTrends={MOCK_OUTCOME_DATA} isPro={false} showBadge />
                <DoseDistributionCard dosePerIndication={MOCK_DOSE_DATA} isPro={false} />
            </div>
        </div>
    )
}

function LockOverlay() {
    return (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/5 p-6 text-center backdrop-blur-[1px]">
            <div className="rounded-full bg-background border shadow-sm p-3 mb-3">
                <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold">Pro Feature</p>
            <p className="text-[10px] text-muted-foreground max-w-[150px]">Upgrade to analyze clinical outcomes and dosage trends.</p>
        </div>
    )
}

const MOCK_OUTCOME_DATA = [
    { date: 'Jan', improvement: 1.2 },
    { date: 'Feb', improvement: 1.4 },
    { date: 'Mar', improvement: 1.3 },
    { date: 'Apr', improvement: 1.6 },
    { date: 'May', improvement: 1.8 },
]

const MOCK_DOSE_DATA = [
    { name: 'Spastik', avgUnits: 320 },
    { name: 'Dystonie', avgUnits: 150 },
    { name: 'Headache', avgUnits: 195 },
    { name: 'Other', avgUnits: 80 },
]

const MOCK_MIX_DATA = [
    { name: 'Spastik', value: 45 },
    { name: 'Dystonie', value: 25 },
    { name: 'Headache', value: 20 },
    { name: 'Other', value: 10 },
]

const MOCK_PRODUCT_DATA = [
    { name: 'Botox', value: 120 },
    { name: 'Xeomin', value: 85 },
    { name: 'Dysport', value: 40 },
    { name: 'Myobloc', value: 12 },
]
