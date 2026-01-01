"use client"

import { useState, useTransition, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Save, AlertTriangle, ChevronDown } from "lucide-react"
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { ProcedureStepsEditor, ProcedureStep } from "@/components/procedure-steps-editor"
import { AssessmentManager, Assessment } from "@/components/assessment-manager"
import { createTreatment, getMuscles, getMuscleRegions, getLatestTreatment } from "@/app/(dashboard)/treatments/actions"
import { updateTreatment } from "@/app/(dashboard)/treatments/update-action"
import { toast } from "sonner"
import { Muscle, MuscleRegion } from "@/components/muscle-selector"
import { PiiWarningDialog } from "@/components/pii-warning-dialog"
import { validatePII } from "@/lib/pii-validation"

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

interface InjectionAssessment {
  timepoint: string;
  scale: string;
  valueText: string;
}

interface InjectionData {
  muscleId: string | null;
  muscle?: string | null;
  side: string;
  units: number;
  injectionAssessments: InjectionAssessment[];
}

interface DBAssessment {
  scale: string;
  timepoint: string;
  value: number;
  notes: string;
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
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [muscles, setMuscles] = useState<Muscle[]>([])
  const [regions, setRegions] = useState<MuscleRegion[]>([])
  const [isPending, startTransition] = useTransition()
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const router = useRouter()

