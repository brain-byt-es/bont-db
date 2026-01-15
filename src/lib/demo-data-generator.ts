import { 
    MembershipRole, 
    BodySide, 
    EncounterStatus, 
    GoalCategory
} from "@/generated/client/enums"
import { addDays, subDays, isWeekend, setHours, setMinutes } from "date-fns"

/**
 * Programmatic Mock Data Generator for InjexPro Demo Mode.
 * Generates ~12 months of high-fidelity, analytics-ready clinical data.
 */

const INDICATIONS = [
    { label: "spastik", site: "Upper Limb", muscleGroup: "Upper" },
    { label: "spastik", site: "Lower Limb", muscleGroup: "Lower" },
    { label: "kopfschmerz", site: "PREEMPT Migraine", muscleGroup: "Head" },
    { label: "dystonie", site: "Cervical Dystonia", muscleGroup: "Neck" },
    { label: "autonom", site: "Salivary Glands", muscleGroup: "Glands" },
    { label: "autonom", site: "Axilla", muscleGroup: "Axilla" }
]

const MUSCLE_POOL = {
    Upper: ["M. biceps brachii", "M. brachialis", "M. brachioradialis", "M. flexor carpi radialis", "M. flexor carpi ulnaris", "M. flexor digitorum profundus"],
    Lower: ["M. gastrocnemius", "M. soleus", "M. tibialis posterior", "M. rectus femoris"],
    Head: ["M. frontalis", "M. corrugator supercilii", "M. procerus", "M. occipitalis", "M. temporalis", "M. trapezius"],
    Neck: ["M. sternocleidomastoideus", "M. splenius capitis", "M. levator scapulae", "M. scalenus anterior"],
    Glands: ["Glandula parotis", "Glandula submandibularis"],
    Axilla: ["Axilla (Hyperhidrosis)"]
}

const GOAL_TEMPLATES: Record<string, Record<GoalCategory, string[]>> = {
    spastik: {
        SYMPTOM: ["Reduce pain in affected limb", "Decrease muscle stiffness (MAS)", "Reduce frequency of spasms", "Improve sleep comfort"],
        FUNCTION: ["Improve walking distance", "Facilitate hand hygiene", "Improve grip release", "Ease dressing/undressing"],
        PARTICIPATION: ["Return to work", "Walk to the bakery independently", "Attend social gatherings", "Play musical instrument"]
    },
    kopfschmerz: {
        SYMPTOM: ["Reduce headache days per month", "Decrease headache intensity (VAS)", "Reduce acute medication intake", "Reduce photophobia"],
        FUNCTION: ["Improve concentration at work", "Reduce absenteeism", "Improve sleep quality", "Ability to read for >30 mins"],
        PARTICIPATION: ["Participate in family weekends", "Return to full-time work", "Enjoy hobbies without pain", "Attend concert/cinema"]
    },
    dystonie: {
        SYMPTOM: ["Reduce neck pain intensity", "Decrease involuntary head turning", "Relieve neck tremor", "Reduce shoulder tension"],
        FUNCTION: ["Improve head posture while driving", "Facilitate eating/drinking", "Improve reading comfort", "Ease shaving/makeup application"],
        PARTICIPATION: ["Socialize without embarrassment", "Attend business meetings comfortably", "Go to the cinema", "Drive for >1 hour"]
    },
    autonom: {
        SYMPTOM: ["Reduce axillary sweating", "Decrease saliva production", "Reduce skin maceration", "Reduce odor"],
        FUNCTION: ["Improve grip stability (less sweat)", "Reduce swallowing difficulties", "Reduce need for clothing changes", "Improve skin condition"],
        PARTICIPATION: ["Shake hands confidently", "Wear colored clothing", "Speak in public without issues", "Attend gym classes"]
    }
}

interface PatientData {
    id: string
    systemLabel: string
    birthYear: number
    notes: string | null
    status: string
    primaryIndication: typeof INDICATIONS[number]
}

interface InjectionData {
    id: string
    muscleId: string
    muscleName: string
    units: number
    side: BodySide
    masBaseline?: number
    masPeak?: number
}

interface EncounterData {
    id: string
    patientId: string
    providerName: string
    date: Date
    indication: string
    treatmentSite: string
    status: EncounterStatus
    product: string
    vialSize: number
    dilution: number
    totalUnits: number
    injections: InjectionData[]
    goals: {
        id: string
        category: GoalCategory
        description: string
    }[]
    goalOutcomes: {
        goalId: string
        score: number
        notes: string | null
    }[]
    followup?: {
        date: Date
        outcome: string
    }
}

