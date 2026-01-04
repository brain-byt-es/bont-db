"use client"

import { useState, useTransition } from "react"
import { format } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Download, Search, FilterX, Loader2 } from "lucide-react"
import { getAuditLogs } from "@/app/(dashboard)/settings/audit-logs/actions"
import { toast } from "sonner"

interface AuditLog {
  id: string
  occurredAt: Date
  action: string
  resourceType: string | null
  resourceId: string | null
  details: unknown
  actorMembership: {
    user: {
      displayName: string
      email: string
    }
  } | null
}

interface AuditLogManagerProps {
  initialLogs: AuditLog[]
  filterOptions: {
    actions: string[]
    users: { id: string; name: string }[]
  }
}

export function AuditLogManager({ initialLogs, filterOptions }: AuditLogManagerProps) {
  const [logs, setLogs] = useState(initialLogs)
  const [isPending, startTransition] = useTransition()
  
  // Filter States
  const [actionFilter, setActionFilter] = useState("all")
  const [userFilter, setUserFilter] = useState("all")
  const [searchQuery, setSearchSearchQuery] = useState("")

  const handleFilterChange = (type: string, value: string) => {
    const newFilters = {
        action: type === 'action' ? value : actionFilter,
        userId: type === 'user' ? value : userFilter,
    }

    if (type === 'action') setActionFilter(value)
    if (type === 'user') setUserFilter(value)

    startTransition(async () => {
        try {
            const updatedLogs = await getAuditLogs(newFilters)
            setLogs(updatedLogs)
        } catch {
            toast.error("Failed to filter logs")
        }
    })
  }

  const resetFilters = () => {
      setActionFilter("all")
      setUserFilter("all")
      setSearchSearchQuery("")
      setLogs(initialLogs)
  }

  const exportToCSV = () => {
    if (logs.length === 0) return

    const headers = ["Time", "User", "Email", "Action", "Resource Type", "Resource ID", "Details"]
    const rows = logs.map(log => [
        format(log.occurredAt, "yyyy-MM-dd HH:mm:ss"),
        log.actorMembership?.user.displayName || "System",
        log.actorMembership?.user.email || "",
        log.action,
        log.resourceType || "",
        log.resourceId || "",
        log.details ? JSON.stringify(log.details).replace(/,/g, ';') : ""
    ])

    const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `audit_log_${format(new Date(), "yyyy-MM-dd")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Audit log exported to CSV")
  }

  // Local client-side search for the current dataset
  const filteredLogs = logs.filter(log => {
      if (!searchQuery) return true
      const searchLower = searchQuery.toLowerCase()
      return (
          log.action.toLowerCase().includes(searchLower) ||
          log.resourceType?.toLowerCase().includes(searchLower) ||
          log.actorMembership?.user.displayName.toLowerCase().includes(searchLower) ||
          log.actorMembership?.user.email.toLowerCase().includes(searchLower)
      )
  })

  return (
    <Card>
      <CardHeader className="border-b bg-muted/20 pb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
                <CardTitle>Security & Audit Logs</CardTitle>
                <CardDescription>
                    Review system-wide activity. Showing last {logs.length} relevant events.
                </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={exportToCSV} disabled={logs.length === 0}>
                    <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
            </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search in logs..."
                    className="pl-8 bg-background h-9"
                    value={searchQuery}
                    onChange={(e) => setSearchSearchQuery(e.target.value)}
                />
            </div>
            <Select value={actionFilter} onValueChange={(v) => handleFilterChange('action', v)}>
                <SelectTrigger className="w-full md:w-[180px] h-9 bg-background">
                    <SelectValue placeholder="Action Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    {filterOptions.actions.map(a => (
                        <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={userFilter} onValueChange={(v) => handleFilterChange('user', v)}>
                <SelectTrigger className="w-full md:w-[180px] h-9 bg-background">
                    <SelectValue placeholder="User" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {filterOptions.users.map(u => (
                        <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {(actionFilter !== "all" || userFilter !== "all" || searchQuery !== "") && (
                <Button variant="ghost" size="sm" onClick={resetFilters} className="h-9">
                    <FilterX className="mr-2 h-4 w-4" /> Reset
                </Button>
            )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px] relative">
          {isPending && (
              <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
          )}
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="sticky top-0 bg-background pl-6">Time</TableHead>
                <TableHead className="sticky top-0 bg-background">User</TableHead>
                <TableHead className="sticky top-0 bg-background">Action</TableHead>
                <TableHead className="sticky top-0 bg-background">Resource</TableHead>
                <TableHead className="sticky top-0 bg-background pr-6">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                    No matching audit logs found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} className="group transition-colors">
                    <TableCell className="whitespace-nowrap pl-6 py-4 text-[11px] font-mono text-muted-foreground">
                      {format(new Date(log.occurredAt), "yyyy-MM-dd HH:mm:ss")}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-xs">{log.actorMembership?.user.displayName || "System"}</span>
                        <span className="text-[10px] text-muted-foreground">{log.actorMembership?.user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant="outline" className="text-[10px] font-mono px-1 py-0 bg-background">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="text-[10px] font-mono opacity-70">{log.resourceType}</span>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-[10px] pr-6 py-4 text-muted-foreground group-hover:text-foreground">
                      {log.details ? JSON.stringify(log.details) : "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
