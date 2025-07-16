import { NextRequest, NextResponse } from 'next/server';
import { FreesoundResponse, FreesoundError } from '@/types/sound';

interface SearchParams {
  query: string;
  filter?: string;
  page?: string;
}

interface ApiErrorResponse {
  error: string;
  details?: FreesoundError['details'];
}

export async function GET(request: NextRequest): Promise<NextResponse<FreesoundResponse | ApiErrorResponse>> {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const filter = searchParams.get('filter');
  const page = searchParams.get('page') || '1';

  // Validate required parameters
  if (!query || query.trim() === '') {
    return NextResponse.json(
      { error: 'Query parameter "query" is required and cannot be empty' } as ApiErrorResponse,
      { status: 400 }
    );
  }

  // Validate page parameter
  const pageNumber = parseInt(page, 10);
  if (isNaN(pageNumber) || pageNumber < 1) {
    return NextResponse.json(
      { error: 'Page parameter must be a positive integer' } as ApiErrorResponse,
      { status: 400 }
    );
  }

  const apiKey = process.env.FREESOUND_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Freesound API key is not configured' } as ApiErrorResponse,
      { status: 500 }
    );
  }

  // Build API URL with comprehensive fields
  const fields = [
    'id', 'name', 'username', 'description', 'tags', 'previews', 'images',
    'duration', 'filesize', 'type', 'channels', 'samplerate', 'bitdepth',
    'bitrate', 'license', 'download', 'bookmark', 'created', 'num_downloads',
    'avg_rating', 'num_ratings', 'ac_tempo', 'ac_tonality', 'ac_loudness',
    'ac_dynamic_range', 'ac_zero_crossing_rate', 'ac_spectral_centroid'
  ].join(',');

  let url = `https://freesound.org/apiv2/search/text/?query=${encodeURIComponent(query)}&page=${pageNumber}&page_size=150&fields=${fields}`;

  if (filter && filter.trim() !== '') {
    url += `&filter=${encodeURIComponent(filter)}`;
  }

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorData: FreesoundError['details'];
      
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: `HTTP ${response.status}: ${response.statusText}` };
      }

      return NextResponse.json(
        { 
          error: 'Freesound API error', 
          details: errorData 
        } as ApiErrorResponse,
        { status: response.status }
      );
    }

    const data: FreesoundResponse = await response.json();
    
    // Validate response structure
    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Invalid response format from Freesound API' } as ApiErrorResponse,
        { status: 502 }
      );
    }

    // Ensure required fields exist
    const validatedData: FreesoundResponse = {
      count: data.count || 0,
      next: data.next || null,
      previous: data.previous || null,
      results: Array.isArray(data.results) ? data.results : [],
    };

    return NextResponse.json(validatedData);
    
  } catch (error) {
    console.error('Search API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: 'Internal Server Error', details: { detail: errorMessage } } as ApiErrorResponse,
      { status: 500 }
    );
  }
}
