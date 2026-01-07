"use client"

import { useState, useTransition, useEffect, useRef } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Save, ChevronDown, Wand2, Lock, Unlock, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import { createTreatment, getMuscles, getMuscleRegions, getLatestTreatment, getProtocolsAction } from "@/app/(dashboard)/treatments/actions"
import { updateTreatment } from "@/app/(dashboard)/treatments/update-action"
import { reopenTreatmentAction } from "@/app/(dashboard)/treatments/status-actions"
import { toast } from "sonner"
import { Muscle, MuscleRegion } from "@/components/muscle-selector"
import { PiiWarningDialog } from "@/components/pii-warning-dialog"
import { validatePII } from "@/lib/pii-validation"
import { checkPermission, PERMISSIONS, checkPlan } from "@/lib/permissions"
import { MembershipRole, Plan } from "@/generated/client/enums"
import { useAuthContext } from "@/components/auth-context-provider"
import { UpgradeDialog } from "@/components/upgrade-dialog"
import { Protocol } from "@/lib/dose-engine"

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
  vial_size: z.number().min(1),
  dilution_ml: z.number().min(0.1),
  notes: z.string().optional(),
})

export interface OrganizationPreferences {
  standard_vial_size?: number
  standard_dilution_ml?: number
  enable_compliance_views?: boolean
}

