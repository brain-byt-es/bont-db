"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
        // Handle validation errors if needed, for now just show generic error
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
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          name="subject"
          placeholder="What do you need help with?"
          required
          disabled={isPending}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Tell us more about your issue..."
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
