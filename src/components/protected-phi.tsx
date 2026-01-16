"use client"

import * as React from "react"
import { EyeOff, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { logPhiRevealAction } from "@/app/actions/audit"
import { toast } from "sonner"

interface ProtectedPhiProps {
    value: string
    label: string
    resourceType: string
    resourceId: string
    className?: string
    maskChar?: string
}

export function ProtectedPhi({ 
    value, 
    label, 
    resourceType, 
    resourceId, 
    className,
    maskChar = "•" 
}: ProtectedPhiProps) {
    const [isRevealed, setIsRevealed] = React.useState(false)
    const [isPending, startTransition] = React.useTransition()

    const handleReveal = () => {
        startTransition(async () => {
            try {
                await logPhiRevealAction(resourceType, resourceId, label)
                setIsRevealed(true)
                toast.info("Identity revealed (Logged)")
                
                // Optional: Auto-hide after 30 seconds
                setTimeout(() => setIsRevealed(false), 30000)
            } catch {
                toast.error("Failed to log access")
            }
        })
    }

    if (isRevealed) {
        return (
            <div className={cn("group flex items-center gap-2", className)}>
                <span>{value}</span>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-4 w-4 opacity-0 group-hover:opacity-50 hover:opacity-100 transition-opacity" 
                    onClick={() => setIsRevealed(false)}
                    title="Hide"
                >
                    <EyeOff className="h-3 w-3" />
                </Button>
            </div>
        )
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleReveal}
            disabled={isPending}
            className={cn(
                "h-auto p-0 font-mono text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5", 
                className
            )}
            title={`Reveal ${label}`}
        >
            <Lock className="h-3 w-3" />
            <span>{maskChar.repeat(8)}</span>
            <span className="sr-only">Reveal {label}</span>
        </Button>
    )
}
