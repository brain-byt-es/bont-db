"use server"

import { getUserContext } from "@/lib/auth-context"
import { sendEmail } from "@/lib/email"
import { z } from "zod"

const contactSchema = z.object({
  topic: z.string().min(1, "Please select a topic"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  recordId: z.string().optional()
})

export async function sendSupportMessageAction(formData: FormData) {
  const { user } = await getUserContext()
  
  const validatedFields = contactSchema.safeParse({
    topic: formData.get("topic"),
    subject: formData.get("subject"),
    message: formData.get("message"),
    recordId: formData.get("recordId")
  })

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors }
  }

  const { topic, subject, message, recordId } = validatedFields.data

  try {
    await sendEmail({
      to: "support@injexpro.com",
      subject: `[${topic}] ${subject}`,
      html: `
        <h2>New Support Request</h2>
        <p><strong>From:</strong> ${user.name} (${user.email})</p>
        <p><strong>Topic:</strong> ${topic}</p>
        ${recordId ? `<p><strong>Ref Record:</strong> ${recordId}</p>` : ''}
        <hr />
        <h3>${subject}</h3>
        <p style="white-space: pre-wrap;">${message}</p>
      `,
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to send support message:", error)
    return { error: "Failed to send message. Please try again later." }
  }
}
