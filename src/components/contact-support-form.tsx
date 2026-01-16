"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { toast } from "sonner"
import { Send, CheckCircle2, Loader2 } from "lucide-react"
import { sendSupportMessageAction } from "@/app/(dashboard)/support/actions"

export function ContactSupportForm() {
  const [isPending, startTransition] = useTransition()
  const [isSuccess, setIsSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await sendSupportMessageAction(formData)
      if (result?.success) {
        setIsSuccess(true)
        toast.success("Message sent successfully")
      } else if (result?.error) {
        toast.error("Please check your input and try again.")
      } else {
        toast.error("Failed to send message.")
      }
    })
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="rounded-full bg-emerald-100 p-3">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-xl">Message Sent</h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            Thank you for reaching out. Our team will get back to you as soon as possible.
          </p>
        </div>
        <Button variant="outline" onClick={() => setIsSuccess(false)}>
          Send another message
        </Button>
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="space-y-4 text-left">
      <div className="grid gap-2">
        <Label htmlFor="topic">Related To</Label>
        <Select name="topic" required defaultValue="technical">
            <SelectTrigger>
                <SelectValue placeholder="Select topic" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="technical">Technical Issue</SelectItem>
                <SelectItem value="clinical">Clinical Logic / Calculations</SelectItem>
                <SelectItem value="billing">Billing & Plan</SelectItem>
                <SelectItem value="feature">Feature Request</SelectItem>
            </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          name="subject"
          placeholder="Brief summary..."
          required
          disabled={isPending}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="recordId">Link to Record (Optional)</Label>
        <Input
          id="recordId"
          name="recordId"
          placeholder="Record UUID (e.g. 550e8400...)"
          disabled={isPending}
          className="font-mono text-xs"
        />
        <p className="text-[10px] text-muted-foreground text-amber-600/80">
            Do not enter patient names or identifiers.
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Tell us more details..."
          required
          rows={4}
          disabled={isPending}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Send Message
          </>
        )}
      </Button>
    </form>
  )
}
