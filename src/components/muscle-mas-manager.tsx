"use client"

import * as React from "react"
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table"
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Muscle } from "@/components/muscle-selector"
import { ProcedureStep } from "./procedure-steps-editor"
import { Activity } from "lucide-react"

interface MuscleMASManagerProps {
    steps: ProcedureStep[]
    onChange: (id: string, field: "mas_baseline" | "mas_peak", value: string) => void
    muscles: Muscle[]
    disabled?: boolean
}

const MAS_VALUES = ["0", "1", "1+", "2", "3", "4"]

export function MuscleMASManager({ steps, onChange, muscles, disabled = false }: MuscleMASManagerProps) {
    // Only show muscles that have been selected
    const activeSteps = steps.filter(s => !!s.muscle_id)

    if (activeSteps.length === 0) return null

    return (
        <Card className="border shadow-none bg-muted/5">
            <CardHeader className="pb-3 px-4 pt-4">
                <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Muscle-Specific MAS Scores</CardTitle>
                </div>
                <CardDescription className="text-xs">
                    Record Modified Ashworth Scale for the targeted muscles.
                </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4">
                <div className="rounded-md border bg-background overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="h-10">
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest">Muscle</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest w-[100px]">Side</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest w-[120px]">Baseline</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest w-[120px]">Peak Effect</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activeSteps.map((step) => {
                                const muscleName = muscles.find(m => m.id === step.muscle_id)?.name || "Unknown Muscle"
                                return (
                                    <TableRow key={step.id} className="h-12 hover:bg-transparent">
                                        <TableCell className="py-2">
                                            <span className="text-sm font-medium">{muscleName}</span>
                                        </TableCell>
                                        <TableCell className="py-2">
                                            <span className="text-xs text-muted-foreground">{step.side}</span>
                                        </TableCell>
                                        <TableCell className="py-2">
                                            <Select 
                                                value={step.mas_baseline || ""} 
                                                onValueChange={(val) => onChange(step.id, "mas_baseline", val)}
                                                disabled={disabled}
                                            >
                                                <SelectTrigger className="h-8 text-xs">
                                                    <SelectValue placeholder="-" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {MAS_VALUES.map(v => <SelectItem key={v} value={v} className="text-xs">{v}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="py-2">
                                            <Select 
                                                value={step.mas_peak || ""} 
                                                onValueChange={(val) => onChange(step.id, "mas_peak", val)}
                                                disabled={disabled}
                                            >
                                                <SelectTrigger className="h-8 text-xs">
                                                    <SelectValue placeholder="-" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {MAS_VALUES.map(v => <SelectItem key={v} value={v} className="text-xs">{v}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
