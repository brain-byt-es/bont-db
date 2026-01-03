import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { createHash } from "crypto"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AcceptButton } from "./client-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

interface PageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function AcceptInvitePage({ searchParams }: PageProps) {
  const { token } = await searchParams

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-destructive">Invalid Link</CardTitle>
            <CardDescription>Missing invitation token.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const session = await getServerSession(authOptions)

  if (!session) {
    // Redirect to login, preserving the destination
    const callbackUrl = encodeURIComponent(`/invite/accept?token=${token}`)
    redirect(`/login?callbackUrl=${callbackUrl}`)
  }

  // Validate Token Preview (Read-Only)
  const tokenHash = createHash("sha256").update(token).digest("hex")
  const invite = await prisma.organizationInvite.findUnique({
    where: { tokenHash },
    include: {
        organization: true,
        createdByMembership: { include: { user: true } }
    }
  })

  if (!invite || (invite.acceptedAt) || (new Date() > invite.expiresAt)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-destructive">Invalid or Expired Invite</CardTitle>
            <CardDescription>This invitation is no longer valid.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
                <a href="/dashboard">Go to Dashboard</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const emailMismatch = session.user.email && invite.email && (session.user.email.toLowerCase().trim() !== invite.email.toLowerCase().trim());

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle>Join {invite.organization.name}</CardTitle>
          <CardDescription>
            You have been invited by {invite.createdByMembership.user.displayName} to join their team as a <strong>{invite.role}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {emailMismatch && (
             <Alert variant="warning" className="text-left bg-yellow-50 text-yellow-900 border-yellow-200">
               <AlertTriangle className="h-4 w-4 text-yellow-600" />
               <AlertTitle>Email Mismatch</AlertTitle>
               <AlertDescription>
                 This invite was sent to <strong>{invite.email}</strong>, but you are logged in as <strong>{session.user.email}</strong>. Accepting this will link your current account.
               </AlertDescription>
             </Alert>
          )}
          <AcceptButton token={token} />
        </CardContent>
      </Card>
    </div>
  )
}
