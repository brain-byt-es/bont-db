import { PrismaClient } from '../src/generated/client/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const connectionString = process.env.DATABASE_URL

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Mapped from provided Supabase IDs to our semantic Region names
const regionMap: Record<string, string> = {
  "87b02b90-8234-430e-83e1-6231e57aaa45": "Head & Neck",
  "f38c9aa9-1fc9-4b15-8eec-5627a53374ab": "Upper Limb",
  "8c92c079-ef3c-4f96-a2cb-efc4d6c4be79": "Lower Limb",
  "6fe2d7f7-3e00-49fc-a75b-468075fd86ec": "Trunk"
}

const rawMuscles = [
  {"id":"019e4f2a-c59f-4c81-9bcd-7c14200b1045","region_id":"8c92c079-ef3c-4f96-a2cb-efc4d6c4be79","name":"M. adductor brevis","synonyms":["Kurzer Anzieher"],"sort_order":150},
  {"id":"02bef1a7-db15-42c0-8893-20bfd080944d","region_id":"f38c9aa9-1fc9-4b15-8eec-5627a53374ab","name":"M. flexor digiti minimi brevis","synonyms":["Kurzer Kleinfingerbeuger"],"sort_order":280},
  {"id":"03f268fa-6856-45ff-a040-8558df34bf40","region_id":"6fe2d7f7-3e00-49fc-a75b-468075fd86ec","name":"M. sphincter ani externus","synonyms":["Äußerer Afterschließmuskel"],"sort_order":260},
  {"id":"045a32bd-fae3-47c9-8c65-66d59ff5adf5","region_id":"6fe2d7f7-3e00-49fc-a75b-468075fd86ec","name":"M. supraspinatus","synonyms":["Obergrätenmuskel"],"sort_order":170},
  {"id":"0a34ec84-24ca-41f8-8d21-da0ab2195589","region_id":"8c92c079-ef3c-4f96-a2cb-efc4d6c4be79","name":"M. popliteus","synonyms":["Kniekehlenmuskel"],"sort_order":240},
  {"id":"0f2fb917-0d00-43b1-873f-b71a611e6c28","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. temporalis","synonyms":["Schläfenmuskel"],"sort_order":150},
  {"id":"10378274-6c90-45e5-b123-6453b2279d83","region_id":"f38c9aa9-1fc9-4b15-8eec-5627a53374ab","name":"Mm. interossei dorsales","synonyms":["Rückenseitige Zwischenknochenmuskeln"],"sort_order":310},
  {"id":"10b30ff7-9c42-4123-a798-6570a93f58a9","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. splenius capitis","synonyms":["Riemenmuskel des Kopfes"],"sort_order":190},
  {"id":"1271c6f1-d120-4083-bef5-6f8a4e737deb","region_id":"f38c9aa9-1fc9-4b15-8eec-5627a53374ab","name":"M. extensor indicis","synonyms":["Zeigefingerstrecker"],"sort_order":190},
  {"id":"132d46c0-f91e-4c96-98aa-736e0a79abb3","region_id":"6fe2d7f7-3e00-49fc-a75b-468075fd86ec","name":"M. serratus anterior","synonyms":["Vorderer Sägemuskel"],"sort_order":160},
  {"id":"138b3dd0-0580-49a7-853a-a41d937f1433","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. mentalis","synonyms":["Kinnmuskel"],"sort_order":130},
  {"id":"15797608-1c36-4495-9189-f8581ac30fd6","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. splenius cervicis","synonyms":["Riemenmuskel des Halses"],"sort_order":200},
  {"id":"15f32ef5-8516-40bb-9c5f-ba2c8a3dcaad","region_id":"8c92c079-ef3c-4f96-a2cb-efc4d6c4be79","name":"M. gastrocnemius","synonyms":["Zwillingswadenmuskel"],"sort_order":210},
  {"id":"199f8ccb-b9f8-4e84-8327-cad1afa7100b","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. sternohyoideus","synonyms":["Brustbeinzungenbeinmuskel"],"sort_order":380},
  {"id":"1f70f2f1-75d5-4330-b48a-cbb65eb2441e","region_id":"f38c9aa9-1fc9-4b15-8eec-5627a53374ab","name":"M. coracobrachialis","synonyms":["Hakenarmmuskel"],"sort_order":330},
  {"id":"2396631d-624f-490f-9df7-aa722f611942","region_id":"8c92c079-ef3c-4f96-a2cb-efc4d6c4be79","name":"M. iliopsoas","synonyms":["Darmbeinlendenmuskel"],"sort_order":10},
  {"id":"23ea664e-803d-405a-9f44-63b6a98dcb99","region_id":"6fe2d7f7-3e00-49fc-a75b-468075fd86ec","name":"M. bulbospongiosus","synonyms":["Vorhofschwellkörpermuskel"],"sort_order":280},
  {"id":"2631ccfa-208a-4a52-98df-541d0c5db012","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. rectus capitis posterior major","synonyms":["Großer hinterer gerader Kopfmuskel"],"sort_order":330},
  {"id":"270d6f76-41a8-4046-afb1-eeb356ccbcf4","region_id":"6fe2d7f7-3e00-49fc-a75b-468075fd86ec","name":"M. subscapularis","synonyms":["Unterschulterblattmuskel"],"sort_order":190},
  {"id":"27cc83a6-b46f-4a66-b900-3ef848f58585","region_id":"f38c9aa9-1fc9-4b15-8eec-5627a53374ab","name":"M. deltoideus","synonyms":["Deltamuskel"],"sort_order":10},
  {"id":"27fce1fa-2ef2-47c0-8ecb-467ac4ee67c0","region_id":"f38c9aa9-1fc9-4b15-8eec-5627a53374ab","name":"M. extensor carpi radialis longus","synonyms":["Langer speichenseitiger Handstrecker"],"sort_order":150},
  {"id":"2a5b818e-5574-43b6-bba8-0a1f8cd6b216","region_id":"f38c9aa9-1fc9-4b15-8eec-5627a53374ab","name":"M. extensor digitorum","synonyms":["Fingerstrecker"],"sort_order":180},
  {"id":"2a6d23b4-2f8b-4c68-aaa3-c075ff7ea3f5","region_id":"f38c9aa9-1fc9-4b15-8eec-5627a53374ab","name":"M. flexor carpi ulnaris","synonyms":["Ellenseitiger Handbeuger"],"sort_order":100},
  {"id":"2a95f53d-18cd-4465-8f88-fcd6bd260944","region_id":"6fe2d7f7-3e00-49fc-a75b-468075fd86ec","name":"M. pectoralis major","synonyms":["Großer Brustmuskel"],"sort_order":10},
  {"id":"2d277a58-e875-4df3-b8a9-4f5dc45dfcb0","region_id":"8c92c079-ef3c-4f96-a2cb-efc4d6c4be79","name":"Mm. lumbricales","synonyms":["Spulmuskeln"],"sort_order":370},
  {"id":"2d46e53d-4292-48f3-a5ab-1ce54a4bf1f0","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. orbicularis oris","synonyms":["Mundringmuskel"],"sort_order":90},
  {"id":"3245db49-effe-4bad-8230-a23fb4e9416a","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. risorius","synonyms":["Lachmuskel"],"sort_order":100},
  {"id":"3373414d-5477-4381-bbba-580eeb25bb28","region_id":"6fe2d7f7-3e00-49fc-a75b-468075fd86ec","name":"M. infraspinatus","synonyms":["Untergrätenmuskel"],"sort_order":180},
  {"id":"337a3c94-5223-49fe-aaaa-d9a6c404f7cf","region_id":"f38c9aa9-1fc9-4b15-8eec-5627a53374ab","name":"M. pronator teres","synonyms":["Runder Einwärtsdreher"],"sort_order":60},
  {"id":"3a863e39-8399-4cbc-8d3f-d650ec922a3b","region_id":"8c92c079-ef3c-4f96-a2cb-efc4d6c4be79","name":"M. abductor hallucis","synonyms":["Großzehenabspreizer"],"sort_order":340},
  {"id":"3a9afeb0-498e-4514-8992-eb5b014b47ce","region_id":"f38c9aa9-1fc9-4b15-8eec-5627a53374ab","name":"M. supinator","synonyms":["Auswärtsdreher"],"sort_order":80},
  {"id":"3be5b659-c6c2-4d50-bc64-02d6bd09cf0c","region_id":"8c92c079-ef3c-4f96-a2cb-efc4d6c4be79","name":"M. adductor longus","synonyms":["Langer Anzieher"],"sort_order":140},
  {"id":"4001254d-3c9c-4507-b611-763d5a581178","region_id":"8c92c079-ef3c-4f96-a2cb-efc4d6c4be79","name":"M. tibialis anterior","synonyms":["Vorderer Schienbeinmuskel"],"sort_order":250},
  {"id":"403ec0b4-2812-4c35-a0f6-87a1c3a3ef06","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. masseter","synonyms":["Kaumuskel"],"sort_order":140},
  {"id":"414aec4e-b662-49fd-bd98-63cb43f7c11f","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. longus capitis","synonyms":["Langer Kopfmuskel"],"sort_order":320},
  {"id":"42f37c5f-1242-4e54-8711-e087914d0095","region_id":"f38c9aa9-1fc9-4b15-8eec-5627a53374ab","name":"M. brachialis","synonyms":["Armbeuger"],"sort_order":30},
  {"id":"457879b0-5fdd-4512-8046-3a7974ee3776","region_id":"8c92c079-ef3c-4f96-a2cb-efc4d6c4be79","name":"M. quadratus plantae","synonyms":["Sohlenviereckmuskel"],"sort_order":360},
  {"id":"47f63b22-424c-478b-985b-7d45903ee73d","region_id":"6fe2d7f7-3e00-49fc-a75b-468075fd86ec","name":"M. rhomboideus minor","synonyms":["Kleiner Rautenmuskel"],"sort_order":150},
  {"id":"499dc3e0-2709-4808-9921-10d8f85f3373","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. obliquus capitis inferior","synonyms":["Unterer schiefer Kopfmuskel"],"sort_order":350},
  {"id":"4a7342ad-ea76-445b-bcde-4f4ca4dbdf7c","region_id":"6fe2d7f7-3e00-49fc-a75b-468075fd86ec","name":"M. longissimus","synonyms":["Langer Muskel"],"sort_order":100},
  {"id":"4b3a3c1f-474a-4a20-a5d6-21e42150e210","region_id":"8c92c079-ef3c-4f96-a2cb-efc4d6c4be79","name":"M. sartorius","synonyms":["Schneidermuskel"],"sort_order":120},
  {"id":"4e04bcaf-4fcd-4f99-be9a-08acbee4d8e1","region_id":"f38c9aa9-1fc9-4b15-8eec-5627a53374ab","name":"M. anconeus","synonyms":["Ellenbogenhöckermuskel"],"sort_order":340},
  {"id":"53b375e0-584c-42e9-abf2-c866cc8f11b9","region_id":"6fe2d7f7-3e00-49fc-a75b-468075fd86ec","name":"M. obliquus externus abdominis","synonyms":["Äußerer schräger Bauchmuskel"],"sort_order":50},
  {"id":"54a6719b-e79d-414b-93df-2e61772e71e6","region_id":"8c92c079-ef3c-4f96-a2cb-efc4d6c4be79","name":"M. peroneus longus","synonyms":["Langer Wadenbeinmuskel"],"sort_order":270},
  {"id":"56ba1e17-bd12-4d43-bf99-499fc12465b5","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. thyrohyoideus","synonyms":["Schildknorpelzungenbeinmuskel"],"sort_order":390},
  {"id":"578fbb92-df46-4a0b-80c2-77c9ad3288ef","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. zygomaticus major","synonyms":["Großer Jochbeinmuskel"],"sort_order":70},
  {"id":"597f080f-e95e-44d8-9d1a-f333fea5df85","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. corrugator supercilii","synonyms":["Augenbrauenrunzler"],"sort_order":20},
  {"id":"5b528576-64e2-4e52-ae7b-8c2665ad5033","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. omohyoideus","synonyms":["Schulterblattzungenbeinmuskel"],"sort_order":370},
  {"id":"5b5b3107-b170-45cf-8244-2c21bb49f35d","region_id":"8c92c079-ef3c-4f96-a2cb-efc4d6c4be79","name":"M. gluteus maximus","synonyms":["Großer Gesäßmuskel"],"sort_order":20},
  {"id":"5d751056-1397-424c-b4cc-e9e7908097d1","region_id":"f38c9aa9-1fc9-4b15-8eec-5627a53374ab","name":"M. flexor pollicis brevis","synonyms":["Kurzer Daumenbeuger"],"sort_order":240},
  {"id":"5e598095-5954-4d4d-af02-50ec6b1beeca","region_id":"6fe2d7f7-3e00-49fc-a75b-468075fd86ec","name":"M. erector spinae","synonyms":["Rückenstrecker"],"sort_order":80},
  {"id":"6000b459-9f23-4e26-b6a1-d7647bbf9dd4","region_id":"f38c9aa9-1fc9-4b15-8eec-5627a53374ab","name":"M. palmaris longus","synonyms":["Langer Hohlhandmuskel"],"sort_order":110},
  {"id":"60bef186-dbed-43e9-83a5-dce2c23cebde","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. cricothyroideus","synonyms":["Ringknorpelschildknorpelmuskel"],"sort_order":400},
  {"id":"615a9181-5e57-4dab-9c75-8b7f48a0b2b2","region_id":"f38c9aa9-1fc9-4b15-8eec-5627a53374ab","name":"M. brachialis","synonyms":["Armbeuger"],"sort_order":30},
  {"id":"61ad323d-cde6-4d07-a79f-7c6c4d15069f","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. semispinalis capitis","synonyms":["Halbdoornmuskel des Kopfes"],"sort_order":230},
  {"id":"62508432-e048-4a43-b1a5-fa49da47bb87","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. levator scapulae","synonyms":["Schulterblattheber"],"sort_order":220},
  {"id":"657a643d-042b-4005-b55f-694efc7f7cad","region_id":"8c92c079-ef3c-4f96-a2cb-efc4d6c4be79","name":"M. tensor fasciae latae","synonyms":["Schenkelbindenspanner"],"sort_order":50},
  {"id":"677df48e-9863-4670-906d-68e8236ff035","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. frontalis","synonyms":["Stirnmuskel"],"sort_order":10},
  {"id":"6a022852-882f-40f1-adea-40ec67ad66de","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. trapezius","synonyms":["Kapuzenmuskel"],"sort_order":210},
  {"id":"6b774ec4-4144-49cd-9037-c4e2114cf942","region_id":"8c92c079-ef3c-4f96-a2cb-efc4d6c4be79","name":"M. vastus medialis","synonyms":["Innerer Oberschenkelmuskel"],"sort_order":100},
  {"id":"6d4057d7-c83a-4015-a00c-d21116727116","region_id":"8c92c079-ef3c-4f96-a2cb-efc4d6c4be79","name":"M. pectineus","synonyms":["Kammuskel"],"sort_order":170},
  {"id":"7030ae09-70b8-4776-98a8-93ff84a128e1","region_id":"8c92c079-ef3c-4f96-a2cb-efc4d6c4be79","name":"M. flexor digitorum longus","synonyms":["Langer Zehenbeuger"],"sort_order":310},
  {"id":"70c45562-9c05-4a1e-8769-de27ab7f6555","region_id":"f38c9aa9-1fc9-4b15-8eec-5627a53374ab","name":"Mm. lumbricales","synonyms":["Spulmuskeln"],"sort_order":300},
  {"id":"71c5936d-29f6-4684-9df0-ccdb4522545d","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. longus colli","synonyms":["Langer Halsmuskel"],"sort_order":310},
  {"id":"7271e506-9edb-495e-8b21-c8bb0b4e2e4d","region_id":"6fe2d7f7-3e00-49fc-a75b-468075fd86ec","name":"M. quadratus lumborum","synonyms":["Quadratischer Lendenmuskel"],"sort_order":130},
  {"id":"72d7be7e-9567-4952-af1b-1111ef8df63e","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. depressor labii inferioris","synonyms":["Unterlippenherabzieher"],"sort_order":120},
  {"id":"7560c7d6-3139-4103-9112-292d373bb22d","region_id":"6fe2d7f7-3e00-49fc-a75b-468075fd86ec","name":"M. intercostalis externus","synonyms":["Äußerer Zwischenrippenmuskel"],"sort_order":220},
  {"id":"78a9949f-b543-44a0-bf36-71e3de9fbc59","region_id":"6fe2d7f7-3e00-49fc-a75b-468075fd86ec","name":"M. transversus abdominis","synonyms":["Querer Bauchmuskel"],"sort_order":70},
  {"id":"7956bb8f-9a24-41ba-a43a-2c0598822430","region_id":"6fe2d7f7-3e00-49fc-a75b-468075fd86ec","name":"M. ischiocavernosus","synonyms":["Sitzbeinschwellkörpermuskel"],"sort_order":270},
  {"id":"7aa01d1a-d780-40b0-bb08-42acbb8a2596","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. orbicularis oculi","synonyms":["Augenringmuskel"],"sort_order":40},
  {"id":"7b3d7dda-43d8-4145-b2ee-626620965fea","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. sternocleidomastoideus","synonyms":["Kopfnicker","SCM"],"sort_order":180},
  {"id":"7e27d666-e3d7-49af-a03c-9fd6887a1444","region_id":"8c92c079-ef3c-4f96-a2cb-efc4d6c4be79","name":"M. piriformis","synonyms":["Birnförmiger Muskel"],"sort_order":60},
  {"id":"7e7603c5-9b75-4f72-8a8e-774550801c49","region_id":"8c92c079-ef3c-4f96-a2cb-efc4d6c4be79","name":"M. plantaris","synonyms":["Sohlenmuskel"],"sort_order":230},
  {"id":"8057aa76-3ef2-4df9-a555-625ea35dbfb9","region_id":"6fe2d7f7-3e00-49fc-a75b-468075fd86ec","name":"M. rhomboideus major","synonyms":["Großer Rautenmuskel"],"sort_order":140},
  {"id":"80b79f0b-7829-4734-8141-ed02c92950ea","region_id":"f38c9aa9-1fc9-4b15-8eec-5627a53374ab","name":"M. abductor pollicis brevis","synonyms":["Kurzer Daumenabspreizer"],"sort_order":230},
  {"id":"8775acc1-db06-4afb-8695-21d7e086139d","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. scalenus medius","synonyms":["Mittlerer Treppenmuskel"],"sort_order":250},
  {"id":"877a324c-0b1b-4d39-812d-cca59acae4b9","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. digastricus","synonyms":["Zweibäuchiger Muskel"],"sort_order":280},
  {"id":"88eea1db-5bdd-4fa2-8537-692f99d3a54b","region_id":"6fe2d7f7-3e00-49fc-a75b-468075fd86ec","name":"M. psoas major","synonyms":["Großer Lendenmuskel"],"sort_order":290},
  {"id":"89160868-74ca-4a7a-835b-cf5ad1b846eb","region_id":"f38c9aa9-1fc9-4b15-8eec-5627a53374ab","name":"M. extensor carpi radialis brevis","synonyms":["Kurzer speichenseitiger Handstrecker"],"sort_order":160},
  {"id":"8d78e733-1d48-4f63-9129-fed1c3deb83f","region_id":"f38c9aa9-1fc9-4b15-8eec-5627a53374ab","name":"M. flexor digitorum profundus","synonyms":["Tiefer Fingerbeuger"],"sort_order":130},
  {"id":"8ee50428-ef57-46f8-b4cd-da36bb7f42ac","region_id":"6fe2d7f7-3e00-49fc-a75b-468075fd86ec","name":"M. psoas minor","synonyms":["Kleiner Lendenmuskel"],"sort_order":300},
  {"id":"9289ac44-edbf-47e2-80f3-62a51c595431","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. scalenus anterior","synonyms":["Vorderer Treppenmuskel"],"sort_order":240},
  {"id":"929428ac-09e7-4d96-b030-b3da96f54f4a","region_id":"f38c9aa9-1fc9-4b15-8eec-5627a53374ab","name":"M. abductor pollicis longus","synonyms":["Langer Daumenabspreizer"],"sort_order":220},
  {"id":"93e52811-6c2e-4da9-a15b-d5e6da7caed6","region_id":"8c92c079-ef3c-4f96-a2cb-efc4d6c4be79","name":"M. adductor magnus","synonyms":["Großer Anzieher"],"sort_order":130},
  {"id":"96dce0aa-bf15-4a82-9e8c-e61b9f4a0834","region_id":"6fe2d7f7-3e00-49fc-a75b-468075fd86ec","name":"M. spinalis","synonyms":["Dornfortsatzmuskel"],"sort_order":110},
  {"id":"98b275c1-502b-45e0-bab0-fc258bdfbf76","region_id":"8c92c079-ef3c-4f96-a2cb-efc4d6c4be79","name":"M. peroneus brevis","synonyms":["Kurzer Wadenbeinmuskel"],"sort_order":280},
  {"id":"9958939f-5d5a-4b4d-a0c2-458cc1cd1f7f","region_id":"f38c9aa9-1fc9-4b15-8eec-5627a53374ab","name":"M. flexor pollicis longus","synonyms":["Langer Daumenbeuger"],"sort_order":140},
  {"id":"9964329d-4739-43dd-b4d6-5f17b1950d29","region_id":"6fe2d7f7-3e00-49fc-a75b-468075fd86ec","name":"M. obliquus internus abdominis","synonyms":["Innerer schräger Bauchmuskel"],"sort_order":60},
  {"id":"9cd9a890-b4be-42b7-8c16-1c580265376d","region_id":"8c92c079-ef3c-4f96-a2cb-efc4d6c4be79","name":"M. rectus femoris","synonyms":["Gerader Oberschenkelmuskel"],"sort_order":80},
  {"id":"9f558e9f-729b-4b63-98e5-c6b173a77b09","region_id":"8c92c079-ef3c-4f96-a2cb-efc4d6c4be79","name":"M. flexor hallucis longus","synonyms":["Langer Großzehenbeuger"],"sort_order":320},
  {"id":"a25f094a-7b74-41bd-8d0b-d19246c1f953","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. procerus","synonyms":["Schlanker Muskel"],"sort_order":30},
  {"id":"a49838e2-e9c2-458e-bdf2-c6a103912607","region_id":"8c92c079-ef3c-4f96-a2cb-efc4d6c4be79","name":"M. vastus lateralis","synonyms":["Äußerer Oberschenkelmuskel"],"sort_order":90},
  {"id":"a62b6949-a513-4ab2-aea1-3326d30923f4","region_id":"f38c9aa9-1fc9-4b15-8eec-5627a53374ab","name":"M. abductor digiti minimi","synonyms":["Kleinfingerabspreizer"],"sort_order":270},
  {"id":"a7d6dd1e-d05f-4d3a-9bbc-06ce0148e264","region_id":"6fe2d7f7-3e00-49fc-a75b-468075fd86ec","name":"M. iliocostalis","synonyms":["Darmbeinrippenmuskel"],"sort_order":90},
  {"id":"a840f01d-8785-4e5b-b296-6786f44239c3","region_id":"8c92c079-ef3c-4f96-a2cb-efc4d6c4be79","name":"M. flexor digitorum brevis","synonyms":["Kurzer Zehenbeuger"],"sort_order":330},
  {"id":"a8869b4b-fa38-4ab4-95d2-cec46ab7f6da","region_id":"6fe2d7f7-3e00-49fc-a75b-468075fd86ec","name":"M. pectoralis minor","synonyms":["Kleiner Brustmuskel"],"sort_order":20},
  {"id":"ab4376f0-14b8-4dc7-ba59-f8e2b36933ff","region_id":"f38c9aa9-1fc9-4b15-8eec-5627a53374ab","name":"M. pronator quadratus","synonyms":["Quadratischer Einwärtsdreher"],"sort_order":70},
  {"id":"b4776116-1648-4257-b79e-523e5c54b447","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. obliquus capitis superior","synonyms":["Oberer schiefer Kopfmuskel"],"sort_order":360},
  {"id":"b565621f-0ac4-4073-a039-846d9335bbdb","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. pterygoideus lateralis","synonyms":["Äußerer Flügelmuskel"],"sort_order":170},
  {"id":"b5fcd428-170d-48bc-93b7-bdcbec4311b5","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. geniohyoideus","synonyms":["Kinnzungenbeinmuskel"],"sort_order":300},
  {"id":"b6ab2e9b-1172-4694-b341-ef40a3dc6110","region_id":"f38c9aa9-1fc9-4b15-8eec-5627a53374ab","name":"M. triceps brachii","synonyms":["Dreiköpfiger Armmuskel"],"sort_order":40},
  {"id":"b9018f92-9f4a-425d-8aa2-9fac2e32f5c2","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. scalenus posterior","synonyms":["Hinterer Treppenmuskel"],"sort_order":260},
  {"id":"bd213c38-ad43-4b6c-a875-ac45f137c1cf","region_id":"8c92c079-ef3c-4f96-a2cb-efc4d6c4be79","name":"M. soleus","synonyms":["Schollenmuskel"],"sort_order":220},
  {"id":"bd34ff09-5099-4840-8c8e-decc6340e551","region_id":"f38c9aa9-1fc9-4b15-8eec-5627a53374ab","name":"M. flexor digitorum superficialis","synonyms":["Oberflächlicher Fingerbeuger"],"sort_order":120},
  {"id":"bd6af047-0b8b-4405-81a2-f5f34e76f1a3","region_id":"8c92c079-ef3c-4f96-a2cb-efc4d6c4be79","name":"M. quadriceps femoris","synonyms":["Vierköpfiger Oberschenkelmuskel"],"sort_order":70},
  {"id":"bdd4aa65-0f9a-4b49-9c87-f56803a1b0da","region_id":"8c92c079-ef3c-4f96-a2cb-efc4d6c4be79","name":"M. biceps femoris","synonyms":["Zweiköpfiger Oberschenkelmuskel"],"sort_order":180},
  {"id":"c0aadebe-49cc-4628-a493-7d6a93aed0e8","region_id":"f38c9aa9-1fc9-4b15-8eec-5627a53374ab","name":"M. extensor pollicis brevis","synonyms":["Kurzer Daumenstrecker"],"sort_order":210},
  {"id":"c1b60284-3127-41b7-ae80-8571babdece5","region_id":"6fe2d7f7-3e00-49fc-a75b-468075fd86ec","name":"M. teres minor","synonyms":["Kleiner Rundmuskel"],"sort_order":210},
  {"id":"c6054781-8123-4842-bf7a-cf7cc006f3d4","region_id":"f38c9aa9-1fc9-4b15-8eec-5627a53374ab","name":"M. biceps brachii","synonyms":["Zweiköpfiger Armmuskel"],"sort_order":20},
  {"id":"c82901d6-00d1-40bd-b1dc-49ee062e215f","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. rectus capitis posterior minor","synonyms":["Kleiner hinterer gerader Kopfmuskel"],"sort_order":340},
  {"id":"c83ed6f6-57c2-442d-a1da-174d70559ced","region_id":"6fe2d7f7-3e00-49fc-a75b-468075fd86ec","name":"M. intercostalis internus","synonyms":["Innerer Zwischenrippenmuskel"],"sort_order":230},
  {"id":"c954f017-e970-4227-bcdf-252f28e4f65c","region_id":"8c92c079-ef3c-4f96-a2cb-efc4d6c4be79","name":"M. extensor hallucis longus","synonyms":["Langer Großzehenstrecker"],"sort_order":300},
  {"id":"c9c66de4-c7ce-40a6-83be-c79d057615f0","region_id":"8c92c079-ef3c-4f96-a2cb-efc4d6c4be79","name":"M. gluteus medius","synonyms":["Mittlerer Gesäßmuskel"],"sort_order":30},
  {"id":"cc0046fe-b5bd-4775-8e2c-758bfdc2679a","region_id":"6fe2d7f7-3e00-49fc-a75b-468075fd86ec","name":"M. rectus abdominis","synonyms":["Gerader Bauchmuskel"],"sort_order":40},
  {"id":"cce07209-4c0c-44ad-9595-19d03029a362","region_id":"6fe2d7f7-3e00-49fc-a75b-468075fd86ec","name":"M. latissimus dorsi","synonyms":["Breiter Rückenmuskel"],"sort_order":30},
  {"id":"cf4dec6e-c25d-4d2a-ba61-d3ad6bc01d28","region_id":"f38c9aa9-1fc9-4b15-8eec-5627a53374ab","name":"M. extensor pollicis longus","synonyms":["Langer Daumenstrecker"],"sort_order":200},
  {"id":"d0c22c12-c184-4a1f-8976-6f1d569375ff","region_id":"f38c9aa9-1fc9-4b15-8eec-5627a53374ab","name":"M. extensor carpi ulnaris","synonyms":["Ellenseitiger Handstrecker"],"sort_order":170},
  {"id":"d14721f6-d69a-4404-9711-ad2c873de9d4","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. depressor anguli oris","synonyms":["Mundwinkelherabzieher"],"sort_order":110},
  {"id":"d4969a3d-8225-4fc4-8068-bef0fe869a3a","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. pterygoideus medialis","synonyms":["Innerer Flügelmuskel"],"sort_order":160},
  {"id":"d6eb12f0-9afc-421d-8e41-98c950f7c2f7","region_id":"f38c9aa9-1fc9-4b15-8eec-5627a53374ab","name":"M. adductor pollicis","synonyms":["Daumenanzieher"],"sort_order":260},
  {"id":"d7880577-dba7-40f3-abc5-54894c323b20","region_id":"8c92c079-ef3c-4f96-a2cb-efc4d6c4be79","name":"M. vastus intermedius","synonyms":["Mittlerer Oberschenkelmuskel"],"sort_order":110},
  {"id":"d7af175b-d96e-422e-a71d-d94f82e63eda","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. nasalis","synonyms":["Nasenmuskel"],"sort_order":50},
  {"id":"d913adec-f792-43af-8e6c-0dd2890c6e32","region_id":"8c92c079-ef3c-4f96-a2cb-efc4d6c4be79","name":"M. abductor digiti minimi","synonyms":["Kleinenzehenabspreizer"],"sort_order":350},
  {"id":"d9144e16-8576-4cb9-8f1d-e0b082ad0264","region_id":"8c92c079-ef3c-4f96-a2cb-efc4d6c4be79","name":"M. gracilis","synonyms":["Schlankmuskel"],"sort_order":160},
  {"id":"dd97b02a-dc95-44af-b833-74786c22239c","region_id":"8c92c079-ef3c-4f96-a2cb-efc4d6c4be79","name":"M. gluteus minimus","synonyms":["Kleiner Gesäßmuskel"],"sort_order":40},
  {"id":"e3493498-0f72-4c88-bafd-02fd5fccf448","region_id":"8c92c079-ef3c-4f96-a2cb-efc4d6c4be79","name":"Mm. interossei dorsales","synonyms":["Rückenseitige Zwischenknochenmuskeln"],"sort_order":380},
  {"id":"e532e5c7-6cea-4e74-b5f5-34ff62b55796","region_id":"8c92c079-ef3c-4f96-a2cb-efc4d6c4be79","name":"M. semitendinosus","synonyms":["Halbsehnenmuskel"],"sort_order":190},
  {"id":"e557965f-f06c-46f2-944d-1223cad6ba45","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. platysma","synonyms":["Halsmuskel"],"sort_order":270},
  {"id":"e61c2ebf-8f5f-4f13-8b8f-f69a259d8a4e","region_id":"f38c9aa9-1fc9-4b15-8eec-5627a53374ab","name":"M. opponens digiti minimi","synonyms":["Kleinfingergegensteller"],"sort_order":290},
  {"id":"e7534226-d48b-4881-9eab-4714761753dc","region_id":"8c92c079-ef3c-4f96-a2cb-efc4d6c4be79","name":"M. tibialis posterior","synonyms":["Hinterer Schienbeinmuskel"],"sort_order":260},
  {"id":"e84283f7-36fe-4c8c-9903-8b03dd276eec","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. mylohyoideus","synonyms":["Kieferzungenbeinmuskel"],"sort_order":290},
  {"id":"e85cf224-a2de-4895-9785-6cf5151305dc","region_id":"6fe2d7f7-3e00-49fc-a75b-468075fd86ec","name":"M. levator ani","synonyms":["Afterheber"],"sort_order":250},
  {"id":"e87951ed-d7a1-4dd3-ad78-ac09f4f0958c","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. levator labii superioris alaeque nasi","synonyms":["Nasenflügelheber","LLSAN"],"sort_order":60},
  {"id":"ec10d456-b4ad-49b6-8178-bd1762bd1c1b","region_id":"f38c9aa9-1fc9-4b15-8eec-5627a53374ab","name":"M. opponens pollicis","synonyms":["Daumengegensteller"],"sort_order":250},
  {"id":"eced57b7-9ccc-4a40-99e4-41e2f75d783d","region_id":"f38c9aa9-1fc9-4b15-8eec-5627a53374ab","name":"M. flexor carpi radialis","synonyms":["Speichenseitiger Handbeuger"],"sort_order":90},
  {"id":"ed9f8693-c00e-4cd4-a234-a908d0502b4a","region_id":"8c92c079-ef3c-4f96-a2cb-efc4d6c4be79","name":"M. semimembranosus","synonyms":["Plattsehnenmuskel"],"sort_order":200},
  {"id":"ee3c130c-5ee0-45fd-ad61-b0d7e247077f","region_id":"6fe2d7f7-3e00-49fc-a75b-468075fd86ec","name":"M. teres major","synonyms":["Großer Rundmuskel"],"sort_order":200},
  {"id":"f0835bba-610d-4227-a331-1c3cba2c210e","region_id":"8c92c079-ef3c-4f96-a2cb-efc4d6c4be79","name":"M. extensor digitorum longus","synonyms":["Langer Zehenstrecker"],"sort_order":290},
  {"id":"f2476ecf-0241-4a6a-ad4e-f78b38e69185","region_id":"6fe2d7f7-3e00-49fc-a75b-468075fd86ec","name":"M. multifidus","synonyms":["Vielgefiederter Muskel"],"sort_order":120},
  {"id":"f3fa9e05-2f22-44a9-ba11-2a412fa7b844","region_id":"6fe2d7f7-3e00-49fc-a75b-468075fd86ec","name":"M. diaphragma","synonyms":["Zwerchfell"],"sort_order":240},
  {"id":"fbe9d734-a956-4dca-b8a6-f43a68c2a6d6","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. zygomaticus minor","synonyms":["Kleiner Jochbeinmuskel"],"sort_order":80},
  {"id":"fee08091-67a6-409f-b52f-dd042d77bf62","region_id":"f38c9aa9-1fc9-4b15-8eec-5627a53374ab","name":"Mm. interossei palmares","synonyms":["Hohlhandseitige Zwischenknochenmuskeln"],"sort_order":320},
  // Manual additions for Migraine Protocol
  {"id":"manual-occipitalis","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. occipitalis","synonyms":["Hinterhauptsmuskel"],"sort_order":410},
  {"id":"manual-paraspinalis","region_id":"87b02b90-8234-430e-83e1-6231e57aaa45","name":"M. paraspinalis (cervical)","synonyms":["Nackenmuskulatur", "Paravertebral"],"sort_order":420}
]

