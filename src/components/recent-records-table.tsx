"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Eye, Edit, Trash, ArrowUpDown } from "lucide-react"
import Link from "next/link"
import { deleteTreatment } from "@/app/(dashboard)/treatments/delete-action"
import { toast } from "sonner"
import { useTransition, useState } from "react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export interface TreatmentRecord {
  id: string
  treatment_date: string
  treatment_site: string
  indication: string
  product: string
  total_units: number
  patient?: {
    patient_code: string
  }
}

interface RecentRecordsTableProps {
  records: TreatmentRecord[]
  hideActions?: boolean
}

const indicationLabels: Record<string, string> = {
  kopfschmerz: "Headache",
  dystonie: "Dystonia",
  spastik: "Spasticity",
  autonom: "Autonomous",
  andere: "Other",
}

const indicationColors: Record<string, string> = {
  kopfschmerz: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  dystonie: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  spastik: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  autonom: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  andere: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400",
}

export function RecentRecordsTable({ records, hideActions = false }: RecentRecordsTableProps) {
  const [isPending, startTransition] = useTransition()
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);
  const showPatientColumn = records.some(r => r.patient)

  const sortedRecords = [...records].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    
    let aValue: string | number = '';
    let bValue: string | number = '';

    if (key === 'patient') {
        aValue = a.patient?.patient_code || '';
        bValue = b.patient?.patient_code || '';
    } else {
        const valA = a[key as keyof TreatmentRecord];
        const valB = b[key as keyof TreatmentRecord];
        
        if (typeof valA === 'string' || typeof valA === 'number') {
            aValue = valA;
        }
        if (typeof valB === 'string' || typeof valB === 'number') {
            bValue = valB;
        }
    }

    if (aValue < bValue) {
      return direction === 'ascending' ? -1 : 1;
    }
    if (aValue > bValue) {
      return direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteTreatment(id)
        toast.success("Treatment deleted")
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : "Failed to delete treatment")
      }
    })
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {showPatientColumn && (
              <TableHead>
                <SortButton label="Patient" onClick={() => requestSort("patient")} />
              </TableHead>
          )}
          <TableHead className="w-[140px]">
            <SortButton label="Date" onClick={() => requestSort("treatment_date")} />
          </TableHead>
          <TableHead>
            <SortButton label="Location" onClick={() => requestSort("treatment_site")} />
          </TableHead>
          <TableHead>
             <SortButton label="Indication" onClick={() => requestSort("indication")} />
          </TableHead>
          <TableHead>
             <SortButton label="Product" onClick={() => requestSort("product")} />
          </TableHead>
          <TableHead className="text-right w-[120px]">
             <SortButton label="Total Units" align="end" onClick={() => requestSort("total_units")} />
          </TableHead>
          {!hideActions && <TableHead className="w-[50px]"></TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedRecords.length === 0 ? (
          <TableRow>
            <TableCell colSpan={showPatientColumn ? (hideActions ? 6 : 7) : (hideActions ? 5 : 6)} className="h-24 text-center text-muted-foreground">
              No records found.
            </TableCell>
          </TableRow>
        ) : (
          sortedRecords.map((record) => (
            <TableRow key={record.id} className="group transition-colors">
            {showPatientColumn && <TableCell className="font-medium">{record.patient?.patient_code}</TableCell>}
            <TableCell className={cn("text-muted-foreground tabular-nums", !showPatientColumn && "font-medium text-foreground")}>
                {format(new Date(record.treatment_date), "dd.MM.yyyy")}
            </TableCell>
            <TableCell>{record.treatment_site}</TableCell>
            <TableCell>
                <Badge variant="outline" className={cn("font-normal border-none shadow-none", indicationColors[record.indication])}>
                    {indicationLabels[record.indication] || record.indication}
                </Badge>
            </TableCell>
            <TableCell>
                <span className="bg-muted px-1.5 py-0.5 rounded text-xs font-medium">{record.product}</span>
            </TableCell>
            <TableCell className="text-right font-bold tabular-nums">{record.total_units}</TableCell>
            {!hideActions && (
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href={`/treatments/${record.id}`}>
                        <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href={`/treatments/${record.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4 text-muted-foreground" />
                        Edit Record
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDelete(record.id)}
                      className="text-destructive focus:text-destructive cursor-pointer"
                      disabled={isPending}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            )}
          </TableRow>
        )))}
      </TableBody>
    </Table>
  )
}

function SortButton({ label, align = "start", onClick }: { label: string, align?: "start" | "end", onClick: () => void }) {
  return (
    <Button 
        variant="ghost" 
        size="sm"
        onClick={onClick} 
        className={cn(
            "-ml-2 h-8 hover:bg-muted font-semibold",
            align === "end" ? "justify-end w-full pr-0" : "justify-start"
        )}
    >
        {label} <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-50" />
    </Button>
  )
}

