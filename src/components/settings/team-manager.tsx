"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trash2, Copy, Check, UserPlus } from "lucide-react"
import { createInviteAction, revokeInviteAction, removeMemberAction } from "@/app/(dashboard)/settings/invite-actions"
import { toast } from "sonner"
import { useTransition } from "react"
import { format } from "date-fns"

interface TeamData {
  members: {
    id: string
    name: string
    email: string
    role: string
    status: string
    joinedAt: Date
  }[]
  invites: {
    id: string
    email: string
    role: string
    expiresAt: Date
    createdAt: Date
  }[]
}

export function TeamManager({ initialData }: { initialData: TeamData }) {
  const [isPending, startTransition] = useTransition()
  
  // Invite Form State
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("PROVIDER")
  
  // Success Modal State
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
        const formData = new FormData()
        formData.append("email", inviteEmail)
        formData.append("role", inviteRole)

        const result = await createInviteAction(formData)
        if (result.error) {
            toast.error(result.error)
        } else if (result.success && result.inviteLink) {
            setInviteLink(result.inviteLink)
            setInviteEmail("")
        }
    })
  }

  const handleCopy = () => {
      if (inviteLink) {
          navigator.clipboard.writeText(inviteLink)
          setCopied(true)
          toast.success("Link copied to clipboard")
          setTimeout(() => setCopied(false), 2000)
      }
  }

  const handleRevoke = (id: string) => {
      if(!confirm("Revoke this invite?")) return
      startTransition(async () => {
          await revokeInviteAction(id)
          toast.success("Invite revoked")
      })
  }

  const handleRemoveMember = (id: string) => {
      if(!confirm("Remove this member? They will lose access immediately.")) return
      startTransition(async () => {
          const res = await removeMemberAction(id)
          if(res.error) toast.error(res.error)
          else toast.success("Member removed")
      })
  }

  return (
    <div className="space-y-6">
      <Dialog open={!!inviteLink} onOpenChange={(open) => !open && setInviteLink(null)}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Invite Created</DialogTitle>
                  <DialogDescription>
                      Share this link with the user. It will expire in 7 days.
                  </DialogDescription>
              </DialogHeader>
              <div className="flex items-center space-x-2 mt-4">
                  <Input value={inviteLink || ""} readOnly />
                  <Button size="icon" onClick={handleCopy}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
              </div>
              <DialogFooter>
                  <Button onClick={() => setInviteLink(null)}>Done</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      {/* Invite Form */}
      <Card>
        <CardHeader>
          <CardTitle>Invite New Member</CardTitle>
          <CardDescription>Generate an invite link for a new team member.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="flex gap-4 items-end">
            <div className="grid gap-2 flex-1">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                placeholder="colleague@clinic.com" 
                type="email" 
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2 w-[180px]">
              <Label htmlFor="role">Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PROVIDER">Provider</SelectItem>
                  <SelectItem value="ASSISTANT">Assistant</SelectItem>
                  <SelectItem value="CLINIC_ADMIN">Admin</SelectItem>
                  <SelectItem value="READONLY">Read Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isPending}>
                <UserPlus className="mr-2 h-4 w-4" />
                {isPending ? "Generating..." : "Generate Invite"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardHeader>
            <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {initialData.members.map((m) => (
                        <TableRow key={m.id}>
                            <TableCell className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{m.name.substring(0,2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="font-medium text-sm">{m.name}</span>
                                    <span className="text-xs text-muted-foreground">{m.email}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline">{m.role}</Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-none">Active</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                                {format(new Date(m.joinedAt), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveMember(m.id)} className="text-muted-foreground hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    {initialData.invites.map((i) => (
                        <TableRow key={i.id} className="opacity-70 bg-muted/30">
                            <TableCell className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border border-dashed">
                                    <span className="text-xs text-muted-foreground">?</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-sm text-muted-foreground">Pending Invite</span>
                                    <span className="text-xs text-muted-foreground">{i.email}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="border-dashed">{i.role}</Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-none">Pending</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                                Sent {format(new Date(i.createdAt), "MMM d")}
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleRevoke(i.id)} className="text-muted-foreground hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  )
}
