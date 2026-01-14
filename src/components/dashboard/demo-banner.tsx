"use client"

import { AlertCircle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTransition } from "react"
import { toast } from "sonner"

interface DemoBannerProps {
    organizationName: string
    resetIntervalHours?: number
}

export function DemoBanner({ organizationName, resetIntervalHours = 4 }: DemoBannerProps) {
    const [isPending, startTransition] = useTransition()

    const handleReset = () => {
        // In a real implementation, this would call a reset action.
        // For now, we just show a toast to simulate the "Resettable" nature.
        startTransition(async () => {
            toast.promise(new Promise(res => setTimeout(res, 2000)), {
                loading: "Resetting demo environment...",
                success: "Demo data restored to canonical state.",
                error: "Reset failed."
            })
        })
    }

    return (
        <div className="bg-primary/10 border-b border-primary/20 py-2 px-4 flex items-center justify-between text-xs md:text-sm">
            <div className="flex items-center gap-2 text-primary font-medium">
                <AlertCircle className="h-4 w-4" />
                <span>
                    <strong>Demo Mode:</strong> You are viewing <span className="underline decoration-dotted">{organizationName}</span>. 
                    Changes are temporary and reset every {resetIntervalHours} hours.
                </span>
            </div>
            <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-[10px] uppercase tracking-wider font-bold bg-background"
                onClick={handleReset}
                disabled={isPending}
            >
                <RotateCcw className="mr-1.5 h-3 w-3" />
                Reset Demo
            </Button>
        </div>
    )
}
