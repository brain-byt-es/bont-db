"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
    CheckCircle2, 
    Circle, 
    ShieldCheck, 
    ArrowRight, 
    Stethoscope,
    Trophy,
    ChevronDown,
    ChevronUp
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useState, useEffect } from "react"

interface IndicationGroup {
    id: string
    name: string
    count: number
    met: boolean
}

interface CertificationRoadmapProps {
    data: {
        specialty: string
        totalProgress: number
        totalGoal: number
        followUpProgress: number
        followUpGoal: number
        indicationGroups: IndicationGroup[]
        rule25Met: boolean
        isEligibleFull: boolean
    }
}

export function CertificationRoadmap({ data }: CertificationRoadmapProps) {
    const [isOpen, setIsOpen] = useState(true)
    
    useEffect(() => {
        const saved = localStorage.getItem('injexpro_roadmap_open')
        if (saved !== null) {
            const timer = setTimeout(() => {
                setIsOpen(saved === 'true')
            }, 0)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        localStorage.setItem('injexpro_roadmap_open', open.toString())
    }

    const totalPercentage = Math.min((data.totalProgress / data.totalGoal) * 100, 100)
    const followUpPercentage = Math.min((data.followUpProgress / data.followUpGoal) * 100, 100)
    const coveredCount = data.indicationGroups.filter(g => g.met).length

    // Calculate Focus Progress (Max of Spasticity or Dystonia)
    const maxFocusCount = Math.max(
        ...data.indicationGroups
            .filter(g => ['spastik', 'dystonie'].includes(g.id.toLowerCase()))
            .map(g => g.count),
        0
    )
    const rule25Percentage = Math.min((maxFocusCount / 25) * 100, 100)

    return (
        <Collapsible open={isOpen} onOpenChange={handleOpenChange} className="space-y-4">
            <div className="flex items-center justify-between">
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="p-0 hover:bg-transparent hover:text-primary gap-2">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-6 w-6 text-primary" />
                            <h2 className="text-xl font-bold tracking-tight">Certification Roadmap</h2>
                        </div>
                        {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                </CollapsibleTrigger>
                <div className="flex items-center gap-3">
                    {!isOpen && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className={cn("font-medium", data.isEligibleFull ? "text-green-600" : "")}>{data.totalProgress}/{data.totalGoal} Treatments</span>
                        </div>
                    )}
                    <Badge variant={data.isEligibleFull ? "default" : "outline"} className={cn(data.isEligibleFull && "bg-green-600 hover:bg-green-700")}>
                        {data.isEligibleFull ? "Ready for Application" : "In Progress"}
                    </Badge>
                </div>
            </div>

            <CollapsibleContent className="animate-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 1. Main Progress Gates */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Stethoscope className="h-4 w-4 text-muted-foreground" />
                                Requirement Gates ({data.specialty})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {/* Total Treatments */}
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium">Total Treatments documented</span>
                                    <span className="text-muted-foreground">{data.totalProgress} / {data.totalGoal}</span>
                                </div>
                                <Progress value={totalPercentage} className="h-2" />
                                <p className="text-[11px] text-muted-foreground italic">
                                    Requirement: {data.totalGoal} independently performed injections.
                                </p>
                            </div>

                            {/* Success Control */}
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium">Clinical Success Controls (Follow-ups)</span>
                                    <span className="text-muted-foreground">{data.followUpProgress} / {data.followUpGoal}</span>
                                </div>
                                <Progress value={followUpPercentage} className="h-2 bg-muted" />
                                <p className="text-[11px] text-muted-foreground italic">
                                    Requirement: Min. 50% of treatments must have a documented clinical response.
                                </p>
                            </div>

                            {/* Indication Mix Grid */}
                            <div className="pt-4 border-t">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-medium">Indication Diversity</span>
                                    <span className="text-xs text-muted-foreground">{coveredCount} / 2 groups covered</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {data.indicationGroups.map(group => (
                                        <div key={group.id} className={cn(
                                            "p-3 rounded-lg border flex flex-col items-center text-center gap-1 transition-colors",
                                            group.met ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-dashed"
                                        )}>
                                            {group.met ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Circle className="h-4 w-4 text-muted-foreground/30" />}
                                            <span className="text-[10px] font-bold uppercase tracking-tight">{group.name}</span>
                                            <span className="text-xs font-semibold">{group.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2. Status & Milestone Cards */}
                    <div className="space-y-6">
                        <Card className={cn(data.rule25Met ? "bg-primary/5 border-primary/20" : "")}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-bold">The &quot;25 Rule&quot;</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-xs">Primary Focus</span>
                                        <span className="text-xs text-muted-foreground font-mono">{maxFocusCount} / 25</span>
                                    </div>
                                    <Progress value={rule25Percentage} className={cn("h-1.5", data.rule25Met ? "bg-primary/20" : "bg-muted")} indicatorClassName={data.rule25Met ? "bg-primary" : "bg-amber-500"} />
                                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                                        At least 25 treatments must be in Spasticity or Dystonia.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="h-fit">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Available Milestone</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Trophy className="h-8 w-8 text-amber-500 opacity-50" />
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-bold">Partial Certificate</p>
                                        <p className="text-[10px] text-muted-foreground">Spastic Syndrome</p>
                                    </div>
                                </div>
                                <Button className="w-full h-8 text-xs" variant="outline" asChild disabled={!data.isEligibleFull}>
                                    <Link href="/export?type=certification">
                                        Prepare Application <ArrowRight className="ml-2 h-3 w-3" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </CollapsibleContent>
        </Collapsible>
    )
}