interface InitialFormData {
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
      preferences?: OrganizationPreferences | null
  }
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

  const [steps, setSteps] = useState<ProcedureStep[]>(initialData?.steps || [])
  const [assessments, setAssessments] = useState<Assessment[]>(initialData?.assessments || [])
  const [muscles, setMuscles] = useState<Muscle[]>([])
  const [regions, setRegions] = useState<MuscleRegion[]>([])
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const hasRestoredDraft = useRef(false)

  const [showPiiWarning, setShowPiiWarning] = useState(false)
  const [showSignDialog, setShowSignDialog] = useState(false)
  const [showReopenDialog, setShowReopenDialog] = useState(false)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [piiDetected, setPiiDetected] = useState<string[]>([])
  const [pendingValues, setPendingValues] = useState<z.infer<typeof formSchema> | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [reopenReason, setReopenReason] = useState("")
  const [isSmartFilled, setIsSmartFilled] = useState(false)
  const [protocols, setProtocols] = useState<Protocol[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: initialData?.location || "Main Clinic",
      subject_id: initialData?.subject_id || defaultSubjectId || "",
      date: initialData?.date ? new Date(initialData.date) : new Date(),
      category: initialData?.category || "",
      product_label: initialData?.product_label || "",
      vial_size: initialData?.vial_size || (isPro ? organization?.preferences?.standard_vial_size : 100) || 100,
      dilution_ml: initialData?.dilution_ml || (isPro ? organization?.preferences?.standard_dilution_ml : 2.5) || 2.5,
      notes: initialData?.notes || "",
    },
  })

  // Use useWatch to reactively subscribe to form changes without imperative subscription issues
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

  // Fetch latest treatment for defaults
  const subjectId = form.watch("subject_id")
  useEffect(() => {
    if (isEditing || !subjectId) return

    const fetchLatest = async () => {
        const latest = await getLatestTreatment(subjectId)
        if (latest) {
             // BASIC logic: no auto-fill, upsell via button
             if (!isPro) return

             // PRO logic: Smart Auto-Fill everything
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
             toast.success("Pro Assistant: Pre-filled from last visit")
        }
    }
    fetchLatest()
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

  const applyProtocol = (protocol: Protocol) => {
    if (!isPro) {
        setShowUpgradeDialog(true)
        return
    }

    const newSteps = protocol.steps.map((s): ProcedureStep | null => {
        const muscleDef = muscles.find(m => m.name === s.muscleName)
        if (!muscleDef) return null
        return {
            id: Math.random().toString(36).substr(2, 9),
            muscle_id: muscleDef.id,
            side: s.side,
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

  // Autosave & Load Draft
  useEffect(() => {
    if (isEditing || hasRestoredDraft.current) return
    const savedDraft = localStorage.getItem("bont_treatment_draft")
    if (savedDraft && !initialData) {
        try {
            const draft = JSON.parse(savedDraft)
            // 1. Check validity (24h)
            if (new Date().getTime() - new Date(draft.timestamp).getTime() < 24 * 60 * 60 * 1000) {
                const { values, steps: draftSteps, assessments: draftAssessments } = draft
                
                // 2. Context Safety: If we are in a specific patient context, ONLY restore matching drafts
                if (defaultSubjectId && values.subject_id !== defaultSubjectId) {
                    return
                }

                // 3. Meaningful Content Check
                const hasContent = !!(values.notes?.trim()) || (draftSteps && draftSteps.length > 0)

                if (hasContent) {
                    if (!form.getValues("subject_id")) {
                        form.reset({ ...values, date: values.date ? new Date(values.date) : new Date() })
                    }
                    if (draftSteps) setSteps(draftSteps)
                    if (draftAssessments) setAssessments(draftAssessments.map((a: Assessment & { assessed_at: string }) => ({ ...a, assessed_at: new Date(a.assessed_at) })))
                    
                    hasRestoredDraft.current = true
                    toast.info("Unsaved draft restored")
                }
            }
        } catch (e) { console.error(e) }
    }
  }, [isEditing, initialData, form, defaultSubjectId])

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Autosave & Change Detection
  useEffect(() => {
    if (watchedValues || steps.length > 0 || assessments.length > 0) {
        // Mark as dirty
        setHasUnsavedChanges(true)

        // Local Storage Autosave (Only for new drafts)
        if (!isEditing && watchedValues) {
            const draft = { values: watchedValues, steps, assessments, timestamp: new Date() }
            localStorage.setItem("bont_treatment_draft", JSON.stringify(draft))
            setLastSaved(new Date())
        }
    }
  }, [watchedValues, steps, assessments, isEditing])

  const handleCopyLastVisit = () => {
      if (isPro) {
          copyLastTreatmentFull()
      } else {
          setShowUpgradeDialog(true)
      }
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
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const processSubmission = (values: z.infer<typeof formSchema>, targetStatus: "DRAFT" | "SIGNED" = "DRAFT") => {
    startTransition(async () => {
      try {
        const payload = { ...values, steps, assessments, status: targetStatus }
        const result = isEditing && treatmentId 
          ? await updateTreatment(treatmentId, payload)
          : await createTreatment(payload);

        if (result && 'error' in result) {
          toast.error(result.error)
          return
        }
        toast.success(isEditing ? "Updated" : "Saved")
        setHasUnsavedChanges(false)
        if (!isEditing) localStorage.removeItem("bont_treatment_draft")
        
        if (onSuccess) {
          onSuccess()
        } else {
          router.push(values.subject_id ? `/patients/${values.subject_id}` : "/patients")
        }
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

  const totalUnits = steps.reduce((sum, step) => sum + (step.numeric_value || 0), 0)

  const handleSign = () => {
      // if (!treatmentId) return  <-- Removed check
      setShowSignDialog(true)
  }

  const confirmSign = () => {
      // We must get current form values.
      // Since confirmSign is outside form submit context, we use getValues.
      const values = form.getValues()
      processSubmission(values, "SIGNED")
      setShowSignDialog(false)
  }

  const handleReopen = () => {
      if (!treatmentId) return
      setShowReopenDialog(true)
  }

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

  return (
    <>
    <AlertDialog open={showSignDialog} onOpenChange={setShowSignDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sign & Finalize?</AlertDialogTitle>
          <AlertDialogDescription>
            This will lock the record to prevent further changes. This action is recorded in the audit log.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirmSign}>Sign Record</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog open={showReopenDialog} onOpenChange={setShowReopenDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Re-open Record?</AlertDialogTitle>
          <AlertDialogDescription>
            This record is currently finalized. Re-opening it will allow editing but will be flagged in the audit history.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="reason">Reason for re-opening (Required)</Label>
                <Textarea 
                    id="reason" 
                    value={reopenReason} 
                    onChange={(e) => setReopenReason(e.target.value)} 
                    placeholder="e.g. Correction of dose..." 
                />
            </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirmReopen} disabled={!reopenReason.trim()}>Re-open</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <UpgradeDialog 
        open={showUpgradeDialog} 
        onOpenChange={setShowUpgradeDialog}
        title="Smart Clinical Defaults"
        featureName="Auto-filling from previous visits"
        description="Save time by automatically loading the exact dosage, muscles, and notes from the patient's last encounter. Standardize your workflow with Pro."
    />

    <PiiWarningDialog open={showPiiWarning} onOpenChange={setShowPiiWarning} detectedTypes={piiDetected} onConfirm={() => { setShowPiiWarning(false); if (pendingValues) processSubmission(pendingValues) }} onCancel={() => setShowPiiWarning(false)} />
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {!canWrite && (
             <Alert variant="default" className="mb-6 bg-muted/50">
                <Lock className="h-4 w-4" />
                <AlertTitle>Read Only</AlertTitle>
                <AlertDescription>
                    You do not have permission to edit treatment records.
                </AlertDescription>
            </Alert>
        )}
        {isSigned && (
            <Alert variant="destructive" className="mb-6 bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-900/50 dark:text-amber-200">
                <Lock className="h-4 w-4" />
                <AlertTitle>Record Finalized</AlertTitle>
                <AlertDescription>
                    This treatment record is signed and read-only. Unlock it to make corrections.
                </AlertDescription>
            </Alert>
        )}
        <fieldset disabled={isSigned || !canWrite} className="space-y-8 border-none p-0 m-0 min-w-0">
        
        {!isEditing && form.watch("subject_id") && (
            <div className="flex justify-end gap-2 items-center">
                {isSmartFilled && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 flex gap-1 items-center px-2 py-1">
                        <Sparkles className="h-3 w-3" /> Smart Pre-fill Active
                    </Badge>
                )}
                {lastSaved && (
                    <span className="text-xs text-muted-foreground mr-2">
                        Saved {format(lastSaved, "HH:mm:ss")}
                    </span>
                )}
                
                {protocols.length > 0 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="sm" type="button" className={cn(!isPro && "opacity-80")}>
                                {isPro ? <Wand2 className="mr-2 h-4 w-4" /> : <Lock className="mr-2 h-3 w-3" />}
                                Load Protocol
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Clinical Protocols</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {protocols.map((p) => (
                                <DropdownMenuItem key={p.id} onClick={() => applyProtocol(p)}>
                                    {p.name}
                                    {!isPro && <Lock className="ml-auto size-3 opacity-50" />}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

                {!isSmartFilled && (
                    <Button 
                        variant="outline" 
                        size="sm" 
                        type="button" 
                        onClick={handleCopyLastVisit} 
                        className={cn("bg-primary/5 text-primary", !isPro && "opacity-80")}
                    >
                        {isPro ? <Save className="mr-2 h-4 w-4" /> : <Lock className="mr-2 h-3 w-3" />} 
                        Copy last visit
                    </Button>
                )}
            </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField control={form.control} name="subject_id" render={({ field }) => (
              <FormItem><FormLabel>Patient</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={isEditing || isSigned}><FormControl><SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger></FormControl><SelectContent>{patients.map((s) => (<SelectItem key={s.id} value={s.id}>{s.patient_code}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>
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

        {productValue && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 p-4 border rounded-lg bg-muted/20">
                <FormField control={form.control} name="vial_size" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Vial Size (Units)</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="dilution_ml" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Dilution (ml Saline)</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.1" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <div className="flex flex-col justify-end space-y-2">
                    <span className="text-xs text-muted-foreground font-medium">Quick Presets</span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" type="button" className="w-full justify-between">
                                Select... <ChevronDown className="h-4 w-4 ml-2" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                            <DropdownMenuLabel>Standard Concentrations</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {DILUTION_PRESETS.map((p) => (
                                <DropdownMenuItem key={p.label} onClick={() => applyPreset(p)}>
                                    {p.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="flex flex-col justify-end pb-2 pl-2">
                    <span className="text-xs text-muted-foreground font-medium">Concentration</span>
                    <span className="text-lg font-bold text-primary">{unitsPerMl.toFixed(1)} U / ml</span>
                </div>
            </div>
        )}
        
        <div className="space-y-4">
             <ProcedureStepsEditor 
                steps={steps} 
                onChange={setSteps} 
                muscles={muscles} 
                regions={regions} 
                disabled={isSigned || !canWrite} 
                unitsPerMl={unitsPerMl}
                patientId={form.watch("subject_id")}
             />
             <div className="flex justify-end font-bold text-xl">Total: {totalUnits} Units</div>
        </div>

        <Collapsible>
          <div className="flex items-center space-x-2">
            <CollapsibleTrigger asChild><Button variant="ghost" size="sm" className="w-full justify-between">Assessments (Optional) <ChevronDown className="h-4 w-4" /></Button></CollapsibleTrigger>
          </div>
          <CollapsibleContent className="mt-4"><AssessmentManager assessments={assessments} onChange={setAssessments} indication={categoryValue || ""} disabled={isSigned} /></CollapsibleContent>
        </Collapsible>

        <FormField control={form.control} name="notes" render={({ field }) => (
            <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea placeholder="..." className="resize-none" {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        </fieldset>

        <div className="flex items-center justify-between pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onCancel ? onCancel() : router.back()}>Cancel</Button>
            
            <div className="flex gap-4 items-center">
            {hasUnsavedChanges && !isSigned && canWrite && (
                <span className="text-sm font-medium text-amber-600 animate-pulse">Unsaved Changes</span>
            )}
            {isSigned ? (
                canWrite && (
                <Button type="button" variant="outline" onClick={handleReopen} disabled={isPending}>
                    <Unlock className="mr-2 h-4 w-4" /> Re-open to Edit
                </Button>
                )
            ) : (
                canWrite && (
                <>
                    <Button type="submit" disabled={isPending} variant="outline">{isPending ? "Saving..." : "Save Draft"}</Button>
                    <Button type="button" onClick={handleSign} disabled={isPending}>
                        <Lock className="mr-2 h-4 w-4" /> Sign & Finalize
                    </Button>
                </>
                )
            )}
            </div>
        </div>
      </form>
    </Form>
    </>
  )
}
