'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

// Cheia și valorile de consimțământ.
const STORAGE_KEY = 'dexurban-cookie-choice'
const GA_ID = 'G-NC9BXJJB81'
// Alegerea expiră după 3 luni (pentru dispozitivele care nu curăță singure
// localStorage), ca să recerem consimțământul periodic.
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 90 // 90 zile
// Eveniment global prin care butonul din politica de confidențialitate
// reafișează bannerul.
const REOPEN_EVENT = 'dexurban-cookie:open'

type Choice = 'accept' | 'reject'

// Activează/dezactivează Google Analytics prin flag-ul oficial `ga-disable-<ID>`.
function setGaDisabled(disabled: boolean) {
  if (typeof window === 'undefined') return
  ;(window as unknown as Record<string, unknown>)[`ga-disable-${GA_ID}`] = disabled
}

// Citește alegerea validă (neexpirată) din localStorage; migrează formatul vechi.
function readChoice(): Choice | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    let choice: string | undefined
    let ts: number | undefined

    if (raw[0] === '{') {
      const parsed = JSON.parse(raw) as { choice?: string; ts?: number }
      choice = parsed.choice
      ts = parsed.ts
    } else if (raw === 'accept' || raw === 'reject') {
      // Format vechi (string simplu) → îl migrăm cu un timestamp curent.
      choice = raw
      writeChoice(raw)
      return raw
    }

    if (choice !== 'accept' && choice !== 'reject') return null
    if (typeof ts === 'number' && Date.now() - ts > MAX_AGE_MS) {
      localStorage.removeItem(STORAGE_KEY) // expirat → recerem consimțământul
      return null
    }
    return choice
  } catch {
    return null
  }
}

function writeChoice(choice: Choice) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice, ts: Date.now() }))
  } catch { /* localStorage indisponibil */ }
}

// Încarcă Google Analytics DOAR după consimțământ. Idempotent.
function loadAnalytics() {
  if (typeof window === 'undefined') return
  setGaDisabled(false)
  const w = window as unknown as { __gaLoaded?: boolean; dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void }
  if (w.__gaLoaded) return
  w.__gaLoaded = true

  const script = document.createElement('script')
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  script.async = true
  document.head.appendChild(script)

  w.dataLayer = w.dataLayer || []
  function gtag(...args: unknown[]) { w.dataLayer!.push(args) }
  w.gtag = gtag
  gtag('js', new Date())
  gtag('config', GA_ID)
}

export default function CookieConsent() {
  const [mounted, setMounted] = useState(false) // prezent în DOM
  const [open, setOpen] = useState(false)        // stare de animație (glisat în sus)

  useEffect(() => {
    function showBanner() {
      setMounted(true)
      // dublu rAF: garantează tranziția din translateY(100%) → 0 (intrare)
      requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)))
    }

    const choice = readChoice()
    if (choice === 'accept') {
      loadAnalytics()
    } else if (choice === 'reject') {
      setGaDisabled(true)
    } else {
      showBanner()
    }

    // Butonul „Schimbă preferințele cookie" reafișează bannerul.
    window.addEventListener(REOPEN_EVENT, showBanner)
    return () => window.removeEventListener(REOPEN_EVENT, showBanner)
  }, [])

  function decide(choice: Choice) {
    writeChoice(choice)
    if (choice === 'accept') loadAnalytics()
    else setGaDisabled(true) // taie efectiv analytics-ul, chiar dacă era pornit

    // Animație de ieșire (glisare în jos), apoi scoatem din DOM.
    setOpen(false)
    setTimeout(() => setMounted(false), 700)
  }

  if (!mounted) return null

  return (
    <div
      role="dialog"
      aria-label="Setări cookie-uri"
      className={`fursecuri-panel ${open ? 'fursecuri-panel--open' : ''}`}
    >
      <div className="fursecuri-inner">
        <div className="fursecuri-copy">
          <div className="fursecuri-heading-row">
            <svg className="fursecuri-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M6 0H14V2H16V4H18V6H20V14H18V16H16V18H14V20H6V18H4V16H2V14H0V6H2V4H4V2H6V0ZM6 4H8V6H6V4ZM12 6H14V8H12V6ZM4 10H6V12H4V10ZM10 12H12V14H10V12Z" fill="currentColor" />
            </svg>
            <span className="fursecuri-heading">Fursecuri</span>
          </div>
          <p className="fursecuri-body">
            Folosim cookie-uri esențiale ca site-ul să funcționeze și, doar cu acordul tău,
            cookie-uri de analiză ca să înțelegem ce cuvinte cauți. Alegi tu.{' '}
            <Link href="/politica-de-confidentialitate" className="underline">Detalii</Link>.
          </p>
        </div>
        <div className="fursecuri-actions">
          <button className="dx-btn dx-btn--secondary" type="button" onClick={() => decide('reject')}>Refuz</button>
          <button className="dx-btn dx-btn--primary" type="button" onClick={() => decide('accept')}>Accept tot</button>
        </div>
      </div>
    </div>
  )
}
