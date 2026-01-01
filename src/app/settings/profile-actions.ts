'use server'

import { revalidatePath } from 'next/cache'
import { getUserContext } from '@/lib/auth-context'
import prisma from '@/lib/prisma'

export async function updateProfile(formData: FormData) {
  const { userId } = await getUserContext()
  const name = formData.get('name') as string
  
  if (!name) {
    throw new Error("Name is required")
  }

  await prisma.user.update({
    where: { id: userId },
    data: { displayName: name }
  })

  revalidatePath('/')
}
