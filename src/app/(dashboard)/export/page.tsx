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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RecentRecordsTable } from "@/components/recent-records-table"
import { mockRecords, mockSubjects } from "@/lib/mock-data"
import { CalendarIcon, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { format } from "date-fns"

export default function ExportPage() {
  const [date, setDate] = useState<Date>()

  const mappedRecords = mockRecords.map(record => {
    const subject = mockSubjects.find(s => s.id === record.subject_id)
    return {
      id: record.id,
      treatment_date: record.date,
      treatment_site: record.location,
      indication: record.category.toLowerCase(), // RecentRecordsTable uses lowercase keys for indicationLabels
      product: record.product_label,
      total_units: record.total_numeric_value,
      patient: subject ? { patient_code: subject.patient_code } : undefined
    }
  })

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Export Data</h1>
        <Button>
          <Download className="mr-2 size-4" />
          Download CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Select range and category to export.</CardDescription>
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
                      {date ? format(date, "PPP") : <span>Pick a date range</span>}
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
             
             <div className="grid gap-2">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="migraine">Migraine</SelectItem>
                    <SelectItem value="dystonia">Dystonia</SelectItem>
                  </SelectContent>
                </Select>
             </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>Showing first 5 records.</CardDescription>
        </CardHeader>
        <CardContent>
           <RecentRecordsTable records={mappedRecords} />
        </CardContent>
      </Card>
    </div>
  )
}
