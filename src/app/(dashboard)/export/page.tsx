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

export default function ExportPage() {
  const [date, setDate] = useState<Date>()
  const [records, setRecords] = useState<ExportRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const data = await getExportData()
        // Supabase returns data that matches the shape, but we might need to cast or validate
        setRecords(data as unknown as ExportRecord[])
      } catch (e) {
        toast.error("Failed to load export data")
      } finally {
        setLoading(false)
      }
    }
    fetchRecords()
  }, [])

  const downloadCSV = () => {
    if (!records.length) return

    // AK-Zertifikat specific fields
    const headers = [
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

    const csvContent = [
      headers.join(","),
      ...records.map(r => {
        const row = [
          r.patients?.patient_code || "",
          r.patients?.birth_year || "",
          r.indication || "",
          r.treatment_date || "",
          `"${r.treatment_site || ""}"`, // Quote strings that might contain commas
          r.product || "",
          r.total_units || "",
          r.followups?.[0]?.followup_date || "",
          `"${r.followups?.[0]?.outcome || ""}"`
        ]
        return row.join(",")
      })
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `ak_certificate_export_${format(new Date(), "yyyy-MM-dd")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Filter logic (simple client-side for now)
  const filteredRecords = records.filter(r => {
     if (date && new Date(r.treatment_date) < date) return false
     return true
  })

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

  return (
    <div className="flex flex-col gap-4 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Export Data</h1>
        <Button onClick={downloadCSV} disabled={loading || records.length === 0}>
          <Download className="mr-2 size-4" />
          Download AK-Certificate (CSV)
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Select range to filter preview and export.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
             <div className="grid gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Filter by Date (Since)</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
             </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            {loading ? "Loading..." : `Showing ${tableRecords.length} records.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
           {loading ? (
             <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
           ) : (
             <RecentRecordsTable records={tableRecords.slice(0, 50)} />
           )}
        </CardContent>
      </Card>
    </div>
  )
}
