"use client"

import { useState, useTransition } from "react"
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
import { Trash2, Copy, Check, UserPlus, Lock } from "lucide-react"
import { createInviteAction, revokeInviteAction, removeMemberAction, updateMemberRoleAction } from "@/app/(dashboard)/settings/invite-actions"
import { toast } from "sonner"
import { format } from "date-fns"
import { MembershipRole, Plan } from "@/generated/client/enums"
import { useAuthContext } from "@/components/auth-context-provider"
import { TeamUpgradeTeaser } from "./team-upgrade-teaser"
import { checkPlan } from "@/lib/permissions"
import { cn } from "@/lib/utils"

interface TeamData {
  members: {
    id: string
    userId: string
    name: string
    email: string
    role: MembershipRole
    status: string
    joinedAt: Date
  }[]
  invites: {
    id: string
    email: string
    role: MembershipRole
    expiresAt: Date
    createdAt: Date
  }[]
}

export function TeamManager({ initialData }: { initialData: TeamData }) {
  const { userRole, userId, userPlan } = useAuthContext()
  const [isPending, startTransition] = useTransition()
  
  const isPro = checkPlan(userPlan as Plan, Plan.PRO)
  
  // Invite Form State
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<MembershipRole>(MembershipRole.PROVIDER)
  
  // Success Modal State
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleRoleChange = (memberId: string, newRole: string) => {
      startTransition(async () => {
          const res = await updateMemberRoleAction(memberId, newRole as MembershipRole)
          if (res.error) toast.error(res.error)
          else toast.success("Role updated")
      })
  }

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

      {/* Invite Section / Teaser */}
      {!isPro ? (
          <TeamUpgradeTeaser />
      ) : (
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
                <div className="grid gap-2 w-[240px]">
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as MembershipRole)}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={MembershipRole.PROVIDER}>Provider (Docs + Patients)</SelectItem>
                      <SelectItem value={MembershipRole.ASSISTANT}>Assistant (Drafts only)</SelectItem>
                      <SelectItem value={MembershipRole.CLINIC_ADMIN}>Admin (Team + Billing)</SelectItem>
                      <SelectItem value={MembershipRole.READONLY}>Read Only (Viewer)</SelectItem>
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
      )}

      {/* Members List */}
      <Card className={cn(!isPro && "opacity-90 border-dashed")}>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Team Members</CardTitle>
                {!isPro && <CardDescription>Invite features are disabled on Basic.</CardDescription>}
            </div>
            {!isPro && <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 flex gap-1.5 items-center">
                <Lock className="size-3" /> Single User Mode
            </Badge>}
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
                    {initialData.members.map((m) => {
                        const isSelf = m.userId === userId;
                        const isOwner = m.role === MembershipRole.OWNER;
                        const canChangeRole = !isSelf && (!isOwner || userRole === MembershipRole.OWNER);

                        return (
                        <TableRow key={m.id}>
                            <TableCell className="flex items-center gap-3 py-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">{m.name.substring(0,2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">{m.name}</span>
                                        {isSelf && <Badge variant="secondary" className="text-[10px] h-4 px-1">You</Badge>}
                                    </div>
                                    <span className="text-xs text-muted-foreground">{m.email}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                {isOwner ? (
                                    <Badge variant="default" className="bg-purple-600 hover:bg-purple-600">Owner</Badge>
                                ) : (
                                    <Select 
                                        defaultValue={m.role} 
                                        onValueChange={(v) => handleRoleChange(m.id, v)}
                                        disabled={!canChangeRole || isPending}
                                    >
                                        <SelectTrigger className="h-8 w-[140px] text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={MembershipRole.PROVIDER}>Provider</SelectItem>
                                            <SelectItem value={MembershipRole.ASSISTANT}>Assistant</SelectItem>
                                            <SelectItem value={MembershipRole.CLINIC_ADMIN}>Admin</SelectItem>
                                            <SelectItem value={MembershipRole.READONLY}>Read Only</SelectItem>
                                            {userRole === MembershipRole.OWNER && (
                                                <SelectItem value={MembershipRole.OWNER} className="text-purple-600 font-semibold">Transfer Ownership</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-none text-[10px]">Active</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs">
                                {format(new Date(m.joinedAt), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell className="text-right">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => handleRemoveMember(m.id)} 
                                    className="text-muted-foreground hover:text-destructive h-8 w-8"
                                    disabled={isSelf || isOwner || isPending}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                        )
                    })}
                    {initialData.invites.map((i) => (
                        <TableRow key={i.id} className="opacity-70 bg-muted/30 italic">
                            <TableCell className="flex items-center gap-3 py-3">
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border border-dashed">
                                    <span className="text-xs text-muted-foreground">?</span>
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="font-medium text-sm text-muted-foreground">Invitation Sent</span>
                                    <span className="text-xs text-muted-foreground">{i.email}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="border-dashed text-xs px-2">{i.role}</Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-none text-[10px]">Pending</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs">
                                Sent {format(new Date(i.createdAt), "MMM d")}
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleRevoke(i.id)} className="text-muted-foreground hover:text-destructive h-8 w-8">
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