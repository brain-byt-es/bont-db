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

const GOAL_TEMPLATES = {
    SYMPTOM: ["Reduce pain during rest", "Decrease spasm frequency", "Improve sleep quality", "Reduce tension headache intensity"],
    FUNCTION: ["Improve walking distance", "Better grip strength for eating", "Enable self-dressing", "Improve neck range of motion"],
    PARTICIPATION: ["Return to part-time work", "Attend social events without discomfort", "Improve piano playing dexterity", "Walk to the bakery independently"]
}

interface PatientData {
    id: string
    systemLabel: string
    birthYear: number
    notes: string | null
    status: string
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
    const startDate = subDays(now, 365) // Reduced from 450
    const patients: PatientData[] = []
    const encounters: EncounterData[] = []

    if (muscles.length === 0) throw new Error("No muscles found in database to generate demo data.")
    
    // 1. Generate 60 Patients (Reduced from 120)
    for (let i = 1; i <= 60; i++) {
        patients.push({
            id: crypto.randomUUID(),
            systemLabel: `PAT-${1000 + i}`,
            birthYear: 1955 + Math.floor(Math.random() * 35),
            notes: i % 15 === 0 ? "Complex case history with multiple comorbidities." : null,
            status: "ACTIVE"
        })
    }

    // 2. Define Providers (Membership Role simulation)
    const providers = [
        { name: "Dr. Sarah Miller", role: MembershipRole.OWNER, activity: 1.0 },
        { name: "Dr. James Chen", role: MembershipRole.PROVIDER, activity: 0.6 } // Slightly lower
    ]

    // 3. Time Series Generation
    let currentDay = startDate
    while (currentDay < now) {
        // Skip weekends more aggressively
        if (isWeekend(currentDay)) {
            if (Math.random() > 0.05) { 
                currentDay = addDays(currentDay, 1)
                continue
            }
        }

        // Calculate volume based on ramp-up
        const daysSinceStart = Math.floor((currentDay.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        const rampUpFactor = Math.min(1, daysSinceStart / 45) // Faster ramp-up
        const baseVolume = 2 + Math.floor(Math.random() * 3) // Lowered from 3-8
        const dailyVolume = Math.floor(baseVolume * rampUpFactor)

        for (let v = 0; v < dailyVolume; v++) {
            const provider = providers[Math.floor(Math.random() * providers.length)]
            if (Math.random() > provider.activity) continue

            const patient = patients[Math.floor(Math.random() * patients.length)]
            const indication = INDICATIONS[Math.floor(Math.random() * INDICATIONS.length)]
            
            // Generate Encounter
            const status = Math.random() > 0.95 ? EncounterStatus.DRAFT : EncounterStatus.SIGNED
            const encounterDate = setMinutes(setHours(currentDay, 9 + Math.floor(Math.random() * 8)), Math.floor(Math.random() * 60))
            
            const encounterId = crypto.randomUUID()
            
            // Find patient's last treatment for GAS outcomes
            const prevEncounter = encounters.filter(e => e.patientId === patient.id).sort((a, b) => b.date.getTime() - a.date.getTime())[0]
            
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
                totalUnits: 0, // calculated below
                injections: [],
                goals: [],
                goalOutcomes: []
            }

            // Generate Follow-up for signed records (85% completion rate)
            if (status === EncounterStatus.SIGNED && Math.random() > 0.15) {
                encounter.followup = {
                    date: addDays(encounterDate, 84 + Math.floor(Math.random() * 21)), // 12-15 weeks later
                    outcome: "Positive response, goal attainment targets achieved."
                }
            }

            // Generate Injections
            const muscleGroup = MUSCLE_POOL[indication.muscleGroup as keyof typeof MUSCLE_POOL]
            const numSites = Math.min(muscleGroup.length, 2 + Math.floor(Math.random() * 4))
            let units = 0
            for (let s = 0; s < numSites; s++) {
                const mName = muscleGroup[s % muscleGroup.length]
                let mId = muscles.find(m => m.name === mName)?.id
                
                // Fallback: If exact name not found, pick a random muscle from the DB
                if (!mId) {
                    mId = muscles[Math.floor(Math.random() * muscles.length)].id
                }

                const dose = 10 + Math.floor(Math.random() * 40)
                units += dose

                // Generate MAS scores for Spasticity
                let masBaseline: number | undefined = undefined
                let masPeak: number | undefined = undefined
                if (indication.label === 'spastik') {
                    masBaseline = 2 + Math.floor(Math.random() * 2) // 2 or 3
                    masPeak = masBaseline - (Math.random() > 0.2 ? 1 : 0) // Improvement or same
                }

                encounter.injections.push({
                    id: crypto.randomUUID(),
                    muscleId: mId,
                    muscleName: mName,
                    units: dose,
                    side: Math.random() > 0.3 ? BodySide.B : (Math.random() > 0.5 ? BodySide.L : BodySide.R),
                    masBaseline,
                    masPeak
                })
            }
            encounter.totalUnits = units

            // Generate GAS Goals (1-2)
            const categories = [GoalCategory.SYMPTOM, GoalCategory.FUNCTION, GoalCategory.PARTICIPATION]
            const numGoals = 1 + (Math.random() > 0.7 ? 1 : 0)
            for (let g = 0; g < numGoals; g++) {
                const cat = categories[Math.floor(Math.random() * categories.length)]
                const templates = GOAL_TEMPLATES[cat]
                encounter.goals.push({
                    id: crypto.randomUUID(),
                    category: cat,
                    description: templates[Math.floor(Math.random() * templates.length)]
                })
            }

            // Generate GAS Outcomes (If patient had goals last time)
            if (prevEncounter && prevEncounter.goals.length > 0) {
                prevEncounter.goals.forEach((goal) => {
                    // Clinical story: most improve (+1, 0), some stay same (-1), rare worse (-2)
                    const rand = Math.random()
                    let score = 0
                    if (rand > 0.95) score = 2 // Amazing
                    else if (rand > 0.7) score = 1 // Better
                    else if (rand > 0.3) score = 0 // Target met
                    else if (rand > 0.1) score = -1 // Partial
                    else score = -2 // Worse
                    
                    encounter.goalOutcomes.push({
                        goalId: goal.id,
                        score: score,
                        notes: score < 0 ? "Plateau observed, consider dose adjustment." : null
                    })
                })
            }

            encounters.push(encounter)
        }

        currentDay = addDays(currentDay, 1)
    }

    return { patients, encounters }
}