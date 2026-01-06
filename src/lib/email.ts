// Placeholder for Email Service (e.g. Resend)
// To enable: npm install resend

interface EmailPayload {
  to: string
  subject: string
  html: string
}

export async function sendEmail(payload: EmailPayload) {
  if (process.env.RESEND_API_KEY) {
    // Real implementation would be:
    // import { Resend } from 'resend'
    // const resend = new Resend(process.env.RESEND_API_KEY)
    // await resend.emails.send({ from: 'InjexPro <notifications@injexpro.com>', ...payload })
    console.log(`[Email Service] Sending email via Resend to ${payload.to}`)
  } else {
    // Dev Mode / Fallback
    console.log(`
========== [EMAIL MOCK] ==========
To: ${payload.to}
Subject: ${payload.subject}
----------------------------------
${payload.html}
==================================
`)
  }
}

export async function sendPaymentFailedEmail(email: string, portalUrl: string) {
    await sendEmail({
        to: email,
        subject: "Action Required: Payment Failed",
        html: `
            <h1>Payment Failed</h1>
            <p>We were unable to process the payment for your InjexPro subscription.</p>
            <p>Your account has entered a grace period. Please update your payment method to avoid interruption.</p>
            <a href="${portalUrl}" style="padding: 10px 20px; background-color: #ef4444; color: white; text-decoration: none; border-radius: 5px;">Update Payment Method</a>
        `
    })
}

export async function sendInviteEmail(email: string, inviterName: string, orgName: string, inviteLink: string) {
    await sendEmail({
        to: email,
        subject: `Join ${orgName} on InjexPro`,
        html: `
            <h1>You've been invited!</h1>
            <p><strong>${inviterName}</strong> has invited you to join <strong>${orgName}</strong> on InjexPro.</p>
            <p>Click the link below to accept the invitation and set up your account:</p>
            <a href="${inviteLink}" style="padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">Join Team</a>
        `
    })
}
