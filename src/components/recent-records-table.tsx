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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Edit, Trash, ArrowUpDown } from "lucide-react"
import Link from "next/link"
import { deleteTreatment } from "@/app/(dashboard)/treatments/delete-action"
import { bulkSignTreatmentsAction, reopenTreatmentAction } from "@/app/(dashboard)/treatments/status-actions"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { useTransition, useState } from "react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuthContext } from "@/components/auth-context-provider"
import { checkPlan, PLAN_GATES } from "@/lib/permissions"
import { UpgradeDialog } from "@/components/upgrade-dialog"
import { TreatmentEditDialog } from "@/components/treatment-edit-dialog"
import { useTranslation } from "@/lib/i18n/i18n-context"

export interface TreatmentRecord {
  id: string
  treatment_date: string
  treatment_site: string
  indication: string
  product: string
  total_units: number
  status: string
  patient?: {
    patient_code: string
  }
}

interface RecentRecordsTableProps {
  records: TreatmentRecord[]
  hideActions?: boolean
  enableSelection?: boolean
  selectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void
}

const indicationColors: Record<string, string> = {
  kopfschmerz: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  dystonie: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  spastik: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  autonom: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  andere: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400",
}

export function RecentRecordsTable({ 
    records, 
    hideActions = false, 
    enableSelection = true,
    selectedIds: externalSelectedIds,
    onSelectionChange
}: RecentRecordsTableProps) {
  const [isPending, startTransition] = useTransition()
  const { userPlan } = useAuthContext()
  const { t } = useTranslation()
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);
  
  const [internalSelectedIds, setInternalSelectedIds] = useState<string[]>([])
  const selectedIds = externalSelectedIds || internalSelectedIds
  const setSelectedIds = onSelectionChange || setInternalSelectedIds

  const [showBulkSignDialog, setShowBulkSignDialog] = useState(false)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [reopenId, setReopenId] = useState<string | null>(null)
  const [reopenReason, setReopenReason] = useState("")
  
  const [editId, setEditId] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const showPatientColumn = records.some(r => r.patient)
  const router = useRouter()

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

  const handleEditClick = (record: TreatmentRecord) => {
      if (record.status === "SIGNED") {
          const canReopen = checkPlan(userPlan!, PLAN_GATES.REOPEN_TREATMENT)
          if (canReopen) {
              setReopenId(record.id)
          } else {
              setShowUpgradeDialog(true)
          }
      } else {
          setEditId(record.id)
          setIsEditDialogOpen(true)
      }
  }

  const confirmReopen = () => {
      if (!reopenId) return
      startTransition(async () => {
          try {
              await reopenTreatmentAction(reopenId, reopenReason)
              toast.success("Treatment re-opened")
              setEditId(reopenId)
              setIsEditDialogOpen(true)
              setReopenId(null)
              setReopenReason("")
              router.refresh()
          } catch {
              toast.error("Failed to re-open treatment")
          }
      })
  }

  const handleDeleteClick = (id: string) => {
      setDeleteId(id)
  }

  const confirmDelete = () => {
    if (!deleteId) return
    startTransition(async () => {
      try {
        await deleteTreatment(deleteId)
        toast.success("Treatment deleted")
        setDeleteId(null)
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : "Failed to delete treatment")
      }
    })
  }

  const handleSelectAll = (checked: boolean) => {
      if (checked) {
          setSelectedIds(sortedRecords.map(r => r.id))
      } else {
          setSelectedIds([])
      }
  }

  const handleSelectOne = (checked: boolean, id: string) => {
      if (checked) {
          setSelectedIds([...selectedIds, id])
      } else {
          setSelectedIds(selectedIds.filter(i => i !== id))
      }
  }

  const confirmBulkSign = () => {
      startTransition(async () => {
          try {
              const result = await bulkSignTreatmentsAction(selectedIds)
              toast.success(`${result.count} treatments signed`)
              setSelectedIds([])
              setShowBulkSignDialog(false)
          } catch {
              toast.error("Failed to sign treatments")
          }
      })
  }

  const allSelected = sortedRecords.length > 0 && selectedIds.length === sortedRecords.length

  return (
    <div className="space-y-2">
    <AlertDialog open={showBulkSignDialog} onOpenChange={setShowBulkSignDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('treatment.actions.sign')} {selectedIds.length} {t('sidebar.treatments')}?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will finalize the selected drafts and lock them from further editing. This cannot be undone in bulk.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={confirmBulkSign}>{t('treatment.actions.sign')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog open={!!reopenId} onOpenChange={(open) => !open && setReopenId(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('treatment.actions.reopen')}?</AlertDialogTitle>
          <AlertDialogDescription>
            This record is currently finalized. Do you want to re-open it for editing? This action will be logged.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="reason">{t('common.status')} {t('common.reset')}</Label>
                <Textarea 
                    id="reason" 
                    value={reopenReason} 
                    onChange={(e) => setReopenReason(e.target.value)} 
                    placeholder="e.g. Correction of dose..." 
                />
            </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={confirmReopen} disabled={!reopenReason.trim()}>{t('treatment.actions.reopen')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('common.delete')} {t('treatment.title')}?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the treatment record.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t('common.delete')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <UpgradeDialog 
        open={showUpgradeDialog} 
        onOpenChange={setShowUpgradeDialog}
        title="Professional Oversight Required"
        featureName="Re-opening finalized records"
        description="Institutional documentation standards often require strictly logged corrections. Upgrade to manage clinical risk and maintain a full audit history."
    />

    <div className="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {enableSelection && (
            <TableHead className="w-[40px]">
                <Checkbox 
                    checked={allSelected}
                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                    aria-label="Select all"
                />
            </TableHead>
          )}
          {showPatientColumn && (
              <TableHead>
                <SortButton label={t('treatment.table.patient')} onClick={() => requestSort("patient")} />
              </TableHead>
          )}
          <TableHead className="w-[140px]">
            <SortButton label={t('treatment.table.date')} onClick={() => requestSort("treatment_date")} />
          </TableHead>
          <TableHead className="w-[100px]">
            <SortButton label={t('treatment.table.status')} onClick={() => requestSort("status")} />
          </TableHead>
          <TableHead>
            <SortButton label={t('treatment.table.location')} onClick={() => requestSort("treatment_site")} />
          </TableHead>
          <TableHead>
             <SortButton label={t('treatment.table.indication')} onClick={() => requestSort("indication")} />
          </TableHead>
          <TableHead>
             <SortButton label={t('treatment.table.product')} onClick={() => requestSort("product")} />
          </TableHead>
          <TableHead className="text-right w-[120px]">
             <SortButton label={t('treatment.table.total_units')} align="end" onClick={() => requestSort("total_units")} />
          </TableHead>
          {!hideActions && <TableHead className="w-[120px]"></TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedRecords.length === 0 ? (
          <TableRow>
            <TableCell 
                colSpan={6 + (enableSelection ? 1 : 0) + (showPatientColumn ? 1 : 0) + (!hideActions ? 1 : 0)} 
                className="h-24 text-center text-muted-foreground"
            >
              {t('common.none')}
            </TableCell>
          </TableRow>
        ) : (
          sortedRecords.map((record) => (
            <TableRow key={record.id} className="group transition-colors" data-state={selectedIds.includes(record.id) && "selected"}>
            {enableSelection && (
                <TableCell>
                    <Checkbox 
                        checked={selectedIds.includes(record.id)}
                        onCheckedChange={(checked) => handleSelectOne(!!checked, record.id)}
                        aria-label="Select row"
                    />
                </TableCell>
            )}
            {showPatientColumn && <TableCell className="font-medium">{record.patient?.patient_code}</TableCell>}
            <TableCell className={cn("text-muted-foreground tabular-nums", !showPatientColumn && "font-medium text-foreground")}>
                {format(new Date(record.treatment_date), "dd.MM.yyyy")}
            </TableCell>
            <TableCell>
                {record.status === "SIGNED" && <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 text-xs py-0">{t('status.signed')}</Badge>}
                {record.status === "DRAFT" && <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 text-xs py-0">{t('status.draft')}</Badge>}
                {record.status === "VOID" && <Badge variant="destructive" className="text-xs py-0">{t('status.void')}</Badge>}
            </TableCell>
            <TableCell>{record.treatment_site}</TableCell>
            <TableCell>
                <Badge variant="outline" className={cn("font-normal border-none shadow-none", indicationColors[record.indication])}>
                    {t(`treatment.indications.${record.indication}` as "treatment.indications.kopfschmerz") || record.indication}
                </Badge>
            </TableCell>
            <TableCell>
                <span className="bg-muted px-1.5 py-0.5 rounded text-xs font-medium">{record.product}</span>
            </TableCell>
            <TableCell className="text-right font-bold tabular-nums">{record.total_units}</TableCell>
            {!hideActions && (
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <Link href={`/treatments/${record.id}`}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleEditClick(record)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDeleteClick(record.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    disabled={isPending}
                  >
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </TableCell>
            )}
          </TableRow>
        )))}
      </TableBody>
    </Table>
    </div>

    <TreatmentEditDialog 
        treatmentId={editId}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
    />
    </div>
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
