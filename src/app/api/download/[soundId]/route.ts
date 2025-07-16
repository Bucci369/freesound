import { createClient } from '@/lib/supabase/server';
import { type NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { soundId: string } }
) {
  const supabase = await createClient();
  if (!supabase) {
    return new Response('Internal server error: Supabase client not initialized.', { status: 500 });
  }
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Get the user's Freesound access token from our database
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('access_token')
    .eq('id', user.id)
    .single();

  if (profileError || !profile?.access_token) {
    console.error('Error fetching profile or token:', profileError);
    return new Response('Could not retrieve Freesound token.', { status: 500 });
  }

  const soundId = params.soundId;
  const accessToken = profile.access_token;

  // Fetch the original download URL from Freesound
  const freesoundApiUrl = `https://freesound.org/apiv2/sounds/${soundId}/`;
  
  try {
    const apiResponse = await fetch(freesoundApiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!apiResponse.ok) {
      // Here you could add logic to refresh the token if it's expired
      const errorData = await apiResponse.json();
      console.error('Freesound API error:', errorData);
      return new Response('Failed to fetch sound info from Freesound.', { status: apiResponse.status });
    }

    const soundData = await apiResponse.json();
    const originalDownloadUrl = soundData.download;
    const originalFilename = soundData.name + '.' + soundData.type;

    // Fetch the actual sound file
    const soundFileResponse = await fetch(originalDownloadUrl, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!soundFileResponse.ok) {
        return new Response('Failed to download sound file.', { status: soundFileResponse.status });
    }

    // Stream the file back to the user
    const headers = new Headers({
      'Content-Disposition': `attachment; filename="${originalFilename}"`,
      'Content-Type': soundFileResponse.headers.get('Content-Type') || 'application/octet-stream',
      'Content-Length': soundFileResponse.headers.get('Content-Length') || '',
    });

    return new Response(soundFileResponse.body, { headers });

  } catch (error) {
    console.error('Download route error:', error);
    return new Response('An internal error occurred.', { status: 500 });
  }
}
