'use server'

import { getOrganizationContext } from "@/lib/auth-context"
import prisma from "@/lib/prisma"

export async function getExportData() {
  const { organizationId } = await getOrganizationContext()

  const treatments = await prisma.encounter.findMany({
    where: {
      organizationId,
      status: { not: "VOID" }
    },
    include: {
      patient: {
        select: { systemLabel: true, identifiers: true }
      },
      product: {
        select: { name: true }
      },
      followups: {
        select: { followupDate: true, outcome: true }
      }
    },
    orderBy: {
      encounterAt: 'desc'
    }
  })

  return treatments.map(t => ({
    id: t.id,
    treatment_date: t.encounterLocalDate.toISOString(),
    treatment_site: t.treatmentSite,
    indication: t.indication,
    product: t.product?.name || 'N/A',
    total_units: t.totalUnits.toNumber(),
    // Legacy mapping for UI compatibility
    patients: {
      patient_code: t.patient.systemLabel || 'Unknown',
      birth_year: t.patient.identifiers?.birthYear || 0
    },
    followups: t.followups.map(f => ({
        followup_date: f.followupDate.toISOString(),
        outcome: f.outcome
    }))
  }))
}

export interface ResearchExportRecord {
  user_id: string
  patient_code: string
  treatment_id: string
  treatment_date: string
  indication: string
  product: string
  dilution: string
  injection_id: string
  muscle_id: string
  muscle_name: string
  side: string
  units: number
  followup_flag: number
  MAS_baseline_text: string
  MAS_baseline_num: number | string
  MAS_peak_text: string
  MAS_peak_num: number | string
}

export async function getResearchExportData() {
  const { organizationId } = await getOrganizationContext()

  // Fetch all injections with deep relations
  // Note: This can be heavy. In production, consider cursor pagination or specialized query.
  const injections = await prisma.injection.findMany({
    where: {
      organizationId,
      encounter: { status: { not: "VOID" } }
    },
    include: {
      muscle: true,
      encounter: {
        include: {
          patient: { select: { systemLabel: true } },
          product: { select: { name: true } },
          followups: { select: { id: true } }, // Just to check existence
          providerMembership: { select: { userId: true } }
        }
      },
      injectionAssessments: true
    },
    orderBy: {
      encounter: { encounterAt: 'desc' }
    }
  })

  // Transform to flat structure
  const flatData: ResearchExportRecord[] = injections.map((inj) => {
    const treatment = inj.encounter
    const patient = treatment.patient
    const assessments = inj.injectionAssessments || []

    const masBaseline = assessments.find((a) => a.scale === 'MAS' && a.timepoint === 'baseline')
    const masPeak = assessments.find((a) => a.scale === 'MAS' && a.timepoint === 'peak_effect')

    return {
      user_id: treatment.providerMembership.userId,
      patient_code: patient?.systemLabel || 'UNKNOWN',
      treatment_id: treatment.id,
      treatment_date: treatment.encounterLocalDate.toISOString().split('T')[0],
      indication: treatment.indication,
      product: treatment.product?.name || 'N/A',
      dilution: treatment.dilutionText || 'N/A',
      injection_id: inj.id,
      muscle_id: inj.muscleId || '',
      muscle_name: inj.muscle?.name || 'Unknown',
      side: inj.side,
      units: inj.units.toNumber(),
      followup_flag: treatment.followups.length > 0 ? 1 : 0,
      MAS_baseline_text: masBaseline?.valueText || '',
      MAS_baseline_num: masBaseline?.valueNum !== null && masBaseline?.valueNum !== undefined ? masBaseline.valueNum.toNumber() : '',
      MAS_peak_text: masPeak?.valueText || '',
      MAS_peak_num: masPeak?.valueNum !== null && masPeak?.valueNum !== undefined ? masPeak.valueNum.toNumber() : '',
    }
  })

  return flatData
}