export function generateDemoData(muscles: { id: string, name: string }[]) {
    const now = new Date()
    const startDate = subDays(now, 365)
    const patients: PatientData[] = []
    const encounters: EncounterData[] = []

    if (muscles.length === 0) throw new Error("No muscles found in database to generate demo data.")
    
    // 1. Generate 60 Patients
    for (let i = 1; i <= 60; i++) {
        const primaryIndication = INDICATIONS[Math.floor(Math.random() * INDICATIONS.length)]
        patients.push({
            id: crypto.randomUUID(),
            systemLabel: `PAT-${1000 + i}`,
            birthYear: 1955 + Math.floor(Math.random() * 35),
            notes: i % 15 === 0 ? "Complex case history with multiple comorbidities." : null,
            status: "ACTIVE",
            primaryIndication
        })
    }

    // 2. Define Providers
    const providers = [
        { name: "Dr. Sarah Miller", role: MembershipRole.OWNER, activity: 1.0 },
        { name: "Dr. James Chen", role: MembershipRole.PROVIDER, activity: 0.6 }
    ]

    // 3. Generate Patient Timelines (Realistic intervals: 2.5 - 4 months)
    patients.forEach(patient => {
        // Start each patient at a random point in the first 120 days of the start date
        let currentEncounterDate = addDays(startDate, Math.floor(Math.random() * 90))
        let prevEncounter: EncounterData | null = null

        while (currentEncounterDate < now) {
            // Avoid weekends for treatment
            if (isWeekend(currentEncounterDate)) {
                currentEncounterDate = addDays(currentEncounterDate, (7 - currentEncounterDate.getDay()) % 7 + 1)
            }

            if (currentEncounterDate >= now) break

            const provider = providers[Math.floor(Math.random() * providers.length)]
            const indication = patient.primaryIndication
            const status = Math.random() > 0.95 ? EncounterStatus.DRAFT : EncounterStatus.SIGNED
            const encounterDate = setMinutes(setHours(currentEncounterDate, 9 + Math.floor(Math.random() * 8)), Math.floor(Math.random() * 60))
            
            const encounterId = crypto.randomUUID()
            
            const encounter: EncounterData = {
                id: encounterId,
                patientId: patient.id,
                providerName: provider.name,
                date: encounterDate,
                indication: indication.label,
                treatmentSite: indication.site,
                status: status,
                product: Math.random() > 0.5 ? "Botox" : "Xeomin",
                vialSize: 100,
                dilution: 2.5,
                totalUnits: 0,
                injections: [],
                goals: [],
                goalOutcomes: []
            }

            // Generate Injections
            const muscleGroup = MUSCLE_POOL[indication.muscleGroup as keyof typeof MUSCLE_POOL]
            const numSites = Math.min(muscleGroup.length, 2 + Math.floor(Math.random() * 4))
            let units = 0
            for (let s = 0; s < numSites; s++) {
                const mName = muscleGroup[s % muscleGroup.length]
                const mId = muscles.find(m => m.name === mName)?.id || muscles[0].id

                const dose = 10 + Math.floor(Math.random() * 40)
                units += dose

                let masBaseline: number | undefined = undefined
                let masPeak: number | undefined = undefined
                
                if (indication.label === 'spastik') {
                    masBaseline = 1 + Math.floor(Math.random() * 3)
                    masPeak = Math.max(0, masBaseline - (Math.random() > 0.3 ? 1 : 0)) 
                }

                let side: BodySide = BodySide.R
                if (indication.muscleGroup === 'Head' || indication.muscleGroup === 'Neck') {
                    side = Math.random() > 0.5 ? BodySide.B : BodySide.L
                } else {
                    side = Math.random() > 0.5 ? BodySide.L : BodySide.R
                }

                encounter.injections.push({
                    id: crypto.randomUUID(),
                    muscleId: mId,
                    muscleName: mName,
                    units: dose,
                    side: side,
                    masBaseline,
                    masPeak
                })
            }
            encounter.totalUnits = units

            // GAS Goals (Inherit or Create)
            if (!prevEncounter) {
                const categories = [GoalCategory.SYMPTOM, GoalCategory.FUNCTION, GoalCategory.PARTICIPATION]
                const numGoals = 1 + (Math.random() > 0.7 ? 1 : 0)
                
                // Fetch context-aware templates based on indication
                const templatesByIndication = GOAL_TEMPLATES[indication.label] || GOAL_TEMPLATES['spastik'] // fallback

                for (let g = 0; g < numGoals; g++) {
                    const cat = categories[Math.floor(Math.random() * categories.length)]
                    const templates = templatesByIndication[cat]
                    
                    encounter.goals.push({
                        id: crypto.randomUUID(),
                        category: cat,
                        description: templates[Math.floor(Math.random() * templates.length)]
                    })
                }
            } else {
                encounter.goals = [...prevEncounter.goals]
                // Evaluate outcomes for previous goals
                encounter.goals.forEach((goal) => {
                    const rand = Math.random()
                    let score = 0
                    if (rand > 0.9) score = 1
                    else if (rand > 0.4) score = 0
                    else score = -1
                    
                    encounter.goalOutcomes.push({
                        goalId: goal.id,
                        score: score,
                        notes: score < 0 ? "Therapeutic plateau." : null
                    })
                })
            }

            if (status === EncounterStatus.SIGNED && Math.random() > 0.2) {
                encounter.followup = {
                    date: addDays(encounterDate, 84 + Math.floor(Math.random() * 14)),
                    outcome: "Standard clinical response."
                }
            }

            encounters.push(encounter)
            prevEncounter = encounter

            // Increment by 80 - 120 days (approx 2.5 - 4 months)
            currentEncounterDate = addDays(currentEncounterDate, 80 + Math.floor(Math.random() * 40))
        }
    })

    // Sort all encounters chronologically for the final dump
    encounters.sort((a, b) => a.date.getTime() - b.date.getTime())

    return { patients, encounters }
}