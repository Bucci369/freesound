import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SoundData, FreesoundResponse, SearchFilters, SearchState } from '@/types/sound';

interface SoundStoreState extends SearchState {
  // Search actions
  setQuery: (query: string) => void;
  setFilters: (filters: SearchFilters) => void;
  updateFilter: (
    filterName: keyof SearchFilters,
    value: string | { min: string; max: string }
  ) => void;
  resetSearch: () => void;
  
  // Fetch actions
  fetchSounds: (query: string, filters?: SearchFilters) => Promise<void>;
  loadMoreSounds: () => Promise<void>;
  
  // Favorites (persisted)
  favorites: number[];
  addToFavorites: (soundId: number) => void;
  removeFromFavorites: (soundId: number) => void;
  isFavorite: (soundId: number) => boolean;
  
  // Recent searches (persisted)
  recentSearches: string[];
  addToRecentSearches: (query: string) => void;
  clearRecentSearches: () => void;
}

const initialFilters: SearchFilters = {
  duration: { min: '', max: '' },
  tonality: '',
  tempo: { min: '', max: '' },
  sampleType: 'all',
  fileType: 'all',
  license: 'all',
  sampleRate: { min: '', max: '' },
  channels: 'all',
};

export const useSoundStore = create<SoundStoreState>()(
  persist(
    (set, get) => ({
      // Search state
      query: '',
      filters: initialFilters,
      results: [],
      isLoading: false,
      error: null,
      hasSearched: false,
      totalResults: 0,
      currentPage: 1,
      hasMore: false,
      
      // Persisted state
      favorites: [],
      recentSearches: [],

      // Search actions
      setQuery: (query: string) => {
        set({ query });
      },

      setFilters: (filters: SearchFilters) => {
        set({ filters });
      },

      updateFilter: (
        filterName: keyof SearchFilters,
        value: string | { min: string; max: string }
      ) => {
        set(state => ({
          filters: {
            ...state.filters,
            [filterName]: value
          }
        }));
      },

      resetSearch: () => {
        set({
          query: '',
          filters: initialFilters,
          results: [],
          error: null,
          hasSearched: false,
          totalResults: 0,
          currentPage: 1,
          hasMore: false
        });
      },

      // Fetch actions
      fetchSounds: async (query: string, filters?: SearchFilters) => {
        const currentFilters = filters || get().filters;
        
        set({ 
          isLoading: true, 
          error: null, 
          hasSearched: true,
          currentPage: 1,
          query 
        });

        try {
          const params = new URLSearchParams({
            query: query.trim(),
          });

          const filterParts = [];
          if (currentFilters.duration.min || currentFilters.duration.max) {
            filterParts.push(`duration:[${currentFilters.duration.min || '*'} TO ${currentFilters.duration.max || '*'}]`);
          }
          if (currentFilters.tempo.min || currentFilters.tempo.max) {
            filterParts.push(`ac_tempo:[${currentFilters.tempo.min || '*'} TO ${currentFilters.tempo.max || '*'}]`);
          }
          if (currentFilters.tonality) {
            filterParts.push(`ac_tonality:"${currentFilters.tonality}"`);
          }
          if (currentFilters.sampleType === 'loop') {
            filterParts.push(`tag:loop`);
          } else if (currentFilters.sampleType === 'oneshot') {
            filterParts.push(`tag:oneshot`);
          }
          if (currentFilters.fileType && currentFilters.fileType !== 'all') {
            filterParts.push(`type:${currentFilters.fileType}`);
          }
          if (currentFilters.license === 'cc0') {
            filterParts.push(`license:"Creative Commons 0"`);
          } else if (currentFilters.license === 'ccby') {
            filterParts.push(`license:"Attribution"`);
          }
          if (currentFilters.sampleRate.min || currentFilters.sampleRate.max) {
            filterParts.push(`samplerate:[${currentFilters.sampleRate.min || '*'} TO ${currentFilters.sampleRate.max || '*'}]`);
          }
          if (currentFilters.channels && currentFilters.channels !== 'all') {
            filterParts.push(`channels:${currentFilters.channels}`);
          }
          if (filterParts.length > 0) {
            params.append('filter', filterParts.join(' '));
          }

          const response = await fetch(`/api/search?${params.toString()}`);
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details?.detail || 'Netzwerkantwort war nicht in Ordnung.');
          }

          const data: FreesoundResponse = await response.json();
          
          set({
            results: data.results || [],
            totalResults: data.count || 0,
            hasMore: data.next !== null,
            isLoading: false
          });

          // Add to recent searches
          if (query.trim()) {
            get().addToRecentSearches(query.trim());
          }

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten';
          set({ 
            error: errorMessage, 
            isLoading: false, 
            results: [],
            totalResults: 0,
            hasMore: false
          });
        }
      },

      loadMoreSounds: async () => {
        const { query, filters, currentPage, isLoading, hasMore } = get();
        
        if (isLoading || !hasMore) return;

        set({ isLoading: true });

        try {
          const params = new URLSearchParams({
            query: query.trim(),
            page: (currentPage + 1).toString(),
          });

          const filterParts = [];
          if (filters.duration.min || filters.duration.max) {
            filterParts.push(`duration:[${filters.duration.min || '*'} TO ${filters.duration.max || '*'}]`);
          }
          if (filters.tempo.min || filters.tempo.max) {
            filterParts.push(`ac_tempo:[${filters.tempo.min || '*'} TO ${filters.tempo.max || '*'}]`);
          }
          if (filters.tonality) {
            filterParts.push(`ac_tonality:"${filters.tonality}"`);
          }
          if (filters.sampleType === 'loop') {
            filterParts.push(`tag:loop`);
          } else if (filters.sampleType === 'oneshot') {
            filterParts.push(`tag:oneshot`);
          }
          if (filters.fileType && filters.fileType !== 'all') {
            filterParts.push(`type:${filters.fileType}`);
          }
          if (filters.license === 'cc0') {
            filterParts.push(`license:"Creative Commons 0"`);
          } else if (filters.license === 'ccby') {
            filterParts.push(`license:"Attribution"`);
          }
          if (filters.sampleRate.min || filters.sampleRate.max) {
            filterParts.push(`samplerate:[${filters.sampleRate.min || '*'} TO ${filters.sampleRate.max || '*'}]`);
          }
          if (filters.channels && filters.channels !== 'all') {
            filterParts.push(`channels:${filters.channels}`);
          }
          if (filterParts.length > 0) {
            params.append('filter', filterParts.join(' '));
          }

          const response = await fetch(`/api/search?${params.toString()}`);
          
          if (!response.ok) {
            throw new Error('Fehler beim Laden weiterer Ergebnisse');
          }

          const data: FreesoundResponse = await response.json();
          
          set(state => ({
            results: [...state.results, ...(data.results || [])],
            currentPage: currentPage + 1,
            hasMore: data.next !== null,
            isLoading: false
          }));

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Fehler beim Laden weiterer Ergebnisse';
          set({ error: errorMessage, isLoading: false });
        }
      },

      // Favorites actions
      addToFavorites: (soundId: number) => {
        set(state => ({
          favorites: [...state.favorites.filter(id => id !== soundId), soundId]
        }));
      },

      removeFromFavorites: (soundId: number) => {
        set(state => ({
          favorites: state.favorites.filter(id => id !== soundId)
        }));
      },

      isFavorite: (soundId: number) => {
        return get().favorites.includes(soundId);
      },

      // Recent searches actions
      addToRecentSearches: (query: string) => {
        set(state => {
          const filtered = state.recentSearches.filter(search => search !== query);
          return {
            recentSearches: [query, ...filtered].slice(0, 10) // Keep only last 10 searches
          };
        });
      },

      clearRecentSearches: () => {
        set({ recentSearches: [] });
      },
    }),
    {
      name: 'sound-store',
      partialize: (state) => ({
        favorites: state.favorites,
        recentSearches: state.recentSearches,
      }),
    }
  )
);
