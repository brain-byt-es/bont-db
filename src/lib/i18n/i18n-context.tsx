"use client"

import React, { createContext, useContext, useState } from 'react'
import { dictionaries, Locale } from './dictionaries'
import { setLocaleAction } from '@/app/actions/i18n'

interface I18nContextType {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children, initialLocale }: { children: React.ReactNode, initialLocale: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  const setLocale = (l: Locale) => {
    setLocaleState(l)
    setLocaleAction(l)
  }

  const t = (key: string): string => {
    const keys = key.split('.')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = dictionaries[locale]
    for (const k of keys) {
      if (current[k] === undefined) return key
      current = current[k]
    }
    return typeof current === 'string' ? current : key
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export const useTranslation = () => {
  const ctx = useContext(I18nContext)
  if (!ctx) {
      return { 
          locale: 'en' as Locale, 
          setLocale: () => {}, 
          t: (key: string) => key 
      }
  }
  return ctx
}
