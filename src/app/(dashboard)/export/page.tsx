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
import { getExportData } from "./actions"
import { toast } from "sonner"
import { getComplianceSettings } from "../settings/actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Rocket } from "lucide-react"

interface ExportRecord {
  id: string
  treatment_date: string
  treatment_site: string
  indication: string
  product: string
  total_units: number
  patients?: {
    patient_code: string
    birth_year: number
  }
  followups?: {
    followup_date: string
    outcome: string
  }[]
}

type ExportPreset = "structured" | "compliance_minimal" | "compliance_followup"

export default function ExportPage() {
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()
  const [indicationFilter, setIndicationFilter] = useState<string>("all")
  const [records, setRecords] = useState<ExportRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [enableCompliance, setEnableCompliance] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<ExportPreset>("structured")
  const isPro = false // This should come from user metadata or billing state in production

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [exportData, settings] = await Promise.all([
            getExportData(),
            getComplianceSettings()
        ])
        setRecords(exportData as unknown as ExportRecord[])
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

  const downloadCSV = () => {
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
      patient: r.patients
  }))

  const isCompliancePreset = selectedPreset === "compliance_minimal" || selectedPreset === "compliance_followup"

  return (
    <div className="flex flex-col gap-4 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Export Data</h1>
        <Button onClick={downloadCSV} disabled={loading || records.length === 0}>
          <Download className="mr-2 size-4" />
          {isCompliancePreset && !isPro ? "Upgrade to Pro" : "Download CSV"}
        </Button>
      </div>

      {isCompliancePreset && !isPro && (
          <Alert variant="default" className="bg-primary/5 border-primary/20">
            <Rocket className="h-4 w-4 text-primary" />
            <AlertTitle>Pro Feature</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>Compliance exports are available on InjexPro Docs Pro.</span>
              <Button size="sm" variant="outline" className="ml-4">Upgrade to Pro</Button>
            </AlertDescription>
          </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                <CardTitle>Export Preset</CardTitle>
                <CardDescription>Select format for your export.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2">
                    <Button 
                        variant={selectedPreset === "structured" ? "default" : "outline"} 
                        className="justify-start"
                        onClick={() => setSelectedPreset("structured")}
                    >
                        Structured CSV Export
                    </Button>
                    {enableCompliance && (
                        <>
                            <Button 
                                variant={selectedPreset === "compliance_minimal" ? "default" : "outline"} 
                                className="justify-start"
                                onClick={() => setSelectedPreset("compliance_minimal")}
                            >
                                Compliance Export (Minimal)
                            </Button>
                            <Button 
                                variant={selectedPreset === "compliance_followup" ? "default" : "outline"} 
                                className="justify-start"
                                onClick={() => setSelectedPreset("compliance_followup")}
                            >
                                Compliance Export (With Follow-up)
                            </Button>
                            <p className="text-[10px] text-muted-foreground mt-2 px-1">
                                These formats are commonly used for institutional or board documentation in some regions.
                            </p>
                        </>
                    )}
                </CardContent>
            </Card>

            <Card>
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

        <Card className="h-fit">
            <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
                {loading ? "Loading..." : `Showing ${tableRecords.length} records for ${selectedPreset.replace('_', ' ')}.`}
            </CardDescription>
            </CardHeader>
            <CardContent>
            {loading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
            ) : (
                <RecentRecordsTable records={tableRecords.slice(0, 50)} hideActions={true} />
            )}
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
