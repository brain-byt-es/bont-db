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
import { MoreHorizontal, Eye, Edit, Trash } from "lucide-react"
import Link from "next/link"
import { deleteTreatment } from "@/app/(dashboard)/treatments/delete-action"
import { toast } from "sonner"
import { useTransition } from "react"

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
}

const indicationLabels: Record<string, string> = {
  kopfschmerz: "Headache",
  dystonie: "Dystonia",
  spastik: "Spasticity",
  autonom: "Autonomous",
  andere: "Other",
}

export function RecentRecordsTable({ records }: RecentRecordsTableProps) {
  const [isPending, startTransition] = useTransition()
  const showPatientColumn = records.some(r => r.patient)

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
          {showPatientColumn && <TableHead>Patient</TableHead>}
          <TableHead className="w-[100px]">Date</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Indication</TableHead>
          <TableHead>Product</TableHead>
          <TableHead className="text-right">Total Units</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.length === 0 ? (
          <TableRow>
            <TableCell colSpan={showPatientColumn ? 7 : 6} className="h-24 text-center">
              No records found.
            </TableCell>
          </TableRow>
        ) : (
          records.map((record) => (
            <TableRow key={record.id}>
            {showPatientColumn && <TableCell className="font-medium">{record.patient?.patient_code}</TableCell>}
            <TableCell className={!showPatientColumn ? "font-medium" : ""}>{record.treatment_date}</TableCell>
            <TableCell>{record.treatment_site}</TableCell>
            <TableCell>{indicationLabels[record.indication] || record.indication}</TableCell>
            <TableCell>{record.product}</TableCell>
            <TableCell className="text-right">{record.total_units}</TableCell>
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
          </TableRow>
        )))}
      </TableBody>
    </Table>
  )
}
