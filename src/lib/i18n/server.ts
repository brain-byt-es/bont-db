import { cookies } from "next/headers"
import { dictionaries, Locale } from "./dictionaries"

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const value = cookieStore.get("injexpro_locale")?.value
  if (value === 'en' || value === 'de') return value
  return 'en'
}

export async function getDictionary() {
  const locale = await getLocale()
  return dictionaries[locale]
}
