"use client"

import { useState, useTransition, useEffect, useRef } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Save, ChevronDown, Wand2, Lock, Unlock, Sparkles, Plus as PlusIcon, Settings2, Target, Activity, FileText, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { ProcedureStepsEditor, ProcedureStep } from "@/components/procedure-steps-editor"
import { AssessmentManager, Assessment } from "@/components/assessment-manager"
import { TreatmentGoalManager } from "@/components/treatment-goal-manager"
import { MuscleMASManager } from "@/components/muscle-mas-manager"
import { createTreatment, getMuscles, getMuscleRegions, getLatestTreatment, getProtocolsAction, saveProtocolAction, getPreviousGoalsAction } from "@/app/(dashboard)/treatments/actions"
import { updateTreatment } from "@/app/(dashboard)/treatments/update-action"
import { reopenTreatmentAction } from "@/app/(dashboard)/treatments/status-actions"
import { toast } from "sonner"
import { Muscle, MuscleRegion } from "@/components/muscle-selector"
import { PiiWarningDialog } from "@/components/pii-warning-dialog"
import { validatePII } from "@/lib/pii-validation"
import { checkPermission, PERMISSIONS, checkPlan } from "@/lib/permissions"
import { MembershipRole, Plan, GoalCategory, GoalStatus } from "@/generated/client/enums"
import { useAuthContext } from "@/components/auth-context-provider"
import { UpgradeDialog } from "@/components/upgrade-dialog"
import { Protocol } from "@/lib/dose-reference"
import { DiagnosisPicker } from "@/components/diagnosis-picker"
import { OrganizationPreferences } from "@/app/(dashboard)/settings/actions"
import { SAFETY_COPY } from "@/lib/safety-copy"

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
  diagnosis_id: z.string().optional(),
  product_label: z.string().min(1, {
    message: "Please select a product.",
  }),
  vial_size: z.number().min(1),
  dilution_ml: z.number().min(0.1),
  notes: z.string().optional(),
  is_supervised: z.boolean(),
  supervisor_name: z.string().optional(),
})

export interface InitialFormData {
  location?: string;
  subject_id?: string;
  date?: string | Date;
  category?: string;
  product_label?: string;
  vial_size?: number;
  dilution_ml?: number;
  notes?: string;
  steps?: ProcedureStep[];
  assessments?: Assessment[];
  targetedGoalIds?: string[];
  goalAssessments?: { goalId: string; score: number; notes?: string | null }[];
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
  volumeMl?: number;
}

interface RecordFormProps {
  patients: { id: string; patient_code: string }[]
  defaultSubjectId?: string
  initialData?: InitialFormData
  treatmentId?: string
  isEditing?: boolean
  onCancel?: () => void
  onSuccess?: () => void
  status?: string
  userRole?: string
  organization?: {
      name?: string
      preferences?: OrganizationPreferences | null
  }
}

interface Goal {
    id: string
    description: string
    category: GoalCategory
    status: GoalStatus
}

type StepId = 'context' | 'intent' | 'procedure' | 'review'

interface StepConfig {
    id: StepId
    title: string
    description: string
    icon: React.ElementType
}

const STEPS: StepConfig[] = [
    { id: 'context', title: 'Context', description: 'Product & Meta', icon: Settings2 },
    { id: 'procedure', title: 'Procedure', description: 'Injections', icon: Activity },
    { id: 'intent', title: 'Intent', description: 'Goals & GAS', icon: Target },
    { id: 'review', title: 'Review', description: 'Sign & Lock', icon: FileText },
]

interface PreviousAssessment {
    scale: string
    timepoint: string
    valueNum: number | null
    notes: string | null
}

