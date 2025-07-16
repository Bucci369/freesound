'use client'

import { useUser } from '../../context/UserProvider'
import Link from 'next/link'

export default function AuthButton() {
  const { user, loading } = useUser();

  if (loading) {
    return <div className="w-[200px] h-[40px] bg-slate-700 rounded-lg animate-pulse"></div>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-300">
          Willkommen, {user.user_metadata.username || user.email}
        </span>
        <Link href="/api/auth/logout" className="bg-red-600/80 backdrop-blur-sm text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-red-700/80 transition-all duration-200 border border-red-500/20">
          Abmelden
        </Link>
      </div>
    )
  }

  return (
    <Link href="/api/auth/login" className="bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-purple-700 transition-colors duration-200">
      Anmelden mit Freesound
    </Link>
  )
}
