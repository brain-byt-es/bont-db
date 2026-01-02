"use client"

import { Button } from "@/components/ui/button"
import { acceptInviteAction } from "./actions"
import { useTransition } from "react"
import { toast } from "sonner"

export function AcceptButton({ token }: { token: string }) {
  const [isPending, startTransition] = useTransition()

  const handleAccept = () => {
    startTransition(async () => {
        const result = await acceptInviteAction(token)
        if (result?.error) {
            toast.error(result.error)
        }
    })
  }

  return (
    <Button onClick={handleAccept} disabled={isPending} size="lg" className="w-full">
        {isPending ? "Joining..." : "Accept Invitation"}
    </Button>
  )
}
