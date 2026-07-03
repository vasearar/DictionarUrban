'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

// Cheia și valorile de consimțământ (compatibile cu design-ul importat).
const STORAGE_KEY = 'dexurban-cookie-choice'
const GA_ID = 'G-NC9BXJJB81'

// Încarcă Google Analytics DOAR după consimțământ. Idempotent: nu se dublează.
function loadAnalytics() {
  if (typeof window === 'undefined') return
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
    let choice: string | null = null
    try { choice = localStorage.getItem(STORAGE_KEY) } catch { /* localStorage indisponibil */ }

    if (choice === 'accept') {
      // Consimțământ dat anterior → pornim analytics-ul, fără banner.
      loadAnalytics()
      return
    }
    if (choice === 'reject') {
      // Refuzat anterior → nu încărcăm nimic neesențial.
      return
    }

    // Nicio alegere încă → arătăm bannerul cu animație de intrare.
    setMounted(true)
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)))
    return () => cancelAnimationFrame(id)
  }, [])

  function decide(choice: 'accept' | 'reject') {
    try { localStorage.setItem(STORAGE_KEY, choice) } catch { /* ignore */ }
    if (choice === 'accept') loadAnalytics()

    // Animație de ieșire (glisare în jos), apoi scoatem din DOM.
    setOpen(false)
    setTimeout(() => setMounted(false), 700)
  }

  if (!mounted) return null

  return (
    <div
      role="dialog"
      aria-label="Setări cookie-uri"
      className={`cookie-panel ${open ? 'cookie-panel--open' : ''}`}
    >
      <div className="cookie-inner">
        <div className="cookie-copy">
          <div className="cookie-heading-row">
            <svg className="cookie-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M6 0H14V2H16V4H18V6H20V14H18V16H16V18H14V20H6V18H4V16H2V14H0V6H2V4H4V2H6V0ZM6 4H8V6H6V4ZM12 6H14V8H12V6ZM4 10H6V12H4V10ZM10 12H12V14H10V12Z" fill="currentColor" />
            </svg>
            <span className="cookie-heading">Fursecuri</span>
          </div>
          <p className="cookie-body">
            Folosim cookie-uri esențiale ca site-ul să funcționeze și, doar cu acordul tău,
            cookie-uri de analiză ca să înțelegem ce cuvinte cauți. Alegi tu.{' '}
            <Link href="/politica-de-confidentialitate" className="underline">Detalii</Link>.
          </p>
        </div>
        <div className="cookie-actions">
          <button className="dx-btn dx-btn--secondary" type="button" onClick={() => decide('reject')}>Refuz</button>
          <button className="dx-btn dx-btn--primary" type="button" onClick={() => decide('accept')}>Accept tot</button>
        </div>
      </div>
    </div>
  )
}