const rawDiagnoses = [
  // Dystonia
  { code: "G24.3", label: "Spasmodic torticollis", system: "ICD-10" },
  { code: "G24.5", label: "Blepharospasm", system: "ICD-10" },
  { code: "G24.4", label: "Idiopathic orofacial dystonia", system: "ICD-10" },
  { code: "G24.1", label: "Idiopathic familial dystonia", system: "ICD-10" },
  { code: "G24.8", label: "Other dystonia", system: "ICD-10" },
  
  // Spasticity & Cerebral Palsy
  { code: "G80.0", label: "Spastic quadriplegic cerebral palsy", system: "ICD-10" },
  { code: "G80.1", label: "Spastic diplegic cerebral palsy", system: "ICD-10" },
  { code: "G80.2", label: "Spastic hemiplegic cerebral palsy", system: "ICD-10" },
  { code: "G81.1", label: "Spastic hemiplegia", system: "ICD-10" },
  { code: "G82.1", label: "Spastic paraplegia", system: "ICD-10" },
  { code: "G82.4", label: "Spastic tetraplegia", system: "ICD-10" },
  { code: "M62.8", label: "Other specified disorders of muscle (Spasticity)", system: "ICD-10" },
  { code: "I69.3", label: "Sequelae of cerebral infarction (Post-stroke spasticity)", system: "ICD-10" },

  // Facial Nerve / Spasm
  { code: "G51.3", label: "Clonic hemifacial spasm", system: "ICD-10" },
  { code: "G51.0", label: "Bell's palsy", system: "ICD-10" },

  // Headache
  { code: "G43.3", label: "Chronic migraine", system: "ICD-10" },
  { code: "G44.2", label: "Tension-type headache", system: "ICD-10" },

  // Autonomic / Other
  { code: "R61.9", label: "Hyperhidrosis, unspecified", system: "ICD-10" },
  { code: "R61.0", label: "Localized hyperhidrosis", system: "ICD-10" },
  { code: "K11.7", label: "Disturbances of salivary secretion (Sialorrhea)", system: "ICD-10" },
  { code: "N31.9", label: "Neuromuscular dysfunction of bladder, unspecified", system: "ICD-10" },
]

