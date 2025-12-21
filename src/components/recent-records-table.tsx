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
import { MoreHorizontal, Eye, Edit, Trash, ArrowUpDown } from "lucide-react"
import Link from "next/link"
import { deleteTreatment } from "@/app/(dashboard)/treatments/delete-action"
import { toast } from "sonner"
import { useTransition, useState } from "react"

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

export function RecentRecordsTable({ records, hideActions = false }: RecentRecordsTableProps) {
  const [isPending, startTransition] = useTransition()
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);
  const showPatientColumn = records.some(r => r.patient)

  const sortedRecords = [...records].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    
    let aValue: string | number = '';
    let bValue: string | number = '';

    // Handle nested patient code
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
          }    })
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {showPatientColumn && (
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort('patient')} className="-ml-4 h-8 hover:bg-transparent font-semibold justify-start">
                  Patient <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
          )}
          <TableHead className="w-[120px]">
            <Button variant="ghost" onClick={() => requestSort('treatment_date')} className="-ml-4 h-8 hover:bg-transparent font-semibold justify-start">
              Date <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => requestSort('treatment_site')} className="-ml-4 h-8 hover:bg-transparent font-semibold justify-start">
              Location <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
             <Button variant="ghost" onClick={() => requestSort('indication')} className="-ml-4 h-8 hover:bg-transparent font-semibold justify-start">
              Indication <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
             <Button variant="ghost" onClick={() => requestSort('product')} className="-ml-4 h-8 hover:bg-transparent font-semibold justify-start">
              Product <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead className="text-right">
             <Button variant="ghost" onClick={() => requestSort('total_units')} className="-mr-4 h-8 hover:bg-transparent font-semibold justify-end w-full">
              Total Units <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          {!hideActions && <TableHead className="w-[50px]"></TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedRecords.length === 0 ? (
          <TableRow>
            <TableCell colSpan={showPatientColumn ? (hideActions ? 6 : 7) : (hideActions ? 5 : 6)} className="h-24 text-center">
              No records found.
            </TableCell>
          </TableRow>
        ) : (
          sortedRecords.map((record) => (
            <TableRow key={record.id}>
            {showPatientColumn && <TableCell className="font-medium">{record.patient?.patient_code}</TableCell>}
            <TableCell className={!showPatientColumn ? "font-medium" : ""}>{record.treatment_date}</TableCell>
            <TableCell>{record.treatment_site}</TableCell>
            <TableCell>{indicationLabels[record.indication] || record.indication}</TableCell>
            <TableCell>{record.product}</TableCell>
            <TableCell className="text-right">{record.total_units}</TableCell>
            {!hideActions && (
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href={`/treatments/${record.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/treatments/${record.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDelete(record.id)}
                      className="text-destructive focus:text-destructive"
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