"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { dictionaries, Locale } from './dictionaries'

interface I18nContextType {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = localStorage.getItem('injexpro_locale') as Locale
      if (saved && (saved === 'en' || saved === 'de')) {
        if (saved !== 'en') {
          setLocaleState(saved)
        }
      }
      setMounted(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const setLocale = (l: Locale) => {
    setLocaleState(l)
    localStorage.setItem('injexpro_locale', l)
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

  if (!mounted) return <>{children}</> // Render children with default 'en' until hydrated to avoid mismatch? Or null? Children is better for SEO/Flash but might flicker. 
  // Actually, for client components, mismatch happens if server renders 'en' and client switches to 'de'.
  // We accept this small flicker for the MVP Foundation.

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export const useTranslation = () => {
  const ctx = useContext(I18nContext)
  if (!ctx) {
      // Fallback for when used outside provider (e.g. tests or strict server components if mistakenly called)
      // Though this hook is client-only.
      return { 
          locale: 'en' as Locale, 
          setLocale: () => {}, 
          t: (key: string) => key 
      }
  }
  return ctx
}