export function RecordForm({
  patients,
  defaultSubjectId,
  initialData,
  treatmentId,
  isEditing = false,
  onCancel,
  onSuccess,
  status = "DRAFT",
  userRole: propUserRole,
  organization
}: RecordFormProps) {
  const { userRole: contextUserRole, userPlan } = useAuthContext()
  const userRole = contextUserRole || propUserRole || "READONLY"
  const isPro = checkPlan(userPlan as Plan, Plan.PRO)
  
  const isSigned = status === "SIGNED"
  const canWrite = checkPermission(userRole as MembershipRole, PERMISSIONS.WRITE_TREATMENTS)

  const [activeStep, setActiveStep] = useState<StepId>('context')
  const [steps, setSteps] = useState<ProcedureStep[]>(initialData?.steps || [])
  const [assessments, setAssessments] = useState<Assessment[]>(initialData?.assessments || [])
  
  // Longitudinal Goals
  const [targetedGoalIds, setTargetedGoalIds] = useState<string[]>(initialData?.targetedGoalIds || [])
  const [goalAssessments, setGoalAssessments] = useState<{ goalId: string; score: number; notes?: string | null }[]>(initialData?.goalAssessments || [])
  const [previousTargetedGoals, setPreviousTargetedGoals] = useState<Goal[]>([])

  const [muscles, setMuscles] = useState<Muscle[]>([])
  const [regions, setRegions] = useState<MuscleRegion[]>([])
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const hasRestoredDraft = useRef(false)

  const [showPiiWarning, setShowPiiWarning] = useState(false)
  const [showSignDialog, setShowSignDialog] = useState(false)
  const [showReopenDialog, setShowReopenDialog] = useState(false)
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [piiDetected, setPiiDetected] = useState<string[]>([])
  const [pendingValues, setPendingValues] = useState<z.infer<typeof formSchema> | null>(null)
  const [reopenReason, setReopenReason] = useState("")
  const [isSmartFilled, setIsSmartFilled] = useState(false)
  const [protocols, setProtocols] = useState<Protocol[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: initialData?.location || organization?.name || "Clinic",
      subject_id: initialData?.subject_id || defaultSubjectId || "",
      date: initialData?.date ? new Date(initialData.date) : new Date(),
      category: initialData?.category || "",
      product_label: initialData?.product_label || "",
      vial_size: initialData?.vial_size || (isPro ? organization?.preferences?.standard_vial_size : 100) || 100,
      dilution_ml: initialData?.dilution_ml || (isPro ? organization?.preferences?.standard_dilution_ml : 2.5) || 2.5,
      notes: initialData?.notes || "",
      is_supervised: false,
      supervisor_name: organization?.preferences?.default_supervisor_name || "",
    },
  })

  const watchedValues = useWatch({ control: form.control })
  const categoryValue = watchedValues.category
  const productValue = watchedValues.product_label
  const vialSize = watchedValues.vial_size || 100
  const dilutionMl = watchedValues.dilution_ml || 2.5
  const unitsPerMl = vialSize / dilutionMl

  const DILUTION_PRESETS = [
    { label: "100 U in 2.5 ml (Standard)", vial: 100, dilution: 2.5 },
    { label: "100 U in 2.0 ml", vial: 100, dilution: 2.0 },
    { label: "100 U in 1.0 ml (High)", vial: 100, dilution: 1.0 },
    { label: "50 U in 1.25 ml", vial: 50, dilution: 1.25 },
    { label: "500 U in 2.5 ml (Dysport)", vial: 500, dilution: 2.5 },
  ]

  const applyPreset = (preset: typeof DILUTION_PRESETS[0]) => {
      form.setValue("vial_size", preset.vial, { shouldValidate: true })
      form.setValue("dilution_ml", preset.dilution, { shouldValidate: true })
      toast.info(`Applied preset: ${preset.label}`)
  }

  const subjectId = form.watch("subject_id")
  useEffect(() => {
    if (isEditing || !subjectId) return

    const fetchData = async () => {
        const [latest, prevGoalsData] = await Promise.all([
            getLatestTreatment(subjectId),
            getPreviousGoalsAction(subjectId)
        ])

        if (prevGoalsData) {
            setPreviousTargetedGoals(prevGoalsData.goals as Goal[])
            if (prevGoalsData.goals.length > 0) {
                setGoalAssessments(prevGoalsData.goals.map((g: Goal) => ({ goalId: g.id, score: 0, notes: "" })))
            }
        } else {
            setPreviousTargetedGoals([])
        }

        if (latest) {
             if (!isPro) return
             form.setValue("product_label", latest.product, { shouldValidate: true })
             form.setValue("location", latest.treatment_site, { shouldValidate: true })
             form.setValue("category", latest.indication, { shouldValidate: true })
             if (latest.effect_notes) form.setValue("notes", latest.effect_notes, { shouldValidate: true })

             if (latest.injections && steps.length === 0) {
                 const newSteps = (latest.injections as InjectionData[]).map((inj) => ({
                   id: Math.random().toString(36).substr(2, 9),
                   muscle_id: inj.muscleId || inj.muscle || '',
                   side: (inj.side === 'L' ? 'Left' : inj.side === 'R' ? 'Right' : inj.side === 'B' ? 'Bilateral' : 'Bilateral') as ProcedureStep["side"],
                   numeric_value: Number(inj.units),
                   volume_ml: inj.volumeMl || undefined,
                   mas_baseline: inj.injectionAssessments?.find((a) => a.timepoint === 'baseline')?.valueText || "",
                   mas_peak: inj.injectionAssessments?.find((a) => a.timepoint === 'peak_effect')?.valueText || ""
                 }))
                 setSteps(newSteps)
             }
             setIsSmartFilled(true)
             toast.success(`Dose History: ${SAFETY_COPY.REFERENCE_ONLY}`)
        }
    }
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId, isEditing, isPro])

  useEffect(() => {
    if (!categoryValue) return
    const fetchProtocols = async () => {
        const p = await getProtocolsAction(categoryValue)
        setProtocols(p)
    }
    fetchProtocols()
  }, [categoryValue])

  useEffect(() => {
    const fetchData = async () => {
        const [m, r] = await Promise.all([getMuscles(), getMuscleRegions()])
        setMuscles(m)
        setRegions(r)
    }
    fetchData()
  }, [])

  const applyProtocol = (protocol: Protocol & { isCustom?: boolean }) => {
    if (!isPro) {
        setShowUpgradeDialog(true)
        return
    }

    const newSteps = protocol.steps.map((s: { muscleId?: string, muscleName?: string, units: number, side: string }): ProcedureStep | null => {
        let muscleDef = null
        if (protocol.isCustom && s.muscleId) {
            muscleDef = muscles.find(m => m.id === s.muscleId)
        } else {
            muscleDef = muscles.find(m => m.name === s.muscleName)
        }

        if (!muscleDef) return null
        return {
            id: Math.random().toString(36).substr(2, 9),
            muscle_id: muscleDef.id,
            side: s.side as ProcedureStep["side"],
            numeric_value: s.units,
            mas_baseline: "",
            mas_peak: ""
        }
    }).filter((item): item is ProcedureStep => item !== null)

    if (newSteps.length > 0) {
        setSteps(newSteps)
        toast.success(`${protocol.name} loaded.`)
    } else {
        toast.error("Protocol muscles not found in database.")
    }
  }

  const handleSaveProtocol = () => {
      if (!isPro) {
          setShowUpgradeDialog(true)
          return
      }
      const name = prompt("Enter a name for this protocol template:")
      if (!name) return
      startTransition(async () => {
          try {
              await saveProtocolAction(name, categoryValue || "andere", steps)
              toast.success("Protocol saved to 'My Protocols'")
              const p = await getProtocolsAction(categoryValue || "andere")
              setProtocols(p)
          } catch {
              toast.error("Failed to save protocol")
          }
      })
  }

  // Autosave Logic
  useEffect(() => {
    if (isEditing || hasRestoredDraft.current) return
    const savedDraft = localStorage.getItem("bont_treatment_draft")
    if (savedDraft && !initialData) {
        try {
            const draft = JSON.parse(savedDraft)
            if (new Date().getTime() - new Date(draft.timestamp).getTime() < 24 * 60 * 60 * 1000) {
                const { values, steps: draftSteps, assessments: draftAssessments, targetedGoalIds: draftGoalIds, goalAssessments: draftGoalAssessments } = draft
                if (defaultSubjectId && values.subject_id !== defaultSubjectId) return
                const hasContent = !!(values.notes?.trim()) || (draftSteps && draftSteps.length > 0) || (draftGoalIds && draftGoalIds.length > 0)
                if (hasContent) {
                    if (!form.getValues("subject_id")) {
                        form.reset({ ...values, date: values.date ? new Date(values.date) : new Date() })
                    }
                    if (draftSteps) setSteps(draftSteps)
                    if (draftAssessments) setAssessments(draftAssessments.map((a: Assessment & { assessed_at: string }) => ({ ...a, assessed_at: new Date(a.assessed_at) })))
                    if (draftGoalIds) setTargetedGoalIds(draftGoalIds)
                    if (draftGoalAssessments) setGoalAssessments(draftGoalAssessments)
                    hasRestoredDraft.current = true
                    toast.info("Unsaved draft restored")
                }
            }
        } catch (e) { console.error(e) }
    }
  }, [isEditing, initialData, form, defaultSubjectId])

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(() => {
    if (watchedValues || steps.length > 0 || assessments.length > 0 || targetedGoalIds.length > 0 || goalAssessments.length > 0) {
        setHasUnsavedChanges(true)
        if (!isEditing && watchedValues) {
            const draft = { values: watchedValues, steps, assessments, targetedGoalIds, goalAssessments, timestamp: new Date() }
            localStorage.setItem("bont_treatment_draft", JSON.stringify(draft))
        }
    }
  }, [watchedValues, steps, assessments, targetedGoalIds, goalAssessments, isEditing])

  const handleCopyLastVisit = () => {
      if (isPro) copyLastTreatmentFull()
      else setShowUpgradeDialog(true)
  }

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
              const newAssessments = (latest.assessments as unknown as PreviousAssessment[]).map((a) => ({
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

  const processSubmission = (values: z.infer<typeof formSchema>, targetStatus: "DRAFT" | "SIGNED" = "DRAFT") => {
    startTransition(async () => {
      try {
        const payload = { 
            ...values, 
            steps, 
            assessments, 
            targetedGoalIds,
            goalAssessments,
            status: targetStatus 
        }
        const result = isEditing && treatmentId ? await updateTreatment(treatmentId, payload) : await createTreatment(payload);
        if (result && 'error' in result) {
          toast.error(result.error)
          return
        }
        toast.success(isEditing ? "Updated" : "Saved")
        setHasUnsavedChanges(false)
        if (!isEditing) localStorage.removeItem("bont_treatment_draft")
        if (onSuccess) onSuccess()
        else router.push(values.subject_id ? `/patients/${values.subject_id}` : "/patients")
      } catch {
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
    processSubmission(values, "DRAFT")
  }

  const handleSign = () => setShowSignDialog(true)
  const confirmSign = () => {
      const values = form.getValues()
      processSubmission(values, "SIGNED")
      setShowSignDialog(false)
  }

  const handleReopen = () => treatmentId && setShowReopenDialog(true)
  const confirmReopen = () => {
      startTransition(async () => {
          try {
              if (!treatmentId) return
              await reopenTreatmentAction(treatmentId, reopenReason)
              toast.success("Treatment re-opened")
              router.refresh()
          } catch {
              toast.error("Failed to re-open treatment")
          }
      })
  }

  const confirmClear = () => {
      form.reset({
          subject_id: "",
          location: organization?.name || "Clinic",
          category: "",
          diagnosis_id: "",
          product_label: "",
          notes: "",
          vial_size: (isPro ? organization?.preferences?.standard_vial_size : 100) || 100,
          dilution_ml: (isPro ? organization?.preferences?.standard_dilution_ml : 2.5) || 2.5,
          date: new Date(),
          is_supervised: false,
          supervisor_name: organization?.preferences?.default_supervisor_name || "",
      })
      setSteps([]); setAssessments([]); setTargetedGoalIds([]); setGoalAssessments([]); setPreviousTargetedGoals([]); setHasUnsavedChanges(false)
      if (!isEditing) { localStorage.removeItem("bont_treatment_draft"); }
      toast.info("Form cleared"); setShowClearDialog(false)
  }

  const totalUnits = steps.reduce((sum, step) => sum + (step.numeric_value || 0), 0)

  // Navigation Logic
  const canGoNext = () => {
      if (activeStep === 'context') return !!watchedValues.subject_id && !!watchedValues.category && !!watchedValues.product_label
      return true
  }

  const navigateTo = (id: StepId) => {
      if (id !== 'context' && (!watchedValues.subject_id || !watchedValues.category || !watchedValues.product_label)) {
          setActiveStep('context')
          form.trigger(['subject_id', 'category', 'product_label'])
          toast.error("Please complete session context first")
          return
      }
      setActiveStep(id)
  }

  const nextStep = () => {
      const idx = STEPS.findIndex(s => s.id === activeStep)
      if (idx < STEPS.length - 1) navigateTo(STEPS[idx + 1].id)
  }

  const prevStep = () => {
      const idx = STEPS.findIndex(s => s.id === activeStep)
      if (idx > 0) navigateTo(STEPS[idx - 1].id)
  }

  return (
    <>
    <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Clear all entries?</AlertDialogTitle>
          <AlertDialogDescription>Discard all changes? This cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirmClear} className="bg-destructive text-destructive-foreground">Clear All</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog open={showSignDialog} onOpenChange={setShowSignDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sign & Finalize?</AlertDialogTitle>
          <AlertDialogDescription>Lock record to prevent further changes. Action is logged.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirmSign}>Sign Record</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog open={showReopenDialog} onOpenChange={setShowReopenDialog}>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>Re-open Record?</AlertDialogTitle></AlertDialogHeader>
        <div className="py-4 space-y-4">
            <Label htmlFor="reason">Reason for re-opening (Required)</Label>
            <Textarea id="reason" value={reopenReason} onChange={(e) => setReopenReason(e.target.value)} placeholder="Correction..." />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirmReopen} disabled={!reopenReason.trim()}>Re-open</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <UpgradeDialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog} title="Pro Features" featureName="Advanced Workflow" description="Standardize your clinical workflow with Pro defaults and audit logs." />
    <PiiWarningDialog open={showPiiWarning} onOpenChange={setShowPiiWarning} detectedTypes={piiDetected} onConfirm={() => { setShowPiiWarning(false); if (pendingValues) processSubmission(pendingValues) }} onCancel={() => setShowPiiWarning(false)} />

    <div className="flex flex-col md:flex-row h-full overflow-hidden bg-background">
        {/* Persistent Stepper Sidebar */}
        <div className="w-full md:w-64 bg-muted/30 border-r p-4 flex flex-col gap-2">
            {STEPS.map((step, idx) => {
                const Icon = step.icon
                const isActive = activeStep === step.id
                const isPast = STEPS.findIndex(s => s.id === activeStep) > idx
                
                return (
                    <button
                        key={step.id}
                        type="button"
                        onClick={() => navigateTo(step.id)}
                        className={cn(
                            "flex items-center gap-3 p-3 rounded-lg text-left transition-all group",
                            isActive ? "bg-background shadow-sm ring-1 ring-border" : "hover:bg-muted/50"
                        )}
                    >
                        <div className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center border transition-colors",
                            isActive ? "bg-primary text-primary-foreground border-primary" : 
                            isPast ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-muted text-muted-foreground border-transparent"
                        )}>
                            {isPast ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                            <p className={cn("text-xs font-bold uppercase tracking-wider", isActive ? "text-primary" : "text-muted-foreground")}>
                                {step.title}
                            </p>
                            <p className="text-[10px] text-muted-foreground leading-tight">{step.description}</p>
                        </div>
                        {isActive && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    </button>
                )
            })}

            <div className="mt-auto pt-4 border-t border-muted">
                {!isEditing && watchedValues.subject_id && (
                    <div className="space-y-2">
                        {isSmartFilled && (
                            <Badge variant="secondary" className="w-full bg-primary/10 text-primary border-primary/20 flex gap-1 items-center px-2 py-1 justify-center" title={SAFETY_COPY.REFERENCE_ONLY}>
                                <Sparkles className="h-3 w-3" /> History Applied
                            </Badge>
                        )}
                        <Button variant="outline" size="sm" type="button" onClick={handleCopyLastVisit} className="w-full text-[10px] h-8" title={SAFETY_COPY.PREVIOUS_EFFECTIVE}>
                            <Save className="mr-2 h-3 w-3" /> {SAFETY_COPY.DOSE_HISTORY}
                        </Button>
                    </div>
                )}
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col relative min-w-0">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden min-w-0">
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                        <fieldset disabled={isSigned || !canWrite} className="h-full">
                            
                            {/* Step 1: Context */}
                            {activeStep === 'context' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <FormField control={form.control} name="subject_id" render={({ field }) => (
                                            <FormItem><FormLabel>Patient</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={isEditing}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{patients.map(s => <SelectItem key={s.id} value={s.id}>{s.patient_code}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="date" render={({ field }) => (
                                            <FormItem className="flex flex-col"><FormLabel>Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : "Pick"}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={d => d > new Date()} /></PopoverContent></Popover><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="category" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Indication</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
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
                                        )} />
                                        <FormField control={form.control} name="diagnosis_id" render={({ field }) => (
                                            <FormItem><FormLabel>Diagnosis (ICD-10)</FormLabel><FormControl><DiagnosisPicker value={field.value || ""} onChange={field.onChange} /></FormControl></FormItem>
                                        )} />
                                    </div>

                                    <div className="p-4 border rounded-xl bg-muted/20 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <Label>Toxin Product</Label>
                                                <span className="text-[9px] text-muted-foreground italic">{SAFETY_COPY.REFERENCE_ONLY}</span>
                                            </div>
                                            {protocols.length > 0 && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="secondary" size="sm" type="button" className="h-7 text-[10px]">
                                                            {isPro ? <Wand2 className="mr-1 h-3 w-3" /> : <Lock className="mr-1 h-3 w-3" />}
                                                            Protocols
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">Clinical Protocols</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        {protocols.map((p) => (
                                                            <DropdownMenuItem key={p.id} onClick={() => applyProtocol(p)} className="text-xs">
                                                                {p.name}
                                                                {!isPro && <Lock className="ml-auto size-3 opacity-50" />}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </div>
                                        <FormField control={form.control} name="product_label" render={({ field }) => (
                                            <FormItem>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger></FormControl>
                                                    <SelectContent><SelectItem value="Botox">Botox</SelectItem><SelectItem value="Dysport">Dysport</SelectItem><SelectItem value="Xeomin">Xeomin</SelectItem><SelectItem value="Myobloc">Myobloc</SelectItem></SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        {productValue && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField control={form.control} name="vial_size" render={({ field }) => (
                                                    <FormItem><FormLabel className="text-xs text-muted-foreground">Vial Size (U)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl></FormItem>
                                                )} />
                                                <FormField control={form.control} name="dilution_ml" render={({ field }) => (
                                                    <FormItem><FormLabel className="text-xs text-muted-foreground">Dilution (ml)</FormLabel><FormControl><Input type="number" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl></FormItem>
                                                )} />
                                            </div>
                                        )}
                                        {productValue && (
                                            <div className="flex items-center justify-between pt-2 border-t text-sm">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Concentration</span>
                                                    <span className="font-black text-primary">{unitsPerMl.toFixed(1)} U / ml</span>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 text-[10px] uppercase font-bold text-muted-foreground">Presets <ChevronDown className="ml-1 h-3 w-3" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {DILUTION_PRESETS.map(p => <DropdownMenuItem key={p.label} onClick={() => applyPreset(p)} className="text-xs">{p.label}</DropdownMenuItem>)}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Intent (GAS+) */}
                            {activeStep === 'intent' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <TreatmentGoalManager 
                                        patientId={form.getValues("subject_id")}
                                        targetedGoalIds={targetedGoalIds}
                                        onTargetedGoalsChange={setTargetedGoalIds}
                                        goalAssessments={goalAssessments}
                                        onGoalAssessmentsChange={setGoalAssessments}
                                        disabled={isSigned}
                                        previousTargetedGoals={previousTargetedGoals}
                                    />
                                </div>
                            )}

                            {/* Step 3: Procedure */}
                            {activeStep === 'procedure' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="flex justify-between items-end mb-4 bg-muted/10 p-4 rounded-xl border border-muted/20">
                                        <div className="space-y-1">
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Clinical Procedure</h3>
                                            <p className="text-xs text-muted-foreground">Mapping muscles and dosages.</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Accumulated Dose</p>
                                            <p className="text-4xl font-black text-primary tabular-nums">{totalUnits} <span className="text-xs font-normal text-muted-foreground">Units</span></p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <ProcedureStepsEditor 
                                            steps={steps} 
                                            onChange={setSteps} 
                                            muscles={muscles} 
                                            regions={regions} 
                                            disabled={isSigned || !canWrite} 
                                            unitsPerMl={unitsPerMl}
                                            patientId={form.getValues("subject_id")}
                                        />

                                        <div className="pt-4 border-t">
                                            <Collapsible>
                                                <CollapsibleTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="w-full justify-between text-xs text-muted-foreground h-8 font-bold uppercase tracking-widest">
                                                        Clinical Assessments & Scores <ChevronDown className="h-3 w-3" />
                                                    </Button>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent className="mt-4 animate-in slide-in-from-top-2 duration-300 space-y-6">
                                                    {categoryValue === 'spastik' && (
                                                        <MuscleMASManager 
                                                            steps={steps}
                                                            muscles={muscles}
                                                            disabled={isSigned || !canWrite}
                                                            onChange={(id, field, val) => {
                                                                setSteps(prev => prev.map(s => s.id === id ? { ...s, [field]: val } : s))
                                                            }}
                                                        />
                                                    )}
                                                    <AssessmentManager 
                                                        assessments={assessments} 
                                                        onChange={setAssessments} 
                                                        indication={categoryValue || ""} 
                                                        disabled={isSigned} 
                                                    />
                                                </CollapsibleContent>
                                            </Collapsible>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Review & Sign */}
                            {activeStep === 'review' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-4">
                                        <FormField control={form.control} name="notes" render={({ field }) => (
                                            <FormItem><FormLabel>Clinical Session Notes</FormLabel><FormControl><Textarea placeholder="Additional clinical observations..." className="min-h-[150px] resize-none text-sm" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-4 border rounded-xl bg-muted/10 space-y-4 flex flex-col justify-center">
                                                <FormField control={form.control} name="is_supervised" render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                                        <FormLabel className="text-sm font-medium">Performed under supervision</FormLabel>
                                                    </FormItem>
                                                )} />
                                                {form.watch("is_supervised") && (
                                                    <FormField control={form.control} name="supervisor_name" render={({ field }) => (
                                                        <FormItem><FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">Supervisor Name</FormLabel><FormControl><Input {...field} placeholder="Dr. ..." className="h-8" /></FormControl></FormItem>
                                                    )} />
                                                )}
                                            </div>

                                            <div className="p-4 border rounded-xl bg-primary/5 flex flex-col justify-center">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Summary</h4>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 text-[13px]">
                                                    <div className="space-y-0.5">
                                                        <p className="text-[9px] font-bold text-muted-foreground uppercase">Procedure</p>
                                                        <p className="font-semibold">{steps.length} Sites • {totalUnits} U</p>
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <p className="text-[9px] font-bold text-muted-foreground uppercase">Intent</p>
                                                        <p className="font-semibold">{targetedGoalIds.length} Goals targeted</p>
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <p className="text-[9px] font-bold text-muted-foreground uppercase">Outcomes</p>
                                                        <p className="font-semibold">
                                                            {goalAssessments.length} GAS • {assessments.length} Global
                                                        </p>
                                                    </div>
                                                    {categoryValue === 'spastik' && (
                                                        <div className="space-y-0.5">
                                                            <p className="text-[9px] font-bold text-muted-foreground uppercase">MAS Data</p>
                                                            <p className="font-semibold">
                                                                {steps.filter(s => !!s.mas_baseline).length}/{steps.length} Baseline
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {steps.length > 0 && (
                                        <div className="mt-auto">
                                            <Button variant="outline" size="sm" type="button" onClick={handleSaveProtocol} className={cn("w-full h-10 border-dashed", !isPro && "opacity-80")}>
                                                <PlusIcon className="mr-2 h-4 w-4" />
                                                Save configuration as Clinical Protocol
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </fieldset>
                    </div>

                    {/* Navigation Footer */}
                    <div className="p-4 border-t bg-muted/5 flex items-center justify-between">
                        <div className="flex gap-2">
                            <Button type="button" variant="ghost" onClick={() => onCancel ? onCancel() : router.back()}>Cancel</Button>
                            {!isSigned && canWrite && (
                                <Button type="button" variant="ghost" onClick={() => setShowClearDialog(true)} className="text-destructive">Reset</Button>
                            )}
                        </div>

                        <div className="flex gap-3 items-center">
                            {hasUnsavedChanges && !isSigned && <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest animate-pulse mr-2">Draft Mode</span>}
                            
                            {activeStep !== 'context' && (
                                <Button type="button" variant="outline" onClick={prevStep}>
                                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                                </Button>
                            )}

                            {activeStep !== 'review' ? (
                                <Button type="button" onClick={nextStep} disabled={!canGoNext()} className="min-w-[120px]">
                                    Continue <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                isSigned ? (
                                    <Button type="button" variant="outline" onClick={handleReopen}>
                                        <Unlock className="mr-2 h-4 w-4" /> Re-open to Edit
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button type="submit" variant="outline" disabled={isPending}>Save Draft</Button>
                                        <Button type="button" onClick={handleSign} disabled={isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                            <Lock className="mr-2 h-4 w-4" /> Sign & Finalize
                                        </Button>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    </div>
    </>
  )
}
