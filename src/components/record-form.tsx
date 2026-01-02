"use client"

import { useState, useTransition, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Save, ChevronDown, Wand2 } from "lucide-react"
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
  assessments?: Assessment[];
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

interface RecordFormProps {
  patients: { id: string; patient_code: string }[]
  defaultSubjectId?: string
  initialData?: InitialFormData
  treatmentId?: string
  isEditing?: boolean
}

export function RecordForm({ 
  patients, 
  defaultSubjectId, 
  initialData, 
  treatmentId, 
  isEditing = false
}: RecordFormProps) {
  const [steps, setSteps] = useState<ProcedureStep[]>(initialData?.steps || [])
  const [assessments, setAssessments] = useState<Assessment[]>(initialData?.assessments || [])
  const [muscles, setMuscles] = useState<Muscle[]>([])
  const [regions, setRegions] = useState<MuscleRegion[]>([])
  const [isPending, startTransition] = useTransition()
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

  const categoryValue = form.watch("category")

  useEffect(() => {
    const fetchData = async () => {
        const [m, r] = await Promise.all([getMuscles(), getMuscleRegions()])
        setMuscles(m)
        setRegions(r)
    }
    fetchData()
  }, [])

  // Manual Template Loader for Migraine
  const loadMigraineTemplate = () => {
    const templateMuscles: { name: string; side: ProcedureStep["side"]; units: number }[] = [
        { name: "M. corrugator supercilii", side: "Left", units: 5 },
        { name: "M. corrugator supercilii", side: "Right", units: 5 },
        { name: "M. procerus", side: "Midline", units: 5 },
        { name: "M. frontalis", side: "Left", units: 10 },
        { name: "M. frontalis", side: "Right", units: 10 },
        { name: "M. temporalis", side: "Left", units: 20 },
        { name: "M. temporalis", side: "Right", units: 20 },
        { name: "M. occipitalis", side: "Left", units: 15 },
        { name: "M. occipitalis", side: "Right", units: 15 },
        { name: "M. trapezius", side: "Left", units: 15 },
        { name: "M. trapezius", side: "Right", units: 15 },
        { name: "M. paraspinalis (cervical)", side: "Left", units: 10 },
        { name: "M. paraspinalis (cervical)", side: "Right", units: 10 }
    ]

    const newSteps = templateMuscles.map((t): ProcedureStep | null => {
        const muscleDef = muscles.find(m => m.name === t.name)
        if (!muscleDef) return null
        return {
            id: Math.random().toString(36).substr(2, 9),
            muscle_id: muscleDef.id,
            side: t.side,
            numeric_value: t.units,
            mas_baseline: "",
            mas_peak: ""
        }
    }).filter((item): item is ProcedureStep => item !== null)

    if (newSteps.length > 0) {
        setSteps(newSteps)
        toast.success("Standard migraine protocol (PREMPT) loaded.")
    } else {
        toast.error("Template muscles not found in database.")
    }
  }

  // Autosave & Load Draft
  useEffect(() => {
    if (isEditing) return
    const savedDraft = localStorage.getItem("bont_treatment_draft")
    if (savedDraft && !initialData) {
        try {
            const draft = JSON.parse(savedDraft)
            if (new Date().getTime() - new Date(draft.timestamp).getTime() < 24 * 60 * 60 * 1000) {
                const { values, steps: draftSteps, assessments: draftAssessments } = draft
                if (!form.getValues("subject_id")) {
                    form.reset({ ...values, date: values.date ? new Date(values.date) : new Date() })
                    if (draftSteps) setSteps(draftSteps)
                    if (draftAssessments) setAssessments(draftAssessments.map((a: Assessment & { assessed_at: string }) => ({ ...a, assessed_at: new Date(a.assessed_at) })))
                    toast.info("Draft restored")
                }
            }
        } catch (e) { console.error(e) }
    }
  }, [isEditing, initialData, form])

  // Save draft
  useEffect(() => {
    if (isEditing) return
    const subscription = form.watch((value) => {
        const draft = { values: value, steps, assessments, timestamp: new Date() }
        localStorage.setItem("bont_treatment_draft", JSON.stringify(draft))
    })
    return () => subscription.unsubscribe()
  }, [form, steps, assessments, isEditing])

  // Fetch latest treatment for defaults (only sets if empty)
  const subjectId = form.watch("subject_id")
  useEffect(() => {
    if (isEditing || !subjectId) return

    const fetchLatest = async () => {
        const latest = await getLatestTreatment(subjectId)
        if (latest) {
             const currentValues = form.getValues()
             if (!currentValues.product_label) form.setValue("product_label", latest.product)
             if (!currentValues.location || currentValues.location === "Main Clinic") form.setValue("location", latest.treatment_site)
             if (!currentValues.category) form.setValue("category", latest.indication)
        }
    }
    fetchLatest()
  }, [subjectId, isEditing, form])

  const copyLastTreatmentFull = async () => {
      const currentSubjectId = form.getValues("subject_id")
      if (!currentSubjectId) return
      const latest = await getLatestTreatment(currentSubjectId)
      if (latest) {
          form.setValue("product_label", latest.product, { shouldValidate: true })
          form.setValue("location", latest.treatment_site, { shouldValidate: true })
          form.setValue("category", latest.indication, { shouldValidate: true })
          if (latest.effect_notes) form.setValue("notes", latest.effect_notes, { shouldValidate: true })

          if (latest.injections) {
              const newSteps = (latest.injections as InjectionData[]).map((inj) => ({
                id: Math.random().toString(36).substr(2, 9),
                muscle_id: inj.muscleId || inj.muscle || '',
                side: (inj.side === 'L' ? 'Left' : inj.side === 'R' ? 'Right' : inj.side === 'B' ? 'Bilateral' : 'Bilateral') as ProcedureStep["side"],
                numeric_value: Number(inj.units),
                mas_baseline: inj.injectionAssessments?.find((a) => a.timepoint === 'baseline')?.valueText || "",
                mas_peak: inj.injectionAssessments?.find((a) => a.timepoint === 'peak_effect')?.valueText || ""
              }))
              setSteps(newSteps)
          }

          if (latest.assessments) {
              const newAssessments = (latest.assessments as any[]).map((a) => ({
                  id: Math.random().toString(36).substr(2, 9),
                  scale: a.scale,
                  timepoint: a.timepoint,
                  value: a.valueNum || 0,
                  assessed_at: new Date(),
                  notes: a.notes || ""
              }))
              setAssessments(newAssessments)
          }

          toast.success("Last treatment data copied.")
      } else {
          toast.info("No previous treatment found.")
      }
  }

  const processSubmission = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      try {
        const result = isEditing && treatmentId 
          ? await updateTreatment(treatmentId, { ...values, steps, assessments })
          : await createTreatment({ ...values, steps, assessments });

        if (result && 'error' in result) {
          toast.error(result.error)
          return
        }
        toast.success(isEditing ? "Updated" : "Saved")
        if (!isEditing) localStorage.removeItem("bont_treatment_draft")
        router.push(values.subject_id ? `/patients/${values.subject_id}` : "/patients")
      } catch (e) {
        toast.error("Error saving record")
      }
    })
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    const validation = validatePII(values.notes)
    if (validation.isCritical) {
        setPiiDetected(validation.detected); setPendingValues(values); setShowPiiWarning(true);
        return
    }
    processSubmission(values)
  }

  const totalUnits = steps.reduce((sum, step) => sum + (step.numeric_value || 0), 0)

  return (
    <>
    <PiiWarningDialog open={showPiiWarning} onOpenChange={setShowPiiWarning} detectedTypes={piiDetected} onConfirm={() => { setShowPiiWarning(false); if (pendingValues) processSubmission(pendingValues) }} onCancel={() => setShowPiiWarning(false)} />
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {!isEditing && form.watch("subject_id") && (
            <div className="flex justify-end gap-2">
                {categoryValue === 'kopfschmerz' && (
                    <Button variant="secondary" size="sm" type="button" onClick={loadMigraineTemplate}>
                        <Wand2 className="mr-2 h-4 w-4" /> Load PREMPT
                    </Button>
                )}
                <Button variant="outline" size="sm" type="button" onClick={copyLastTreatmentFull} className="bg-primary/5 text-primary">
                    <Save className="mr-2 h-4 w-4" /> Copy last visit
                </Button>
            </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField control={form.control} name="subject_id" render={({ field }) => (
              <FormItem><FormLabel>Patient</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger></FormControl><SelectContent>{patients.map((s) => (<SelectItem key={s.id} value={s.id}>{s.patient_code}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="date" render={({ field }) => (
              <FormItem className="flex flex-col"><FormLabel>Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date()} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl><SelectContent><SelectItem value="kopfschmerz">Headache</SelectItem><SelectItem value="dystonie">Dystonia</SelectItem><SelectItem value="spastik">Spasticity</SelectItem><SelectItem value="autonom">Autonomous</SelectItem><SelectItem value="andere">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="product_label" render={({ field }) => (
              <FormItem><FormLabel>Product</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Botox">Botox</SelectItem><SelectItem value="Dysport">Dysport</SelectItem><SelectItem value="Xeomin">Xeomin</SelectItem><SelectItem value="Myobloc">Myobloc</SelectItem></SelectContent></Select><FormMessage /></FormItem>
          )} />
        </div>
        
        <div className="space-y-4">
             <ProcedureStepsEditor steps={steps} onChange={setSteps} muscles={muscles} regions={regions} />
             <div className="flex justify-end font-bold text-xl">Total: {totalUnits} Units</div>
        </div>

        <Collapsible>
          <div className="flex items-center space-x-2">
            <CollapsibleTrigger asChild><Button variant="ghost" size="sm" className="w-full justify-between">Assessments (Optional) <ChevronDown className="h-4 w-4" /></Button></CollapsibleTrigger>
          </div>
          <CollapsibleContent className="mt-4"><AssessmentManager assessments={assessments} onChange={setAssessments} indication={categoryValue} /></CollapsibleContent>
        </Collapsible>

        <FormField control={form.control} name="notes" render={({ field }) => (
            <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea placeholder="..." className="resize-none" {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <div className="flex gap-4">
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save Record"}</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </Form>
    </>
  )
}