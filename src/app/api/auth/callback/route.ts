import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { type User } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  const redirectToError = (message: string) => {
    return NextResponse.redirect(`${origin}/auth/auth-error?message=${encodeURIComponent(message)}`);
  };

  if (!code) {
    return redirectToError('Kein Autorisierungscode von Freesound erhalten.');
  }

  try {
    const clientId = process.env.NEXT_PUBLIC_FREESOUND_CLIENT_ID;
    const clientSecret = process.env.FREESOUND_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`;

    // 1. Exchange code for an access token
    const tokenResponse = await fetch('https://freesound.org/apiv2/oauth2/access_token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) {
      return redirectToError(`Fehler beim Austausch des Tokens: ${tokenData.error_description || 'Unbekannter Fehler'}`);
    }

    const { access_token, refresh_token } = tokenData;

    // 2. Get user info from Freesound
    const userResponse = await fetch('https://freesound.org/apiv2/me/', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const freesoundUser = await userResponse.json();
    if (!userResponse.ok) {
      return redirectToError('Fehler beim Abrufen der Freesound-Benutzerdaten.');
    }

    // 3. Find or create user in Supabase
    const supabase = await createClient();
    let user: User | null = null;

    // Check if user exists by email by listing all users and filtering
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;
    user = users.find(u => u.email === freesoundUser.email) || null;


    // If user does not exist, create them
    if (!user) {
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: freesoundUser.email,
        email_confirm: true,
        user_metadata: {
          username: freesoundUser.username,
          freesound_id: freesoundUser.unique_id,
          avatar_url: freesoundUser.avatar.large,
        },
      });
      if (createError) throw createError;
      user = newUser.user;
    }

    if (!user) {
      return redirectToError('Benutzer konnte in Supabase weder gefunden noch erstellt werden.');
    }

    // 4. Store tokens securely in the 'profiles' table
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: user.id,
      username: freesoundUser.username,
      freesound_id: freesoundUser.unique_id,
      access_token: access_token,
      refresh_token: refresh_token,
    }, { onConflict: 'id' });

    if (profileError) throw profileError;

    // 5. Generate Magic Link for session creation
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: user.email!,
      options: { redirectTo: origin },
    });

    if (linkError) throw linkError;

    return NextResponse.redirect(linkData.properties.action_link);

  } catch (error) {
    console.error('Callback route error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ein schwerwiegender Serverfehler ist aufgetreten.';
    return redirectToError(errorMessage);
  }
}
