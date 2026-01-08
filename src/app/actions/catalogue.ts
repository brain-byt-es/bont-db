"use server"

import prisma from "@/lib/prisma"

export async function searchDiagnosesAction(query: string) {
  if (!query || query.length < 2) return []

  const searchTerms = query.toLowerCase().split(' ').filter(t => t.length > 0)

  const results = await prisma.diagnosis.findMany({
    where: {
      AND: searchTerms.map(term => ({
        OR: [
          { label: { contains: term, mode: 'insensitive' } },
          { code: { contains: term, mode: 'insensitive' } }
        ]
      }))
    },
    take: 30,
    orderBy: { code: 'asc' }
  })

  return results
}
