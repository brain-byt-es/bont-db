"use client"

import * as React from "react"
import { Lock, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { getPatientIdentity } from "@/app/(dashboard)/patients/actions"
import { toast } from "sonner"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface PatientIdentityRevealerProps {
    patientId: string
    className?: string
}

export function PatientIdentityRevealer({ patientId, className }: PatientIdentityRevealerProps) {
    const [identity, setIdentity] = React.useState<{ ehrPatientId: string, birthYear?: number | null, dateOfBirth?: Date | null } | null>(null)
    const [isPending, startTransition] = React.useTransition()

    const handleReveal = () => {
        startTransition(async () => {
            try {
                const data = await getPatientIdentity(patientId)
                if (data) {
                    setIdentity(data)
                    toast.success("Identity revealed (Audit Logged)")
                } else {
                    toast.error("Identity not found")
                }
            } catch {
                toast.error("Failed to access PHI")
            }
        })
    }

    if (identity) {
        return (
            <div className={cn("flex flex-col text-sm animate-in fade-in duration-300", className)}>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Verified Identity</span>
                </div>
                <div className="font-mono">
                    {identity.ehrPatientId}
                </div>
                {identity.dateOfBirth && (
                    <div className="text-xs text-muted-foreground">
                        DOB: {format(new Date(identity.dateOfBirth), "PPP")}
                    </div>
                )}
            </div>
        )
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className={cn("h-auto py-1 px-2 text-muted-foreground bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-muted-foreground/20", className)}
                        onClick={handleReveal}
                        disabled={isPending}
                    >
                        <Lock className="mr-1.5 h-3 w-3" />
                        <span className="text-xs font-medium">Reveal Identity</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Break-glass access. This action will be audited.</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
