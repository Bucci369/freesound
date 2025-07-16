'use client'

import Link from 'next/link';
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Authentifizierungsfehler</h1>
        <p className="text-slate-300 mb-6">{message || "Ein unbekannter Fehler ist aufgetreten."}</p>
        <Link href="/" className="bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
          Zurück zur Startseite
        </Link>
      </div>
    </div>
  )
}

export default function AuthError() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  )
}
