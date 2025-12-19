"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { ProcedureStepsEditor, ProcedureStep } from "@/components/procedure-steps-editor"
import { createTreatment } from "@/app/(dashboard)/treatments/actions"
import { updateTreatment } from "@/app/(dashboard)/treatments/update-action"
import { toast } from "sonner"

const formSchema = z.object({
  subject_id: z.string().min(1, {
    message: "Please select a patient.",
  }),
  date: z.date(),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  category: z.string().min(1, {
    message: "Please select a category.",
  }),
  product_label: z.string().min(1, {
    message: "Please select a product.",
  }),
  notes: z.string().optional(),
})

interface InitialFormData {
  location?: string;
  subject_id?: string;
  date?: string | Date;
  category?: string;
  product_label?: string;
  notes?: string;
  steps?: ProcedureStep[];
}

interface RecordFormProps {
  patients: { id: string; patient_code: string }[]
  defaultSubjectId?: string
  initialData?: InitialFormData
  treatmentId?: string
  isEditing?: boolean
  onCancel?: () => void
  onSuccess?: () => void
}

export function RecordForm({ 
  patients, 
  defaultSubjectId, 
  initialData, 
  treatmentId, 
  isEditing = false,
  onCancel,
  onSuccess
}: RecordFormProps) {
  const [steps, setSteps] = useState<ProcedureStep[]>(initialData?.steps || [])
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: initialData?.location || "Main Clinic",
      subject_id: initialData?.subject_id || defaultSubjectId || "",
      date: initialData?.date ? new Date(initialData.date) : undefined,
      category: initialData?.category || "",
      product_label: initialData?.product_label || "",
      notes: initialData?.notes || "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        if (isEditing && treatmentId) {
          await updateTreatment(treatmentId, { ...values, steps })
          toast.success("Treatment updated")
        } else {
          await createTreatment({ ...values, steps })
          toast.success("Treatment record saved")
        }
        
        if (onSuccess) {
          onSuccess()
        } else {
          router.push(values.subject_id ? `/patients/${values.subject_id}` : "/patients")
        }
      } catch (error) {
        toast.error("Failed to save record")
        console.error(error)
      }
    })
  }

  const totalUnits = steps.reduce((sum, step) => sum + (step.numeric_value || 0), 0)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="subject_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patient</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a patient" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {patients.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.patient_code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date of Treatment</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    <SelectItem value="kopfschmerz">Headache</SelectItem>
                    <SelectItem value="dystonie">Dystonia</SelectItem>
                    <SelectItem value="spastik">Spasticity</SelectItem>
                    <SelectItem value="autonom">Autonomous</SelectItem>
                    <SelectItem value="andere">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="product_label"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Botox">Botox</SelectItem>
                    <SelectItem value="Dysport">Dysport</SelectItem>
                    <SelectItem value="Xeomin">Xeomin</SelectItem>
                    <SelectItem value="Myobloc">Myobloc</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <ProcedureStepsEditor steps={steps} onChange={setSteps} />

        <div className="flex justify-end">
           <div className="text-xl font-bold">Total: {totalUnits} Units</div>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Outcome / Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a little bit about the procedure..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : isEditing ? "Save Changes" : "Save Record"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onCancel ? onCancel() : router.back()}>Cancel</Button>
        </div>
      </form>
    </Form>
  )
}
