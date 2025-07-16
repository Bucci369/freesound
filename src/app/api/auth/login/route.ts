import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.NEXT_PUBLIC_FREESOUND_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`;
  
  if (!clientId) {
    return NextResponse.json({ error: 'Freesound client ID is not configured' }, { status: 500 });
  }

  const authUrl = `https://freesound.org/apiv2/oauth2/authorize/?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}`;
  
  return NextResponse.redirect(authUrl);
}
