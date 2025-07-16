"use client";

import React, { useEffect, useCallback } from 'react';
import { LoaderCircle } from 'lucide-react';
import Image from 'next/image';
import SampleCard from './components/SampleCard';
import FilterSidebar from './components/FilterSidebar';
import AuthButton from './components/AuthButton';
import SearchBar from './components/SearchBar';
import { useSoundStore } from '@/store/useSoundStore';

export default function HomePage() {
  const {
    query,
    results,
    isLoading,
    error,
    hasSearched,
    totalResults,
    filters,
    hasMore,
    updateFilter,
    fetchSounds,
    loadMoreSounds
  } = useSoundStore();

  // Trigger initial search when filters change
  useEffect(() => {
    const hasActiveFilters = 
      filters.duration.min || filters.duration.max ||
      filters.tempo.min || filters.tempo.max ||
      filters.tonality ||
      (filters.sampleType && filters.sampleType !== 'all') ||
      (filters.fileType && filters.fileType !== 'all') ||
      (filters.license && filters.license !== 'all') ||
      filters.sampleRate.min || filters.sampleRate.max ||
      (filters.channels && filters.channels !== 'all');
    
    if (query.trim() || hasActiveFilters) {
      const debounceTimeout = setTimeout(() => {
        fetchSounds(query, filters);
      }, 500);

      return () => clearTimeout(debounceTimeout);
    }
  }, [filters, query, fetchSounds]);

  const handleFilterChange = (
    filterName: string,
    value: string | { min: string; max: string }
  ) => {
    updateFilter(filterName as keyof typeof filters, value);
  };

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      loadMoreSounds();
    }
  }, [hasMore, isLoading, loadMoreSounds]);

  // Optional: Auto-load when user scrolls near bottom
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000 // 1000px before bottom
      ) {
        handleLoadMore();
      }
    };

    // Only add scroll listener if there are results and more to load
    if (results.length > 0 && hasMore && !isLoading) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [results.length, hasMore, isLoading, handleLoadMore]);


  return (
    <main className="min-h-screen bg-slate-900 text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section with Studio Photo */}
        <section className="mb-8 rounded-2xl overflow-hidden">
          <div className="relative">
            <picture>
              <source srcSet="/musicstudio.webp" type="image/webp" />
              <Image 
                src="/musicstudio.jpg" 
                alt="Music Studio" 
                width={1920}
                height={600}
                className="w-full h-[300px] sm:h-[400px] lg:h-[500px] object-cover object-[50%_55%]"
                priority
              />
            </picture>
          </div>
        </section>

        {/* Content below photo */}
        <div className="text-center mb-8 flex items-center justify-between">
          <div></div> {/* Spacer */}
          <div>
            <p className="text-slate-400 text-lg sm:text-xl font-medium mb-2">Entdecke und lade einzigartige Sounds</p>
            <p className="text-slate-500 text-sm">Professionelle Audio-Samples für deine Musikproduktion</p>
          </div>
          <div className="flex flex-col items-center">
            <AuthButton />
            <p className="text-xs text-slate-500 mt-2">Für Downloads in höchster Qualität anmelden.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Linke Spalte: Filter */}
          <div className="lg:col-span-1">
            <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />
          </div>

          {/* Rechte Spalte: Suche und Ergebnisse */}
          <div className="lg:col-span-3 space-y-8">
            {/* Suchleiste */}
            <SearchBar />

            {/* Ergebnis-Sektion */}
            <div>
              {isLoading && results.length === 0 ? (
                <div className="flex justify-center items-center mt-20">
                  <LoaderCircle size={48} className="animate-spin text-purple-500" />
                </div>
              ) : error ? (
                <p className="text-center text-red-400 bg-red-900/20 p-4 rounded-lg">{error}</p>
              ) : hasSearched && results.length === 0 ? (
                <p className="text-center text-slate-400">Keine Ergebnisse für &quot;{query}&quot; mit den gewählten Filtern gefunden.</p>
              ) : (
                <>
                  {hasSearched && (
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-slate-400">{totalResults} Sounds gefunden</p>
                      {hasMore && (
                        <button
                          onClick={handleLoadMore}
                          disabled={isLoading}
                          className="bg-purple-600/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-purple-700/80 transition-all disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center gap-2 border border-purple-500/20"
                        >
                          {isLoading ? (
                            <>
                              <LoaderCircle className="animate-spin" size={16} />
                              Lädt...
                            </>
                          ) : (
                            'Mehr laden'
                          )}
                        </button>
                      )}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {results.map((sound) => (
                      <SampleCard key={sound.id} sound={sound} />
                    ))}
                  </div>
                  
                  {/* Mehr laden Button unten */}
                  {hasMore && (
                    <div className="flex justify-center mt-8">
                      <button
                        onClick={handleLoadMore}
                        disabled={isLoading}
                        className="bg-purple-600/80 backdrop-blur-sm text-white font-semibold py-3 px-8 rounded-full shadow-md hover:bg-purple-700/80 transition-all disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center gap-2 border border-purple-500/20"
                      >
                        {isLoading ? (
                          <>
                            <LoaderCircle className="animate-spin" size={20} />
                            Lädt weitere Sounds...
                          </>
                        ) : (
                          'Mehr Sounds laden'
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
