'use client'

// Buton care reafișează bannerul de cookie-uri (pentru retragerea/schimbarea
// consimțământului). Trimite un eveniment global ascultat de <CookieConsent />.
export default function CookiePreferencesButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event('dexurban-cookie:open'))}
      className="relative font-Spacegrotesc font-bold text-mywhite bg-myorange md:hover:bg-myhoverorange border-2 border-mygray rounded-sm rounded-br-none px-5 py-2 mydropshadow transition-all"
    >
      Schimbă preferințele cookie
    </button>
  )
}
