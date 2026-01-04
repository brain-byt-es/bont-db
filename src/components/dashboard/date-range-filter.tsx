"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

const RANGES = [
  { label: "Last 30 Days", value: "30" },
  { label: "Last 90 Days", value: "90" },
  { label: "Last 6 Months", value: "180" },
  { label: "Last 12 Months", value: "365" },
  { label: "All Time", value: "3650" }, // ~10 years
]

export function DateRangeFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentValue = searchParams.get("range") || "90"
  
  const currentLabel = RANGES.find(r => r.value === currentValue)?.label || "Last 90 Days"

  const handleRangeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("range", value)
    router.push(`/dashboard?${params.toString()}`, { scroll: false })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-9 gap-2 text-sm font-normal">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span>{currentLabel}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {RANGES.map((range) => (
          <DropdownMenuItem 
            key={range.value}
            onClick={() => handleRangeChange(range.value)}
          >
            {range.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
