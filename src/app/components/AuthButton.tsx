'use client'

import { useUser } from '../../context/UserProvider'
import Link from 'next/link'

export default function AuthButton() {
  const { user, loading } = useUser();

  const handleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_FREESOUND_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`;
    const authUrl = `https://freesound.org/apiv2/oauth2/authorize/?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}`;
    
    console.log('Login button clicked!');
    console.log('Client ID:', clientId);
    console.log('Redirect URI:', redirectUri);
    console.log('Auth URL:', authUrl);
    
    window.location.href = authUrl;
  };

  console.log('AuthButton render:', { user: !!user, loading });

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
    <button onClick={handleLogin} className="bg-purple-600/80 backdrop-blur-sm text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-purple-700/80 transition-all duration-200 border border-purple-500/20">
      Anmelden mit Freesound
    </button>
  )
}
