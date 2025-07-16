'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSoundStore } from '@/store/useSoundStore';
import { Search, X, Clock, LoaderCircle } from 'lucide-react';

interface SearchBarProps {
  autoFocus?: boolean;
  placeholder?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  autoFocus = false,
  placeholder = "z.B. 'ambient pad', 'drum loop', 'explosion'...",
  className = ''
}) => {
  const [localQuery, setLocalQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const {
    query,
    isLoading,
    recentSearches,
    setQuery,
    fetchSounds,
    filters,
    clearRecentSearches
  } = useSoundStore();

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      setQuery(localQuery.trim());
      fetchSounds(localQuery.trim(), filters);
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalQuery(value);
    setQuery(value);
    
    // Show suggestions when typing
    if (value.length > 0 && recentSearches.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setLocalQuery(suggestion);
    setQuery(suggestion);
    fetchSounds(suggestion, filters);
    setShowSuggestions(false);
  };

  const handleClearInput = () => {
    setLocalQuery('');
    setQuery('');
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInputFocus = () => {
    if (recentSearches.length > 0 && !localQuery) {
      setShowSuggestions(true);
    }
  };

  const filteredSuggestions = recentSearches.filter(search =>
    search.toLowerCase().includes(localQuery.toLowerCase())
  );

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            ref={inputRef}
            type="text"
            value={localQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-full py-3 pl-12 pr-12 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
          />
          {localQuery && (
            <button
              type="button"
              onClick={handleClearInput}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !localQuery.trim()}
          className="flex-shrink-0 bg-purple-600 text-white font-semibold py-3 px-8 rounded-full shadow-md hover:bg-purple-700 transition-colors duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed min-w-[100px] flex items-center justify-center"
        >
          {isLoading ? (
            <LoaderCircle className="animate-spin" size={20} />
          ) : (
            'Suchen'
          )}
        </button>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
        >
          {filteredSuggestions.length > 0 ? (
            <>
              <div className="px-4 py-2 text-sm text-slate-400 border-b border-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock size={16} />
                  Kürzlich gesucht
                </span>
                <button
                  onClick={clearRecentSearches}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Löschen
                </button>
              </div>
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-3 text-left text-slate-100 hover:bg-slate-700 transition-colors flex items-center gap-2"
                >
                  <Search size={16} className="text-slate-500" />
                  {suggestion}
                </button>
              ))}
            </>
          ) : (
            <div className="px-4 py-3 text-sm text-slate-400">
              Keine kürzlichen Suchen
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
