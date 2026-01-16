"use server"

import { cookies } from "next/headers"
import { Locale } from "@/lib/i18n/dictionaries"

export async function setLocaleAction(locale: Locale) {
  const cookieStore = await cookies()
  cookieStore.set("injexpro_locale", locale, { path: "/", maxAge: 60 * 60 * 24 * 365 })
}
