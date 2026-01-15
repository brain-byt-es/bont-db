import prisma from "./prisma"
import { BodySide } from "@/generated/client/enums"

/**
 * InjexPro Dose Reference Assistant
 * Provides historical context and standardized clinical protocol references.
 * This module is strictly non-prescriptive.
 */

export interface DoseReference {
  units: number
  side: "Left" | "Right" | "Bilateral" | "Midline"
  source: "history" | "protocol"
  label: string
}

export interface ClinicalProtocol {
  id: string
  name: string
  indication: string
  steps: Array<{
    muscleName: string
    units: number
    side: string
  }>
}

/**
 * Standard Clinical Protocols (Reference-only)
 */
export const CLINICAL_PROTOCOLS: ClinicalProtocol[] = [
  {
    id: "preempt-migraine",
    name: "PREEMPT Protocol",
    indication: "kopfschmerz",
    steps: [
      { muscleName: "M. frontalis", units: 20, side: "Bilateral" },
      { muscleName: "M. corrugator supercilii", units: 10, side: "Bilateral" },
      { muscleName: "M. procerus", units: 5, side: "Midline" },
      { muscleName: "M. occipitalis", units: 30, side: "Bilateral" },
      { muscleName: "M. temporalis", units: 40, side: "Bilateral" },
      { muscleName: "M. trapezius", units: 30, side: "Bilateral" },
      { muscleName: "M. paraspinalis (cervical)", units: 20, side: "Bilateral" },
    ]
  },
  {
    id: "upper-limb-spasticity-basic",
    name: "Standard Upper Limb",
    indication: "spastik",
    steps: [
      { muscleName: "M. biceps brachii", units: 50, side: "Left" },
      { muscleName: "M. brachialis", units: 50, side: "Left" },
      { muscleName: "M. brachioradialis", units: 25, side: "Left" },
    ]
  }
]

/**
 * Dose Reference Assistant: Get historical context for a specific patient and muscle.
 */
export async function getDoseReferences(
  organizationId: string,
  patientId: string,
  muscleId: string
): Promise<DoseReference[]> {
  // 1. Fetch most recent encounter for this muscle
  const lastInjection = await prisma.injection.findFirst({
    where: {
      organizationId,
      muscleId,
      encounter: {
        patientId,
        status: 'SIGNED'
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      encounter: true
    }
  })

  if (!lastInjection) {
    return []
  }

  // 2. Return historical dose as a reference point
  return [{
    units: lastInjection.units.toNumber(),
    side: mapSide(lastInjection.side),
    source: "history",
    label: "Previous effective dose (historical)"
  }]
}

function mapSide(side: string | BodySide): DoseReference["side"] {
  if (side === 'L' || side === 'Left') return 'Left'
  if (side === 'R' || side === 'Right') return 'Right'
  if (side === 'B' || side === 'Bilateral') return 'Bilateral'
  return 'Midline'
}

export interface Protocol {
    id: string
    name: string
    indication: string
    isCustom?: boolean
    steps: Array<{
        muscleId?: string
        muscleName?: string
        units: number
        side: string
    }>
}