import { PrismaClient } from '../src/generated/client/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const connectionString = process.env.DATABASE_URL

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Grouped by original region_id
const regions = {
  "87b02b90-8234-430e-83e1-6231e57aaa45": {
    name: "Head & Neck",
    muscles: [
      { name: "M. temporalis", synonyms: ["Schläfenmuskel"], sort_order: 150 },
      { name: "M. splenius capitis", synonyms: ["Riemenmuskel des Kopfes"], sort_order: 190 },
      { name: "M. mentalis", synonyms: ["Kinnmuskel"], sort_order: 130 },
      { name: "M. splenius cervicis", synonyms: ["Riemenmuskel des Halses"], sort_order: 200 },
      { name: "M. sternohyoideus", synonyms: ["Brustbeinzungenbeinmuskel"], sort_order: 380 },
      { name: "M. rectus capitis posterior major", synonyms: ["Großer hinterer gerader Kopfmuskel"], sort_order: 330 },
      { name: "M. orbicularis oris", synonyms: ["Mundringmuskel"], sort_order: 90 },
      { name: "M. risorius", synonyms: ["Lachmuskel"], sort_order: 100 },
      { name: "M. masseter", synonyms: ["Kaumuskel"], sort_order: 140 },
      { name: "M. longus capitis", synonyms: ["Langer Kopfmuskel"], sort_order: 320 },
      { name: "M. obliquus capitis inferior", synonyms: ["Unterer schiefer Kopfmuskel"], sort_order: 350 },
      { name: "M. thyrohyoideus", synonyms: ["Schildknorpelzungenbeinmuskel"], sort_order: 390 },
      { name: "M. zygomaticus major", synonyms: ["Großer Jochbeinmuskel"], sort_order: 70 },
      { name: "M. corrugator supercilii", synonyms: ["Augenbrauenrunzler"], sort_order: 20 },
      { name: "M. omohyoideus", synonyms: ["Schulterblattzungenbeinmuskel"], sort_order: 370 },
      { name: "M. depressor labii inferioris", synonyms: ["Unterlippenherabzieher"], sort_order: 120 },
      { name: "M. orbicularis oculi", synonyms: ["Augenringmuskel"], sort_order: 40 },
      { name: "M. sternocleidomastoideus", synonyms: ["Kopfnicker", "SCM"], sort_order: 180 },
      { name: "M. longus colli", synonyms: ["Langer Halsmuskel"], sort_order: 310 },
      { name: "M. scalenus medius", synonyms: ["Mittlerer Treppenmuskel"], sort_order: 250 },
      { name: "M. digastricus", synonyms: ["Zweibäuchiger Muskel"], sort_order: 280 },
      { name: "M. scalenus anterior", synonyms: ["Vorderer Treppenmuskel"], sort_order: 240 },
      { name: "M. procerus", synonyms: ["Schlanker Muskel"], sort_order: 30 },
      { name: "M. obliquus capitis superior", synonyms: ["Oberer schiefer Kopfmuskel"], sort_order: 360 },
      { name: "M. pterygoideus lateralis", synonyms: ["Äußerer Flügelmuskel"], sort_order: 170 },
      { name: "M. geniohyoideus", synonyms: ["Kinnzungenbeinmuskel"], sort_order: 300 },
      { name: "M. cricothyroideus", synonyms: ["Ringknorpelschildknorpelmuskel"], sort_order: 400 },
      { name: "M. semispinalis capitis", synonyms: ["Halbdoornmuskel des Kopfes"], sort_order: 230 },
      { name: "M. levator scapulae", synonyms: ["Schulterblattheber"], sort_order: 220 },
      { name: "M. frontalis", synonyms: ["Stirnmuskel"], sort_order: 10 },
      { name: "M. trapezius", synonyms: ["Kapuzenmuskel"], sort_order: 210 },
    ]
  },
  "f38c9aa9-1fc9-4b15-8eec-5627a53374ab": {
    name: "Upper Limb",
    muscles: [
      { name: "M. flexor digiti minimi brevis", synonyms: ["Kurzer Kleinfingerbeuger"], sort_order: 280 },
      { name: "Mm. interossei dorsales", synonyms: ["Rückenseitige Zwischenknochenmuskeln"], sort_order: 310 },
      { name: "M. extensor indicis", synonyms: ["Zeigefingerstrecker"], sort_order: 190 },
      { name: "M. coracobrachialis", synonyms: ["Hakenarmmuskel"], sort_order: 330 },
      { name: "M. deltoideus", synonyms: ["Deltamuskel"], sort_order: 10 },
      { name: "M. extensor carpi radialis longus", synonyms: ["Langer speichenseitiger Handstrecker"], sort_order: 150 },
      { name: "M. extensor digitorum", synonyms: ["Fingerstrecker"], sort_order: 180 },
      { name: "M. flexor carpi ulnaris", synonyms: ["Ellenseitiger Handbeuger"], sort_order: 100 },
      { name: "M. pronator teres", synonyms: ["Runder Einwärtsdreher"], sort_order: 60 },
      { name: "M. supinator", synonyms: ["Auswärtsdreher"], sort_order: 80 },
      { name: "M. brachioradialis", synonyms: ["Oberarmspeichenmuskel"], sort_order: 50 },
      { name: "M. anconeus", synonyms: ["Ellenbogenhöckermuskel"], sort_order: 340 },
      { name: "M. flexor pollicis brevis", synonyms: ["Kurzer Daumenbeuger"], sort_order: 240 },
      { name: "M. palmaris longus", synonyms: ["Langer Hohlhandmuskel"], sort_order: 110 },
      { name: "M. brachialis", synonyms: ["Armbeuger"], sort_order: 30 },
      { name: "Mm. lumbricales", synonyms: ["Spulmuskeln"], sort_order: 300 },
      { name: "M. extensor carpi radialis brevis", synonyms: ["Kurzer speichenseitiger Handstrecker"], sort_order: 160 },
      { name: "M. flexor digitorum profundus", synonyms: ["Tiefer Fingerbeuger"], sort_order: 130 },
      { name: "M. abductor pollicis longus", synonyms: ["Langer Daumenabspreizer"], sort_order: 220 },
      { name: "M. flexor pollicis longus", synonyms: ["Langer Daumenbeuger"], sort_order: 140 },
      { name: "M. abductor digiti minimi", synonyms: ["Kleinfingerabspreizer"], sort_order: 270 },
      { name: "M. abductor pollicis brevis", synonyms: ["Kurzer Daumenabspreizer"], sort_order: 230 },
      { name: "M. pronator quadratus", synonyms: ["Quadratischer Einwärtsdreher"], sort_order: 70 },
    ]
  },
  "8c92c079-ef3c-4f96-a2cb-efc4d6c4be79": {
    name: "Lower Limb",
    muscles: [
      { name: "M. adductor brevis", synonyms: ["Kurzer Anzieher"], sort_order: 150 },
      { name: "M. popliteus", synonyms: ["Kniekehlenmuskel"], sort_order: 240 },
      { name: "M. gastrocnemius", synonyms: ["Zwillingswadenmuskel"], sort_order: 210 },
      { name: "M. iliopsoas", synonyms: ["Darmbeinlendenmuskel"], sort_order: 10 },
      { name: "Mm. lumbricales", synonyms: ["Spulmuskeln"], sort_order: 370 }, // Note: Duplicate name exists in original data (hand/foot), keeping as is
      { name: "M. abductor hallucis", synonyms: ["Großzehenabspreizer"], sort_order: 340 },
      { name: "M. adductor longus", synonyms: ["Langer Anzieher"], sort_order: 140 },
      { name: "M. tibialis anterior", synonyms: ["Vorderer Schienbeinmuskel"], sort_order: 250 },
      { name: "M. quadratus plantae", synonyms: ["Sohlenviereckmuskel"], sort_order: 360 },
      { name: "M. sartorius", synonyms: ["Schneidermuskel"], sort_order: 120 },
      { name: "M. peroneus longus", synonyms: ["Langer Wadenbeinmuskel"], sort_order: 270 },
      { name: "M. gluteus maximus", synonyms: ["Großer Gesäßmuskel"], sort_order: 20 },
      { name: "M. tensor fasciae latae", synonyms: ["Schenkelbindenspanner"], sort_order: 50 },
      { name: "M. vastus medialis", synonyms: ["Innerer Oberschenkelmuskel"], sort_order: 100 },
      { name: "M. pectineus", synonyms: ["Kammuskel"], sort_order: 170 },
      { name: "M. flexor digitorum longus", synonyms: ["Langer Zehenbeuger"], sort_order: 310 },
      { name: "M. plantaris", synonyms: ["Sohlenmuskel"], sort_order: 230 },
      { name: "M. adductor magnus", synonyms: ["Großer Anzieher"], sort_order: 130 },
      { name: "M. peroneus brevis", synonyms: ["Kurzer Wadenbeinmuskel"], sort_order: 280 },
      { name: "M. rectus femoris", synonyms: ["Gerader Oberschenkelmuskel"], sort_order: 80 },
      { name: "M. flexor hallucis longus", synonyms: ["Langer Großzehenbeuger"], sort_order: 320 },
      { name: "M. vastus lateralis", synonyms: ["Äußerer Oberschenkelmuskel"], sort_order: 90 },
      { name: "M. flexor digitorum brevis", synonyms: ["Kurzer Zehenbeuger"], sort_order: 330 },
      { name: "M. piriformis", synonyms: ["Birnförmiger Muskel"], sort_order: 60 },
    ]
  },
  "6fe2d7f7-3e00-49fc-a75b-468075fd86ec": {
    name: "Trunk",
    muscles: [
      { name: "M. sphincter ani externus", synonyms: ["Äußerer Afterschließmuskel"], sort_order: 260 },
      { name: "M. supraspinatus", synonyms: ["Obergrätenmuskel"], sort_order: 170 },
      { name: "M. serratus anterior", synonyms: ["Vorderer Sägemuskel"], sort_order: 160 },
      { name: "M. bulbospongiosus", synonyms: ["Vorhofschwellkörpermuskel"], sort_order: 280 },
      { name: "M. subscapularis", synonyms: ["Unterschulterblattmuskel"], sort_order: 190 },
      { name: "M. pectoralis major", synonyms: ["Großer Brustmuskel"], sort_order: 10 },
      { name: "M. infraspinatus", synonyms: ["Untergrätenmuskel"], sort_order: 180 },
      { name: "M. rhomboideus minor", synonyms: ["Kleiner Rautenmuskel"], sort_order: 150 },
      { name: "M. longissimus", synonyms: ["Langer Muskel"], sort_order: 100 },
      { name: "M. obliquus externus abdominis", synonyms: ["Äußerer schräger Bauchmuskel"], sort_order: 50 },
      { name: "M. erector spinae", synonyms: ["Rückenstrecker"], sort_order: 80 },
      { name: "M. quadratus lumborum", synonyms: ["Quadratischer Lendenmuskel"], sort_order: 130 },
      { name: "M. intercostalis externus", synonyms: ["Äußerer Zwischenrippenmuskel"], sort_order: 220 },
      { name: "M. transversus abdominis", synonyms: ["Querer Bauchmuskel"], sort_order: 70 },
      { name: "M. ischiocavernosus", synonyms: ["Sitzbeinschwellkörpermuskel"], sort_order: 270 },
      { name: "M. rhomboideus major", synonyms: ["Großer Rautenmuskel"], sort_order: 140 },
      { name: "M. psoas major", synonyms: ["Großer Lendenmuskel"], sort_order: 290 },
      { name: "M. psoas minor", synonyms: ["Kleiner Lendenmuskel"], sort_order: 300 },
      { name: "M. spinalis", synonyms: ["Dornfortsatzmuskel"], sort_order: 110 },
      { name: "M. obliquus internus abdominis", synonyms: ["Innerer schräger Bauchmuskel"], sort_order: 60 },
      { name: "M. iliocostalis", synonyms: ["Darmbeinrippenmuskel"], sort_order: 90 },
      { name: "M. pectoralis minor", synonyms: ["Kleiner Brustmuskel"], sort_order: 20 },
    ]
  }
}

async function main() {
  console.log('🌱 Starting seed with original data...')

  // Upsert Regions & Muscles
  for (const [id, regionData] of Object.entries(regions)) {
    console.log(`Processing Region: ${regionData.name}`)
    
    // We create the region. We let DB generate ID to avoid conflict, or could try to preserve?
    // Since this is a new DB, better to have clean IDs.
    const region = await prisma.muscleRegion.upsert({
      where: { name: regionData.name },
      update: {},
      create: { 
        name: regionData.name,
        sortOrder: 0
      }
    })

    for (const m of regionData.muscles) {
      await prisma.muscle.upsert({
        where: { name: m.name },
        update: {
          regionId: region.id,
          synonyms: m.synonyms,
          sortOrder: m.sort_order
        },
        create: {
          name: m.name,
          synonyms: m.synonyms,
          sortOrder: m.sort_order,
          regionId: region.id
        }
      })
    }
  }

  console.log('✅ Seeding completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
