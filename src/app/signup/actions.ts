"use server"

import { z } from "zod"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { AuthProvider, LegalDocumentType } from "@/generated/client/enums"
import { headers } from "next/headers"
import { LEGAL_VERSIONS } from "@/lib/legal-config"
import { sendVerificationEmail } from "@/lib/email"
import crypto from "crypto"

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export async function signupAction(formData: FormData) {
  const headersList = await headers()
  const userAgent = headersList.get("user-agent") || undefined
  const acceptedIp = headersList.get("x-forwarded-for") || "unknown"

  const name = formData.get("name") as string
  const email = (formData.get("email") as string)?.toLowerCase().trim()
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirm-password") as string

  const validatedFields = signupSchema.safeParse({
    name,
    email,
    password,
    confirmPassword,
  })

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors }
  }

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: { email },
  })

  if (existingUser) {
    return { error: "An account with this email already exists." }
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12)

    await prisma.$transaction(async (tx) => {
        // Create user
        await tx.user.create({
            data: {
                email,
                displayName: name,
                passwordHash,
                identities: {
                    create: {
                        provider: AuthProvider.credentials,
                        providerSubject: email, // For credentials, email is the subject
                        emailAtAuth: email,
                    }
                },
                legalAcceptances: {
                    createMany: {
                        data: [
                            {
                                documentType: LegalDocumentType.TOS,
                                documentVersion: LEGAL_VERSIONS.TOS,
                                acceptedIp,
                                userAgent
                            },
                            {
                                documentType: LegalDocumentType.PRIVACY,
                                documentVersion: LEGAL_VERSIONS.PRIVACY,
                                acceptedIp,
                                userAgent
                            }
                        ]
                    }
                }
            }
        })

        // Generate verification token
        const token = crypto.randomUUID()
        const expires = new Date(new Date().getTime() + 24 * 60 * 60 * 1000) // 24 hours

        await tx.verificationToken.create({
            data: {
                identifier: email,
                token,
                expires
            }
        })
        
        // Send verification email
        // We use 'void' to not await the email sending in the transaction
        // However, standard practice is to await it after transaction or in a background job
        // Here we'll just fire it. Ideally we catch errors.
        sendVerificationEmail(email, token).catch(e => console.error("Failed to send verification email", e))
    })

    return { success: true }
  } catch (error) {
    console.error("Signup failed:", error)
    return { error: "Something went wrong. Please try again." }
  }
}