import { getAuditLogs } from "./actions"
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

export default async function AuditLogsPage() {
  const logs = await getAuditLogs()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">
          Track critical actions and data changes within your organization.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Showing the last 100 system events.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No audit logs found.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(log.occurredAt, "yyyy-MM-dd HH:mm:ss")}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{log.actorMembership?.user.displayName || "System"}</span>
                        <span className="text-xs text-muted-foreground">{log.actorMembership?.user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.action}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-mono">{log.resourceType}</span>
                      {log.resourceId && (
                        <p className="text-[10px] text-muted-foreground truncate max-w-[100px]">
                          {log.resourceId}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-xs">
                      {log.details ? JSON.stringify(log.details) : "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
