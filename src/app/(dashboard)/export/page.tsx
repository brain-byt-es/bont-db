"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { RecentRecordsTable, TreatmentRecord } from "@/components/recent-records-table"
import { CalendarIcon, Download, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { getExportData, getResearchExportData, ResearchExportRecord } from "./actions"
import { toast } from "sonner"
import { getComplianceSettings } from "../settings/actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Rocket } from "lucide-react"
import { UpgradeDialog } from "@/components/upgrade-dialog"
import { useAuthContext } from "@/components/auth-context-provider"
import { checkPlan } from "@/lib/permissions"
import { Plan } from "@/generated/client/enums"

interface ExportRecord {
  id: string
  treatment_date: string
  treatment_site: string
  indication: string
  product: string
  total_units: number
  status: string
  patients?: {
    patient_code: string
    birth_year: number
  }
  followups?: {
    followup_date: string
    outcome: string
  }[]
}

type ExportPreset = "structured" | "compliance_minimal" | "compliance_followup" | "research_flat"

export default function ExportPage() {
  const { userPlan } = useAuthContext()
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()
  const [indicationFilter, setIndicationFilter] = useState<string>("all")
  const [records, setRecords] = useState<ExportRecord[]>([])
  const [researchRecords, setResearchRecords] = useState<ResearchExportRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [enableCompliance, setEnableCompliance] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<ExportPreset>("structured")
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [upgradeTitle, setUpgradeTitle] = useState("")
  const [upgradeDesc, setUpgradeDesc] = useState("")
  
  const isPro = checkPlan(userPlan as Plan, Plan.PRO)

  const handlePresetChange = (preset: ExportPreset) => {
    const isProTarget = preset === "research_flat" || preset === "compliance_minimal" || preset === "compliance_followup"
    
    if (isProTarget && !isPro) {
        setUpgradeTitle(preset === "research_flat" ? "Research Export" : "Compliance Export")
        setUpgradeDesc(`${preset === "research_flat" ? "Research exports" : "Compliance exports"} are available on InjexPro Docs Pro. Upgrade now to unlock injection-level data and regulatory formats.`)
        setUpgradeOpen(true)
        return
    }
    
    setSelectedPreset(preset)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [exportData, researchData, settings] = await Promise.all([
            getExportData(),
            getResearchExportData(),
            getComplianceSettings()
        ])
        setRecords(exportData as unknown as ExportRecord[])
        setResearchRecords(researchData)
        setEnableCompliance(settings.enable_compliance_views)
      } catch {
        toast.error("Failed to load export data")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Filter logic
  const filteredRecords = records.filter(r => {
     const rDate = new Date(r.treatment_date)
     if (dateFrom && rDate < dateFrom) return false
     if (dateTo && rDate > dateTo) return false
     if (indicationFilter !== "all" && r.indication !== indicationFilter) return false
     return true
  })

  const filteredResearchRecords = researchRecords.filter(r => {
     const rDate = new Date(r.treatment_date)
     if (dateFrom && rDate < dateFrom) return false
     if (dateTo && rDate > dateTo) return false
     if (indicationFilter !== "all" && r.indication !== indicationFilter) return false
     return true
  })

  const downloadCSV = () => {
    if (selectedPreset === "research_flat" && !isPro) {
        toast.error("Research exports are available on InjexPro Docs Pro.")
        return
    }

    if (selectedPreset === "research_flat") {
        if (!filteredResearchRecords.length) return
        
        const headers = [
            "User ID", "Patient Code", "Treatment ID", "Treatment Date", "Indication", "Product", "Dilution",
            "Injection ID", "Muscle ID", "Muscle Name", "Side", "Units",
            "Follow-up Flag", "MAS Baseline (Txt)", "MAS Baseline (Num)", "MAS Peak (Txt)", "MAS Peak (Num)"
        ]
        
        const rows = filteredResearchRecords.map(r => [
            r.user_id, r.patient_code, r.treatment_id, r.treatment_date, r.indication, r.product, r.dilution,
            r.injection_id, r.muscle_id, `"${r.muscle_name}"`, r.side, r.units,
            r.followup_flag, r.MAS_baseline_text, r.MAS_baseline_num, r.MAS_peak_text, r.MAS_peak_num
        ])

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.join(","))
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", `research_export_${format(new Date(), "yyyy-MM-dd")}.csv`)
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        return
    }

    if (!filteredRecords.length) return
    
    if ((selectedPreset === "compliance_minimal" || selectedPreset === "compliance_followup") && !isPro) {
        toast.error("Compliance exports are available on InjexPro Docs Pro.")
        return
    }

    let headers: string[] = []
    let rows: string[][] = []

    if (selectedPreset === "structured") {
        headers = [
            "Patient Code",
            "Birth Year",
            "Indication",
            "Treatment Date (ISO)",
            "Site",
            "Product",
            "Units",
            "Follow-up Date",
            "Outcome"
        ]
        rows = filteredRecords.map(r => [
            r.patients?.patient_code || "",
            r.patients?.birth_year.toString() || "",
            r.indication || "",
            r.treatment_date || "",
            `"${r.treatment_site || ""}"`,
            r.product || "",
            r.total_units.toString() || "",
            r.followups?.[0]?.followup_date || "",
            `"${r.followups?.[0]?.outcome || ""}"`
        ])
    } else if (selectedPreset === "compliance_minimal") {
        headers = ["Patient Code", "Indication", "Date", "Site", "Product", "Total Units"]
        rows = filteredRecords.map(r => [
            r.patients?.patient_code || "",
            r.indication || "",
            r.treatment_date || "",
            `"${r.treatment_site || ""}"`,
            r.product || "",
            r.total_units.toString() || ""
        ])
    } else if (selectedPreset === "compliance_followup") {
        headers = ["Patient Code", "Indication", "Date", "Units", "Follow-up Status", "Follow-up Date"]
        rows = filteredRecords.map(r => [
            r.patients?.patient_code || "",
            r.indication || "",
            r.treatment_date || "",
            r.total_units.toString() || "",
            r.followups?.length ? "Completed" : "Pending",
            r.followups?.[0]?.followup_date || ""
        ])
    }

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${selectedPreset}_export_${format(new Date(), "yyyy-MM-dd")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Map to Table format
  const tableRecords: TreatmentRecord[] = filteredRecords.map(r => ({
      id: r.id,
      treatment_date: r.treatment_date,
      treatment_site: r.treatment_site,
      indication: r.indication,
      product: r.product,
      total_units: r.total_units,
      status: r.status,
      patient: r.patients
  }))

  const isProPreset = selectedPreset === "compliance_minimal" || selectedPreset === "compliance_followup" || selectedPreset === "research_flat"

  return (
    <div className="flex flex-col gap-4 pt-6">
      <UpgradeDialog 
        open={upgradeOpen} 
        onOpenChange={setUpgradeOpen}
        title={upgradeTitle}
        description={upgradeDesc}
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-4 lg:px-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Export Data</h1>
          <p className="text-muted-foreground text-sm">
            Configure and download your treatment records.
          </p>
        </div>
        {!(isProPreset && !isPro) && (
            <Button onClick={downloadCSV} disabled={loading || records.length === 0} className="w-full md:w-auto">
            <Download className="mr-2 size-4" />
            Download CSV
            </Button>
        )}
      </div>

      {isProPreset && !isPro && (
          <div className="px-4 lg:px-6">
            <Alert variant="default" className="bg-primary/5 border-primary/20">
                <Rocket className="h-4 w-4 text-primary" />
                <AlertTitle>Pro Feature</AlertTitle>
                <AlertDescription className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <span>{selectedPreset === "research_flat" ? "Research exports" : "Compliance exports"} are available on InjexPro Docs Pro.</span>
                <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full md:w-auto"
                    onClick={() => {
                        setUpgradeTitle(selectedPreset === "research_flat" ? "Research Export" : "Compliance Export")
                        setUpgradeDesc(`${selectedPreset === "research_flat" ? "Research exports" : "Compliance exports"} are available on InjexPro Docs Pro.`)
                        setUpgradeOpen(true)
                    }}
                >
                    Upgrade to Pro
                </Button>
                </AlertDescription>
            </Alert>
          </div>
      )}

      <div className="grid gap-6 md:grid-cols-[350px_1fr] px-4 lg:px-6 pb-8">
        <div className="flex flex-col gap-6">
            <Card className="overflow-hidden">
                <CardHeader>
                <CardTitle>Export Preset</CardTitle>
                <CardDescription>Select format for your export.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2">
                    <Button 
                        variant={selectedPreset === "structured" ? "default" : "outline"} 
                        className="justify-start h-9 text-left"
                        onClick={() => handlePresetChange("structured")}
                    >
                        <span className="truncate">Structured CSV</span>
                    </Button>
                    <Button 
                        variant={selectedPreset === "research_flat" ? "default" : "outline"} 
                        className="justify-start h-9 text-left group"
                        onClick={() => handlePresetChange("research_flat")}
                    >
                        <span className="flex-1 truncate">Research (Flat)</span>
                        <Badge 
                            variant="secondary" 
                            className={cn(
                                "ml-2 shrink-0 text-[10px] px-1 h-4 transition-colors",
                                selectedPreset === "research_flat" 
                                    ? "bg-primary-foreground/20 text-primary-foreground" 
                                    : "bg-primary/10 text-primary group-hover:bg-primary/20"
                            )}
                        >
                            PRO
                        </Badge>
                    </Button>
                    {enableCompliance && (
                        <>
                            <Button 
                                variant={selectedPreset === "compliance_minimal" ? "default" : "outline"} 
                                className="justify-start h-9 text-left group"
                                onClick={() => handlePresetChange("compliance_minimal")}
                            >
                                <span className="flex-1 truncate">Compliance (Minimal)</span>
                                <Badge 
                                    variant="secondary" 
                                    className={cn(
                                        "ml-2 shrink-0 text-[10px] px-1 h-4 transition-colors",
                                        selectedPreset === "compliance_minimal" 
                                            ? "bg-primary-foreground/20 text-primary-foreground" 
                                            : "bg-primary/10 text-primary group-hover:bg-primary/20"
                                    )}
                                >
                                    PRO
                                </Badge>
                            </Button>
                            <Button 
                                variant={selectedPreset === "compliance_followup" ? "default" : "outline"} 
                                className="justify-start h-9 text-left group"
                                onClick={() => handlePresetChange("compliance_followup")}
                            >
                                <span className="flex-1 truncate">Compliance (Follow-up)</span>
                                <Badge 
                                    variant="secondary" 
                                    className={cn(
                                        "ml-2 shrink-0 text-[10px] px-1 h-4 transition-colors",
                                        selectedPreset === "compliance_followup" 
                                            ? "bg-primary-foreground/20 text-primary-foreground" 
                                            : "bg-primary/10 text-primary group-hover:bg-primary/20"
                                    )}
                                >
                                    PRO
                                </Badge>
                            </Button>
                            <p className="text-[10px] text-muted-foreground mt-2 px-1">
                                These formats are commonly used for institutional or board documentation in some regions.
                            </p>
                        </>
                    )}
                </CardContent>
            </Card>

            <Card className="overflow-hidden">
                <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Select range to filter preview.</CardDescription>
                </CardHeader>
                <CardContent>
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Date Range</label>
                        <div className="flex flex-col gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !dateFrom && "text-muted-foreground"
                                    )}
                                    >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateFrom ? format(dateFrom, "PPP") : <span>From Date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                    mode="single"
                                    selected={dateFrom}
                                    onSelect={setDateFrom}
                                    initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !dateTo && "text-muted-foreground"
                                    )}
                                    >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateTo ? format(dateTo, "PPP") : <span>To Date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                    mode="single"
                                    selected={dateTo}
                                    onSelect={setDateTo}
                                    initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Indication</label>
                        <Select value={indicationFilter} onValueChange={setIndicationFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Indications" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Indications</SelectItem>
                                <SelectItem value="kopfschmerz">Headache</SelectItem>
                                <SelectItem value="dystonie">Dystonia</SelectItem>
                                <SelectItem value="spastik">Spasticity</SelectItem>
                                <SelectItem value="autonom">Autonomous</SelectItem>
                                <SelectItem value="andere">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                </CardContent>
            </Card>
        </div>

        <Card className="h-fit overflow-hidden">
            <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
                {loading ? "Loading..." : `Showing ${tableRecords.length} records.`}
            </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
            {loading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
            ) : (
                <div className="min-w-0 w-full">
                    <RecentRecordsTable records={tableRecords.slice(0, 50)} hideActions={true} />
                </div>
            )}
            </CardContent>
        </Card>
      </div>
    </div>
  )
}