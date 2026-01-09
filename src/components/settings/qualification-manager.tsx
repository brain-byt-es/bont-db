"use client"

import { useState, useTransition } from "react"
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
import { ShieldCheck, Info } from "lucide-react"

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
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateQualificationProfile({
        specialty,
        supervisionMode,
        defaultSupervisorName: supervisorName,
        showCertificationRoadmap: showRoadmap
      })
      if (res.success) toast.success("Qualification profile updated")
      else toast.error("Failed to update profile")
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            AK Botulinum Qualification Path
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

      <Card className="bg-muted/30">
        <CardContent className="pt-6">
            <div className="flex gap-3">
                <Info className="h-5 w-5 text-primary shrink-0" />
                <div className="space-y-1">
                    <p className="text-sm font-medium">About AK Botulinum Certification</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        The &quot;Neurology&quot; certificate requires 100 documented treatments covering at least two indication groups (Spasticity, Dystonia, Autonomic, or Headache). At least 25 treatments must fall into one main indication.
                    </p>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
