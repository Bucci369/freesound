import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ soundId: string }> }
) {
  console.log('Download API route called');
  
  // Skip authentication - use API key instead
  const apiKey = process.env.FREESOUND_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { soundId } = await params;

  console.log('Sound ID:', soundId);
  console.log('API key available:', !!apiKey);

  // Fetch the original download URL from Freesound using API key
  const freesoundApiUrl = `https://freesound.org/apiv2/sounds/${soundId}/?token=${apiKey}`;
  
  try {
    const apiResponse = await fetch(freesoundApiUrl);

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
      console.error('API Key (first 20 chars):', apiKey.substring(0, 20) + '...');
      
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
    const soundFileResponse = await fetch(`${originalDownloadUrl}?token=${apiKey}`);

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
