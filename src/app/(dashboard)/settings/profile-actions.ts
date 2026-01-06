"use server"

import { getUserContext } from "@/lib/auth-context"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getProfileData() {
  const { userId } = await getUserContext()

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      identities: {
        select: {
          provider: true,
          emailAtAuth: true,
          createdAt: true
        }
      }
    }
  })

  if (!user) throw new Error("User not found")

  return {
    id: user.id,
    name: user.displayName,
    email: user.email,
    image: user.profilePhotoUrl,
    identities: user.identities.map(i => ({
      provider: i.provider,
      email: i.emailAtAuth,
      linkedAt: i.createdAt
    }))
  }
}

export async function updateProfile(formData: FormData) {
  const { userId } = await getUserContext()
  const name = formData.get('name') as string
  const email = (formData.get('email') as string)?.toLowerCase().trim()
  
  if (!name) {
    return { error: "Name is required" }
  }

  if (!email || !email.includes('@')) {
    return { error: "A valid email address is required" }
  }

  // Check for email collision
  const existingUser = await prisma.user.findFirst({
    where: { 
        email,
        id: { not: userId }
    }
  })

  if (existingUser) {
    return { error: "This email address is already in use by another account." }
  }

  try {
    await prisma.user.update({
        where: { id: userId },
        data: { 
            displayName: name,
            email: email
        }
    })
  } catch (error) {
    console.error("Profile update failed:", error)
    return { error: "Failed to update profile. Please try again." }
  }

  revalidatePath('/')
  return { success: true }
}
