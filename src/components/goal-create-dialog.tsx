"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle 
} from "@/components/ui/dialog"
import { 
    Form, 
    FormControl, 
    FormField, 
    FormItem, 
    FormLabel, 
    FormMessage 
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select"
import { GoalCategory } from "@/generated/client/enums"
import { createGoalAction } from "@/app/(dashboard)/patients/goal-actions"
import { toast } from "sonner"

const goalSchema = z.object({
    description: z.string().min(5, "Description is too short").max(140),
    category: z.nativeEnum(GoalCategory),
    indication: z.string().optional(),
    targetRegion: z.string().optional(),
    baselineScore: z.string()
})

interface GoalCreateDialogProps {
    patientId: string
    open: boolean
    onOpenChange: (open: boolean) => void
}

const GAS_SCALE = [
    { value: "-2", label: "Worse (-2)" },
    { value: "-1", label: "Partial (-1)" },
    { value: "0", label: "Target (0)" },
    { value: "1", label: "Better (+1)" },
    { value: "2", label: "Exceeds (+2)" },
]

export function GoalCreateDialog({ patientId, open, onOpenChange }: GoalCreateDialogProps) {
    const [isPending, startTransition] = React.useTransition()
    
    const form = useForm<z.infer<typeof goalSchema>>({
        resolver: zodResolver(goalSchema),
        defaultValues: {
            description: "",
            category: GoalCategory.FUNCTION,
            baselineScore: "-1"
        }
    })

    function onSubmit(values: z.infer<typeof goalSchema>) {
        startTransition(async () => {
            try {
                await createGoalAction({
                    patientId,
                    ...values,
                    baselineScore: parseInt(values.baselineScore)
                })
                toast.success("Goal created")
                onOpenChange(false)
                form.reset()
            } catch {
                toast.error("Failed to create goal")
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>New Clinical Goal</DialogTitle>
                    <DialogDescription>Define a SMART goal and set the initial baseline score.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value={GoalCategory.SYMPTOM}>Symptom Reduction</SelectItem>
                                            <SelectItem value={GoalCategory.FUNCTION}>Functional Improvement</SelectItem>
                                            <SelectItem value={GoalCategory.PARTICIPATION}>Participation/QoL</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (SMART)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Walk 500m to the bakery..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="indication"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Indication</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Spastik" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="targetRegion"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Target Region</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Lower Limb" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="baselineScore"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Baseline GAS Score</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {GAS_SCALE.map(s => (
                                                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4">
                            <Button type="submit" disabled={isPending}>
                                {isPending ? "Creating..." : "Create Goal"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
