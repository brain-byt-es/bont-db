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
  Tooltip, 
  ResponsiveContainer,
  Cell,
  Legend
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { Lock, TrendingUp, FlaskConical, PieChart as PieIcon, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

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

interface ClinicalInsightsProps {
  outcomeTrends: OutcomeTrend[]
  dosePerIndication: DoseStat[]
  caseMix: MixStat[]
  productUtilization: MixStat[]
  isPro: boolean
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function OutcomeTrendsCard({ outcomeTrends, isPro, className }: { outcomeTrends: OutcomeTrend[], isPro: boolean, className?: string }) {
  return (
        <Card className={cn("h-full", !isPro && "relative overflow-hidden", className)}>
          {!isPro && <LockOverlay />}
          <CardHeader>
            <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-medium">Outcome Progress</CardTitle>
            </div>
            <CardDescription>Average MAS improvement score over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={cn("h-[250px] w-full mt-4", !isPro && "blur-[2px] opacity-40")}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={isPro ? outcomeTrends : MOCK_OUTCOME_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                        backgroundColor: "hsl(var(--popover))", 
                        borderColor: "hsl(var(--border))", 
                        borderRadius: "var(--radius)" 
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="improvement" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3} 
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
  )
}

export function DoseDistributionCard({ dosePerIndication, isPro, className }: { dosePerIndication: DoseStat[], isPro: boolean, className?: string }) {
  return (
        <Card className={cn("h-full", !isPro && "relative overflow-hidden", className)}>
          {!isPro && <LockOverlay />}
          <CardHeader>
            <div className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-medium">Average Dosage</CardTitle>
            </div>
            <CardDescription>Average units injected per primary indication</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={cn("h-[250px] w-full mt-4", !isPro && "blur-[2px] opacity-40")}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={isPro ? dosePerIndication : MOCK_DOSE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                    contentStyle={{ 
                        backgroundColor: "hsl(var(--popover))", 
                        borderColor: "hsl(var(--border))", 
                        borderRadius: "var(--radius)" 
                    }}
                  />
                  <Bar dataKey="avgUnits" radius={[4, 4, 0, 0]}>
                    {(isPro ? dosePerIndication : MOCK_DOSE_DATA).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
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
                <PieIcon className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-medium">Case Mix</CardTitle>
            </div>
            <CardDescription>Indication breakdown of signed treatments</CardDescription>
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
                  >
                    {(isPro ? data : MOCK_MIX_DATA).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                        backgroundColor: "hsl(var(--popover))", 
                        borderColor: "hsl(var(--border))", 
                        borderRadius: "var(--radius)" 
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
  )
}

export function ProductUtilizationCard({ data, isPro, className }: { data: MixStat[], isPro: boolean, className?: string }) {
  return (
        <Card className={cn("h-full", !isPro && "relative overflow-hidden", className)}>
          {!isPro && <LockOverlay />}
          <CardHeader>
            <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-medium">Product Mix</CardTitle>
            </div>
            <CardDescription>Frequency of toxins used in clinic</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={cn("h-[250px] w-full mt-4", !isPro && "blur-[2px] opacity-40")}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={isPro ? data : MOCK_PRODUCT_DATA} margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--muted))" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10 }}
                    width={80}
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                    contentStyle={{ 
                        backgroundColor: "hsl(var(--popover))", 
                        borderColor: "hsl(var(--border))", 
                        borderRadius: "var(--radius)" 
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                    {(isPro ? data : MOCK_PRODUCT_DATA).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} opacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
  )
}

export function ClinicalInsights({ 
    outcomeTrends, 
    dosePerIndication, 
    caseMix, 
    productUtilization, 
    isPro 
}: ClinicalInsightsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          Clinical Insights
          {!isPro && <Badge variant="secondary" className="font-normal">Upgrade to unlock</Badge>}
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <OutcomeTrendsCard outcomeTrends={outcomeTrends} isPro={isPro} />
        <DoseDistributionCard dosePerIndication={dosePerIndication} isPro={isPro} />
        <CaseMixCard data={caseMix} isPro={isPro} />
        <ProductUtilizationCard data={productUtilization} isPro={isPro} />
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