async function main() {
  console.log('🌱 Starting seed with FULL original data...')

  for (const muscle of rawMuscles) {
    const regionName = regionMap[muscle.region_id]
    if (!regionName) {
      console.warn(`⚠️ Unknown region ID: ${muscle.region_id} for muscle ${muscle.name}`)
      continue
    }

    // Upsert Region (ensure it exists)
    const region = await prisma.muscleRegion.upsert({
      where: { name: regionName },
      update: {},
      create: { 
        name: regionName,
        sortOrder: 0
      }
    })

    // Upsert Muscle
    await prisma.muscle.upsert({
      where: { name: muscle.name },
      update: {
        regionId: region.id,
        synonyms: muscle.synonyms,
        sortOrder: muscle.sort_order
      },
      create: {
        name: muscle.name,
        synonyms: muscle.synonyms,
        sortOrder: muscle.sort_order,
        regionId: region.id
      }
    })
  }

  console.log('📖 Seeding Diagnoses...')
  for (const diag of rawDiagnoses) {
    await prisma.diagnosis.upsert({
      where: { 
        codeSystem_code: {
          codeSystem: diag.system,
          code: diag.code
        }
      },
      update: { label: diag.label },
      create: {
        codeSystem: diag.system,
        code: diag.code,
        label: diag.label
      }
    })
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
