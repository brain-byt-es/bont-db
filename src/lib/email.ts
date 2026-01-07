import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

interface EmailPayload {
  to: string
  subject: string
  html: string
}

export async function sendEmail(payload: EmailPayload) {
  if (resend) {
    try {
        await resend.emails.send({ 
            from: 'InjexPro <notifications@injexpro.com>', 
            ...payload 
        })
        console.log(`[Email Service] Email sent to ${payload.to}`)
    } catch (error) {
        console.error(`[Email Service] Failed to send email to ${payload.to}:`, error)
    }
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

export async function sendWelcomeEmail(email: string, name: string) {
    await sendEmail({
        to: email,
        subject: "Welcome to InjexPro",
        html: `
            <h1>Welcome to InjexPro, ${name}!</h1>
            <p>We're excited to have you on board.</p>
            <p>InjexPro helps you streamline your clinical documentation and ensure compliance.</p>
            <p>Get started by setting up your organization:</p>
            <a href="https://app.injexpro.com/login" style="padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
        `
    })
}

export async function sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`
    
    await sendEmail({
        to: email,
        subject: "Verify your email - InjexPro",
        html: `
            <h1>Verify your email address</h1>
            <p>Thanks for signing up for InjexPro.</p>
            <p>Please confirm your email address by clicking the link below:</p>
            <a href="${verificationUrl}" style="padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
            <p>Or copy this link: <a href="${verificationUrl}">${verificationUrl}</a></p>
            <p>This link will expire in 24 hours.</p>
        `
    })
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