  const [showPiiWarning, setShowPiiWarning] = useState(false)
  const [piiDetected, setPiiDetected] = useState<string[]>([])
  const [pendingValues, setPendingValues] = useState<z.infer<typeof formSchema> | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: initialData?.location || "Main Clinic",
      subject_id: initialData?.subject_id || defaultSubjectId || "",
      date: initialData?.date ? new Date(initialData.date) : new Date(),
      category: initialData?.category || "",
      product_label: initialData?.product_label || "",
      notes: initialData?.notes || "",
    },
  })

  // Watch notes for soft warning
  const notesValue = form.watch("notes")
  const piiResult = validatePII(notesValue)

  // Fetch Muscles and Regions
  useEffect(() => {
    const fetchData = async () => {
        const [m, r] = await Promise.all([getMuscles(), getMuscleRegions()])
        setMuscles(m)
        setRegions(r)
    }
    fetchData()
  }, [])

  // Autosave & Load Draft
  useEffect(() => {
    if (isEditing) return

    // Load draft
    const savedDraft = localStorage.getItem("bont_treatment_draft")
    if (savedDraft && !initialData) {
        try {
            const draft = JSON.parse(savedDraft)
            // Only load if it's less than 24h old
            if (new Date().getTime() - new Date(draft.timestamp).getTime() < 24 * 60 * 60 * 1000) {
                const { values, steps: draftSteps, assessments: draftAssessments } = draft
                // Only populate if form is mostly empty (default state)
                if (!form.getValues("subject_id")) {
                    form.reset({
                        ...values,
                        date: values.date ? new Date(values.date) : new Date()
                    })
                    if (draftSteps) setSteps(draftSteps)
                    if (draftAssessments) setAssessments(draftAssessments.map((a: Assessment & { assessed_at: string }) => ({
                        ...a,
                        assessed_at: new Date(a.assessed_at)
                    })))
                    toast.info("Draft restored from local storage")
                }
            }
        } catch (e) {
            console.error("Failed to load draft", e)
        }
    }
  }, [isEditing, initialData, form])

  // Save draft on change
  useEffect(() => {
    if (isEditing) return

    // eslint-disable-next-line react-hooks/incompatible-library
    const subscription = form.watch((value) => {
        const draft = {
            values: value,
            steps,
            assessments,
            timestamp: new Date()
        }
        localStorage.setItem("bont_treatment_draft", JSON.stringify(draft))
        setLastSaved(new Date())
    })
    return () => subscription.unsubscribe()
  }, [form, steps, assessments, isEditing])

  // Fetch latest treatment for defaults
  const subjectId = form.watch("subject_id")
  useEffect(() => {
    if (isEditing || !subjectId) return

    const fetchLatest = async () => {
        const latest = await getLatestTreatment(subjectId)
        if (latest) {
             // Only set if field is empty (or default)
             const currentValues = form.getValues()
             if (!currentValues.product_label) form.setValue("product_label", latest.product)
             if (!currentValues.location || currentValues.location === "Main Clinic") form.setValue("location", latest.treatment_site)
             if (!currentValues.category) form.setValue("category", latest.indication)
             
             // Toast suggestion for copying steps
             // logic moved to button
        }
    }
    fetchLatest()
  }, [subjectId, isEditing, form])

  const copyLastTreatmentFull = async () => {
      if (!subjectId) return
      const latest = await getLatestTreatment(subjectId)
      if (latest) {
          // Fields
          form.setValue("product_label", latest.product)
          form.setValue("location", latest.treatment_site)
          form.setValue("category", latest.indication)
          if (latest.effect_notes) form.setValue("notes", latest.effect_notes)

          // Injections
          if (latest.injections) {
              const newSteps = (latest.injections as unknown as InjectionData[]).map((inj) => {
                  const masBase = inj.injectionAssessments?.find((a) => a.timepoint === 'baseline' && a.scale === 'MAS')?.valueText
                  const masPeak = inj.injectionAssessments?.find((a) => a.timepoint === 'peak_effect' && a.scale === 'MAS')?.valueText
                  
                  return {
                    id: Math.random().toString(36).substr(2, 9),
                    muscle_id: inj.muscleId || inj.muscle || '', // Handle both Prisma and Legacy if needed
                    side: (inj.side === 'L' ? 'Left' : inj.side === 'R' ? 'Right' : inj.side === 'B' ? 'Bilateral' : 'Bilateral') as "Left" | "Right" | "Bilateral" | "Midline",
                    numeric_value: Number(inj.units),
                    mas_baseline: masBase || "",
                    mas_peak: masPeak || ""
                  }
              })
              setSteps(newSteps)
          }

          // Global Assessments
          if (latest.assessments) {
              const newAssessments = (latest.assessments as unknown as DBAssessment[]).map((a) => ({
                  id: Math.random().toString(36).substr(2, 9),
                  scale: a.scale,
                  timepoint: a.timepoint,
                  value: a.value,
                  assessed_at: new Date(), 
                  notes: a.notes
              }))
              setAssessments(newAssessments)
          }

          toast.success("Copied full treatment data from last visit")
      } else {
          toast.info("No previous treatment found")
      }
  }

  const processSubmission = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      try {
        if (isEditing && treatmentId) {
          await updateTreatment(treatmentId, { ...values, steps }) 
          toast.success("Treatment updated")
        } else {
          await createTreatment({ ...values, steps, assessments })
          toast.success("Treatment record saved")
          localStorage.removeItem("bont_treatment_draft")
        }
        
        if (onSuccess) {
          onSuccess()
        } else {
          router.push(values.subject_id ? `/patients/${values.subject_id}` : "/patients")
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to save record"
        toast.error(message)
        console.error(error)
      }
    })
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    const validation = validatePII(values.notes)
    if (validation.isCritical) {
        setPiiDetected(validation.detected)
        setPendingValues(values)
        setShowPiiWarning(true)
        return
    }
    processSubmission(values)
  }

  const handlePiiConfirm = () => {
      setShowPiiWarning(false)
      if (pendingValues) {
          processSubmission(pendingValues)
          setPendingValues(null)
      }
  }

  const totalUnits = steps.reduce((sum, step) => sum + (step.numeric_value || 0), 0)

  return (
    <>
    <PiiWarningDialog 
        open={showPiiWarning} 
        onOpenChange={setShowPiiWarning}
        detectedTypes={piiDetected}
        onConfirm={handlePiiConfirm}
        onCancel={() => setShowPiiWarning(false)}
    />
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Header Actions */}
        {!isEditing && subjectId && (
            <div className="flex justify-end">
                <Button variant="outline" type="button" onClick={copyLastTreatmentFull} className="w-full sm:w-auto bg-primary/5 border-primary/20 hover:bg-primary/10 text-primary">
                    <Save className="mr-2 h-4 w-4" /> {/* Reusing Save icon or similar implies 'Load' */}
                    Copy from last treatment
                </Button>
            </div>
        )}

        {lastSaved && !isEditing && (
            <div className="text-xs text-muted-foreground text-right flex items-center justify-end gap-1">
                <Save className="h-3 w-3" />
                Draft saved {format(lastSaved, "HH:mm:ss")}
            </div>
        )}

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
        
        <div className="space-y-4">
             <div className="flex justify-end">
                {!isEditing && subjectId && (
                    <Button variant="outline" size="sm" type="button" onClick={copyLastTreatmentFull} className="w-full sm:w-auto bg-primary/5 border-primary/20 hover:bg-primary/10 text-primary">
                        <Save className="mr-2 h-4 w-4" /> {/* Reusing Save icon or similar implies 'Load' */}
                        Copy from last treatment
                    </Button>
                )}
             </div>
             <ProcedureStepsEditor 
                steps={steps} 
                onChange={setSteps} 
                muscles={muscles}
                regions={regions}
             />
             {form.watch("category") === "spastik" && steps.length > 0 && !steps.some(s => s.mas_baseline) && (
                 <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
                     <AlertTriangle className="h-4 w-4" />
                     <span>Recommended Baseline Score (MAS) missing.</span>
                 </div>
             )}
        </div>

        <div className="flex justify-end">
           <div className="text-xl font-bold">Total: {totalUnits} Units</div>
        </div>

        <Collapsible>
          <div className="flex items-center space-x-2">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between">
                Additional Assessments (Optional)
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="mt-4">
            <AssessmentManager 
                assessments={assessments} 
                onChange={setAssessments} 
                indication={form.watch("category")} 
            />
          </CollapsibleContent>
        </Collapsible>

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
              {piiResult.score > 0 && (
                  <div className="text-xs text-yellow-600 flex items-center gap-1 mt-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Possible PII detected: {piiResult.detected.join(", ")}</span>
                  </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col sm:flex-row gap-4">
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              {isPending ? "Saving..." : isEditing ? "Save Changes" : "Save Record"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onCancel ? onCancel() : router.back()} className="w-full sm:w-auto">Cancel</Button>
        </div>
      </form>
    </Form>
    </>
  )
}