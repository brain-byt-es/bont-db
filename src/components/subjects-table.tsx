"use client"

import { useState, useTransition } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, MoreHorizontal, Edit, Trash } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deletePatient } from "@/app/(dashboard)/patients/delete-action"
import { toast } from "sonner"
import { PatientEditDialog } from "@/components/patient-edit-dialog"


export interface Subject {
  id: string
  patient_code: string
  birth_year: number
  notes?: string | null
  record_count?: number
  last_activity?: string | null
}

interface SubjectsTableProps {
  subjects: Subject[]
}

function PatientActions({ subject }: { subject: Subject }) {
  const [isPending, startTransition] = useTransition()
  const [editOpen, setEditOpen] = useState(false)

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deletePatient(subject.id)
        toast.success("Patient deleted")
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : "Failed to delete patient")
      }
    })
  }

  return (
    <>
      <PatientEditDialog 
        patient={{
          ...subject,
          notes: subject.notes || null
        }} 
        open={editOpen} 
        onOpenChange={setEditOpen} 
      />
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
            <Link href={`/patients/${subject.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
            disabled={isPending}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export function SubjectsTable({ subjects }: SubjectsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Patient Code</TableHead>
          <TableHead>Birth Year</TableHead>
          <TableHead>Records</TableHead>
          <TableHead>Last Activity</TableHead>
          <TableHead>Notes</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subjects.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="h-24 text-center">
              No patients found.
            </TableCell>
          </TableRow>
        ) : (
          subjects.map((subject) => (
            <TableRow key={subject.id}>
            <TableCell className="font-medium">{subject.patient_code}</TableCell>
            <TableCell>{subject.birth_year}</TableCell>
            <TableCell>{subject.record_count ?? 0}</TableCell>
            <TableCell>{subject.last_activity ?? '-'}</TableCell>
            <TableCell className="max-w-[200px] truncate">{subject.notes}</TableCell>
            <TableCell>
              <PatientActions subject={subject} />
            </TableCell>
          </TableRow>
        )))}
      </TableBody>
    </Table>
  )
}
