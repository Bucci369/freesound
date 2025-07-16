import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ soundId: string }> }
) {
  console.log('Download API route called');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  console.log('User:', user ? 'authenticated' : 'not authenticated');

  if (!user) {
    console.log('No user found, returning 401');
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Get the user's Freesound access token from our database
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('access_token')
    .eq('id', user.id)
    .single();

  if (profileError || !profile?.access_token) {
    console.error('Error fetching profile or token:', profileError);
    console.error('Profile data:', profile);
    return new Response(JSON.stringify({ 
      error: 'No Freesound access token found. Please login with Freesound first.',
      details: profileError 
    }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { soundId } = await params;
  const accessToken = profile.access_token;

  console.log('Sound ID:', soundId);
  console.log('Access token available:', !!accessToken);

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
      let errorData;
      try {
        errorData = await apiResponse.json();
      } catch (e) {
        errorData = { detail: `HTTP ${apiResponse.status}: ${apiResponse.statusText}` };
      }
      console.error('Freesound API error:', errorData);
      console.error('Status:', apiResponse.status);
      console.error('Sound ID:', soundId);
      console.error('Access Token (first 20 chars):', accessToken.substring(0, 20) + '...');
      
      return new Response(JSON.stringify({
        error: 'Failed to fetch sound info from Freesound',
        freesoundError: errorData,
        status: apiResponse.status
      }), { 
        status: apiResponse.status,
        headers: { 'Content-Type': 'application/json' }
      });
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
        console.error('Failed to download sound file:', soundFileResponse.status);
        console.error('Download URL:', originalDownloadUrl);
        
        return new Response(JSON.stringify({
          error: 'Failed to download sound file from Freesound',
          status: soundFileResponse.status,
          downloadUrl: originalDownloadUrl
        }), { 
          status: soundFileResponse.status,
          headers: { 'Content-Type': 'application/json' }
        });
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
