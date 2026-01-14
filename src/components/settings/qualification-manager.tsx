"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { QualificationSpecialty, SupervisionMode } from "@/generated/client/enums"
import { updateQualificationProfile } from "@/app/(dashboard)/settings/qualification-actions"
import { toast } from "sonner"
import { ShieldCheck, Info, ExternalLink, GraduationCap, FileText, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"

interface QualificationManagerProps {
  initialData: {
    specialty: QualificationSpecialty
    supervisionMode: SupervisionMode
    defaultSupervisorName: string | null
    showCertificationRoadmap: boolean
  }
}

export function QualificationManager({ initialData }: QualificationManagerProps) {
  const [specialty, setSpecialty] = useState<QualificationSpecialty>(initialData.specialty)
  const [supervisionMode, setSupervisionMode] = useState<SupervisionMode>(initialData.supervisionMode)
  const [supervisorName, setSupervisorName] = useState(initialData.defaultSupervisorName || "")
  const [showRoadmap, setShowRoadmap] = useState(initialData.showCertificationRoadmap)
  const [isInfoExpanded, setIsInfoExpanded] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateQualificationProfile({
        specialty,
        supervisionMode,
        defaultSupervisorName: supervisorName,
        showCertificationRoadmap: showRoadmap
      })
      if (res.success) {
        toast.success("Qualification profile updated")
        router.refresh()
      } else {
        toast.error("Failed to update profile")
      }
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            AK Botulinumtoxin Qualification Path
          </CardTitle>
          <CardDescription>
            Configure your certification targets and requirements.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <Label>Show Certification Roadmap</Label>
              <div className="text-[11px] text-muted-foreground">
                Display the progress tracker on your main dashboard.
              </div>
            </div>
            <Switch 
              checked={showRoadmap}
              onCheckedChange={setShowRoadmap}
              disabled={isPending}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="specialty">Target Specialty</Label>
            <Select 
                value={specialty} 
                onValueChange={(v) => setSpecialty(v as QualificationSpecialty)}
                disabled={isPending}
            >
              <SelectTrigger id="specialty">
                <SelectValue placeholder="Select specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NEUROLOGY">Neurology (100 Treatments / 50 Follow-ups)</SelectItem>
                <SelectItem value="NEUROPEDIATRICS">Neuropediatrics (50 Treatments)</SelectItem>
                <SelectItem value="HNO">HNO / Otolaryngology</SelectItem>
                <SelectItem value="ORTHOPEDICS">Orthopedics</SelectItem>
                <SelectItem value="OTHER">Other Specialty</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground italic">
                This setting adjusts the logic of your dashboard certification tracker.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="supervision">Supervision Mode</Label>
            <Select 
                value={supervisionMode} 
                onValueChange={(v) => setSupervisionMode(v as SupervisionMode)}
                disabled={isPending}
            >
              <SelectTrigger id="supervision">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">No Supervision (Self-Report)</SelectItem>
                <SelectItem value="DIRECT">Direct Supervision (by certified person)</SelectItem>
                <SelectItem value="GUARANTOR">Guarantor / Bürge</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {supervisionMode !== "NONE" && (
            <div className="grid gap-2">
                <Label htmlFor="supervisor">Name of Supervisor / Bürge</Label>
                <Input 
                    id="supervisor" 
                    value={supervisorName} 
                    onChange={(e) => setSupervisorName(e.target.value)} 
                    placeholder="e.g. Dr. Med. Example"
                    disabled={isPending}
                />
            </div>
          )}

          <div className="pt-4 border-t flex justify-end">
            <Button onClick={handleSave} disabled={isPending}>
                {isPending ? "Saving..." : "Save Qualification Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/30 border-primary/20 transition-all duration-200">
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0 cursor-pointer" onClick={() => setIsInfoExpanded(!isInfoExpanded)}>
            <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">AK Botulinumtoxin: Certificate &quot;Qualifizierte Botulinumtoxintherapie&quot;</CardTitle>
                {isInfoExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground ml-2" /> : <ChevronDown className="h-4 w-4 text-muted-foreground ml-2" />}
            </div>
            <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 h-8" 
                asChild
                onClick={(e) => e.stopPropagation()}
            >
                <Link href="https://ak-botulinumtoxin.de/fortbildungen/zertifizierung/" target="_blank">
                    Official Requirements <ExternalLink className="h-3 w-3" />
                </Link>
            </Button>
        </CardHeader>
        {isInfoExpanded && (
            <CardContent className="space-y-6 animate-in slide-in-from-top-2 duration-200">
                <div>
                    <h3 className="text-base font-semibold mb-4">Requirements</h3>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-3">
                            <h4 className="flex items-center gap-2 text-sm font-semibold text-primary">
                                <GraduationCap className="h-5 w-5" />
                                Theory (30 CP)
                            </h4>
                            <ul className="text-sm text-foreground/80 space-y-2 list-disc pl-4">
                                <li><strong>Anatomy:</strong> min. 2 CP</li>
                                <li><strong>Basics:</strong> min. 2 CP (Toxicol./Pharmacol.)</li>
                                <li><strong>Clinic:</strong> min. 8 CP</li>
                                <li><strong>Diagnostics:</strong> min. 8 CP</li>
                                <li><strong>Extra:</strong> Optional (Law, Billing, etc.)</li>
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <h4 className="flex items-center gap-2 text-sm font-semibold text-primary">
                                <FileText className="h-5 w-5" />
                                Documentation Requirements
                            </h4>
                            <ul className="text-sm text-foreground/80 space-y-2 list-disc pl-4">
                                <li><strong>Neurology:</strong> 100 documented treatments</li>
                                <li><strong>Success Control:</strong> min. 50 treatments (e.g. at peak effect)</li>
                                <li><strong>Indication Mix:</strong> Cover at least 2 groups (Spasticity, Dystonia, Autonomic, Headache).</li>
                                <li><strong>Focus:</strong> min. 25 treatments in Spasticity or Dystonia.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-dashed">
                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                        <p className="text-sm text-foreground/80 leading-relaxed">
                            <strong>Practical Qualification:</strong> Treatments must be performed under supervision of a certified person or confirmed by a guarantor (Bürge).
                        </p>
                    </div>
                </div>

                <div className="pt-6 border-t">
                    <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                        Application Submission
                    </h3>
                    <div className="space-y-4">
                        <p className="text-sm text-foreground/80">
                            Please send the following documentation for application review to <a href="mailto:buero@ak-botulinumtoxin.de" className="font-medium text-primary hover:underline">buero@ak-botulinumtoxin.de</a> in PDF format.
                        </p>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    File 1 [PDF]
                                </span>
                                <ul className="text-sm text-foreground/80 space-y-2 list-disc pl-4">
                                    <li>Cover Letter</li>
                                    <li>CV (Short Version)</li>
                                    <li>Certificates (Practical training / Job shadowing)</li>
                                    <li>Specialist Certificate (Facharzturkunde)</li>
                                    <li>Participation Certificates (Credit Points)</li>
                                </ul>
                            </div>
                            <div className="space-y-3">
                                <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    File 2 [PDF]
                                </span>
                                <ul className="text-sm text-foreground/80 space-y-2 list-disc pl-4">
                                    <li>Patient Treatment Documentation [anonymized]</li>
                                    <li>Chronological Order</li>
                                    <li>Breakdown / Assignment of Diagnosis Groups</li>
                                </ul>
                                                            <div className="pt-2">
                                                                <p className="text-[11px] italic text-muted-foreground bg-muted p-2 rounded">
                                                                    Tip: Use the <strong>&quot;AK Botulinumtoxin Certification&quot;</strong> export in the Export tab to generate this file automatically.
                                                                </p>
                                                            </div>                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t mt-2">
                    <p className="text-xs text-muted-foreground text-center opacity-70">
                        Disclaimer: This summary is not official. Requirements are subject to change and errors are possible. Please verify with the official AK Botulinumtoxin.
                    </p>
                </div>
            </CardContent>
        )}
      </Card>
    </div>
  )
}
