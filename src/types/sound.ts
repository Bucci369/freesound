// Zentrale TypeScript-Typdefinitionen für die Freesound API

export interface SoundPreview {
  'preview-hq-mp3': string;
  'preview-hq-ogg': string;
  'preview-lq-mp3': string;
  'preview-lq-ogg': string;
}

export interface SoundImages {
  waveform_m: string;
  waveform_l: string;
  spectral_m: string;
  spectral_l: string;
}

export interface SoundAnalysis {
  ac_tempo?: number;
  ac_tonality?: string;
  ac_loudness?: number;
  ac_dynamic_range?: number;
  ac_zero_crossing_rate?: number;
  ac_spectral_centroid?: number;
}

export interface SoundData {
  id: number;
  name: string;
  username: string;
  description: string;
  tags: string[];
  previews: SoundPreview;
  images: SoundImages;
  duration: number;
  filesize: number;
  type: string;
  channels: number;
  samplerate: number;
  bitdepth: number;
  bitrate: number;
  license: string;
  download: string;
  bookmark: string;
  ac_analysis?: SoundAnalysis;
  created: string;
  num_downloads: number;
  avg_rating: number;
  num_ratings: number;
}

export interface FreesoundResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SoundData[];
}

export interface FreesoundError {
  error: string;
  details?: {
    detail: string;
  };
}

export interface SearchFilters {
  duration: {
    min: string;
    max: string;
  };
  tonality: string;
  tempo: {
    min: string;
    max: string;
  };
}

export interface SearchState {
  query: string;
  filters: SearchFilters;
  results: SoundData[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  totalResults: number;
  currentPage: number;
  hasMore: boolean;
}