"use server"

import { getUserContext } from "@/lib/auth-context"
import prisma from "@/lib/prisma"

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
