"use server"

import { z } from "zod"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { AuthProvider } from "@/generated/client/enums"

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

    await prisma.user.create({
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
        }
      }
    })

    return { success: true }
  } catch (error) {
    console.error("Signup failed:", error)
    return { error: "Something went wrong. Please try again." }
  }
}
