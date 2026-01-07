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
import { Eye, Edit, Trash, ArrowUpDown } from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deletePatient(subject.id)
        toast.success("Patient deleted")
        setShowDeleteDialog(false)
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Patient?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete patient <strong>{subject.patient_code}</strong> and all associated treatment records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => { e.preventDefault(); handleDelete(); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Deleting..." : "Delete Patient"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <Link href={`/patients/${subject.id}`}>
            <Eye className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Link>
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setEditOpen(true)} 
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setShowDeleteDialog(true)}
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          disabled={isPending}
        >
          <Trash className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
    </>
  )
}

export function SubjectsTable({ subjects }: SubjectsTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof Subject; direction: 'ascending' | 'descending' } | null>(null);

  const sortedSubjects = [...subjects].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    if (a[key] === null || a[key] === undefined) return 1;
    if (b[key] === null || b[key] === undefined) return -1;
    
    if (a[key]! < b[key]!) {
      return direction === 'ascending' ? -1 : 1;
    }
    if (a[key]! > b[key]!) {
      return direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key: keyof Subject) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <Button variant="ghost" onClick={() => requestSort('patient_code')} className="-ml-4 h-8 hover:bg-transparent font-semibold justify-start">
              Patient Code <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => requestSort('birth_year')} className="-ml-4 h-8 hover:bg-transparent font-semibold justify-start">
              Birth Year <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => requestSort('record_count')} className="-ml-4 h-8 hover:bg-transparent font-semibold justify-start">
              Records <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
             <Button variant="ghost" onClick={() => requestSort('last_activity')} className="-ml-4 h-8 hover:bg-transparent font-semibold justify-start">
              Last Activity <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>Notes</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedSubjects.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="h-24 text-center">
              No patients found.
            </TableCell>
          </TableRow>
        ) : (
          sortedSubjects.map((subject) => (
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