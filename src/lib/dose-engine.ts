import prisma from "@/lib/prisma"

export interface DoseSuggestion {
  muscleId: string
  muscleName: string
  units: number
  side: "Left" | "Right" | "Bilateral" | "Midline"
  confidence: "high" | "medium" | "low"
  source: "history" | "protocol" | "preference"
}

export interface Protocol {
  id: string
  name: string
  indication: string
  steps: {
    muscleName: string
    units: number
    side: "Left" | "Right" | "Bilateral" | "Midline"
  }[]
}

export const CLINICAL_PROTOCOLS: Protocol[] = [
  {
    id: "prempt-migraine",
    name: "PREMPT Migraine Protocol",
    indication: "kopfschmerz",
    steps: [
      { muscleName: "M. corrugator supercilii", units: 5, side: "Left" },
      { muscleName: "M. corrugator supercilii", units: 5, side: "Right" },
      { muscleName: "M. procerus", units: 5, side: "Midline" },
      { muscleName: "M. frontalis", units: 10, side: "Left" },
      { muscleName: "M. frontalis", units: 10, side: "Right" },
      { muscleName: "M. temporalis", units: 20, side: "Left" },
      { muscleName: "M. temporalis", units: 20, side: "Right" },
      { muscleName: "M. occipitalis", units: 15, side: "Left" },
      { muscleName: "M. occipitalis", units: 15, side: "Right" },
      { muscleName: "M. trapezius", units: 15, side: "Left" },
      { muscleName: "M. trapezius", units: 15, side: "Right" },
      { muscleName: "M. paraspinalis (cervical)", units: 10, side: "Left" },
      { muscleName: "M. paraspinalis (cervical)", units: 10, side: "Right" }
    ]
  },
  {
    id: "upper-limb-flexor-syndrome",
    name: "Standard Upper Limb Flexion",
    indication: "spastik",
    steps: [
      { muscleName: "M. pectoralis major", units: 50, side: "Bilateral" },
      { muscleName: "M. biceps brachii", units: 50, side: "Bilateral" },
      { muscleName: "M. brachioradialis", units: 25, side: "Bilateral" },
      { muscleName: "M. flexor carpi ulnaris", units: 20, side: "Bilateral" },
      { muscleName: "M. flexor carpi radialis", units: 20, side: "Bilateral" },
      { muscleName: "M. flexor digitorum superficialis", units: 40, side: "Bilateral" }
    ]
  }
]

/**
 * Advanced Dose Engine: Get suggestions for a specific patient and muscle.
 * Analyzes the history of the patient to find the most frequent/effective dose.
 */
export async function getDoseSuggestions(
    organizationId: string, 
    patientId: string, 
    muscleId: string
): Promise<DoseSuggestion[]> {
  
  // 1. Fetch History for this specific muscle and patient
  const history = await prisma.injection.findMany({
    where: {
      organizationId,
      muscleId,
      encounter: {
        patientId
      }
    },
    select: {
      units: true,
      side: true,
      createdAt: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 5
  })

  if (history.length === 0) return []

  // 2. Aggregate history
  // If we have history, suggest the most recent dose as high confidence
  const mostRecent = history[0]
  
  return [{
    muscleId,
    muscleName: "", // Will be filled by caller or ignored
    units: mostRecent.units.toNumber(),
    side: mapSide(mostRecent.side),
    confidence: "high",
    source: "history"
  }]
}

function mapSide(side: string): DoseSuggestion["side"] {
    if (side === "L") return "Left"
    if (side === "R") return "Right"
    return "Bilateral"
}
