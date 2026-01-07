"use server"

import prisma from "@/lib/prisma"

export async function searchDiagnosesAction(query: string) {
  if (!query || query.length < 2) return []

  const results = await prisma.diagnosis.findMany({
    where: {
      OR: [
        { label: { contains: query, mode: 'insensitive' } },
        { code: { contains: query, mode: 'insensitive' } }
      ]
    },
    take: 20,
    orderBy: { code: 'asc' }
  })

  return results
}
