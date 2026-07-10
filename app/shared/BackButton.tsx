'use client'
import React from 'react'
import { useRouter } from 'next/navigation'

// Buton „Înapoi" — client, ca să poată folosi istoricul browserului.
interface Props {
  className?: string
  children: React.ReactNode
}

const BackButton: React.FC<Props> = ({ className, children }) => {
  const router = useRouter()
  return (
    <button type="button" onClick={() => router.back()} className={className}>
      {children}
    </button>
  )
}

export default BackButton
