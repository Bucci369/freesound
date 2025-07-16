'use client';

import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

interface FilterSidebarProps {
  filters: {
    duration: { min: string; max: string };
    tonality: string;
    tempo: { min: string; max: string };
    sampleType: string;
    fileType: string;
    license: string;
    sampleRate: { min: string; max: string };
    channels: string;
  };
  onFilterChange: (filterName: string, value: any) => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, onFilterChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const [category, subCategory] = name.split('.');
    
    if (category === 'duration' || category === 'tempo' || category === 'sampleRate') {
      onFilterChange(category, { ...filters[category], [subCategory]: value });
    } else {
      onFilterChange(name, value);
    }
  };

  return (
    <aside className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
        <SlidersHorizontal size={20} />
        Filter & Sortierung
      </h3>
      <div className="space-y-6">
        {/* Duration Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Dauer (s)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              name="duration.min"
              value={filters.duration.min}
              onChange={handleInputChange}
              placeholder="Min"
              className="w-full bg-slate-700 text-slate-100 placeholder-slate-400 border border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <span className="text-slate-400">-</span>
            <input
              type="number"
              name="duration.max"
              value={filters.duration.max}
              onChange={handleInputChange}
              placeholder="Max"
              className="w-full bg-slate-700 text-slate-100 placeholder-slate-400 border border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Tempo (BPM) Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Tempo (BPM)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              name="tempo.min"
              value={filters.tempo.min}
              onChange={handleInputChange}
              placeholder="Min"
              className="w-full bg-slate-700 text-slate-100 placeholder-slate-400 border border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <span className="text-slate-400">-</span>
            <input
              type="number"
              name="tempo.max"
              value={filters.tempo.max}
              onChange={handleInputChange}
              placeholder="Max"
              className="w-full bg-slate-700 text-slate-100 placeholder-slate-400 border border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Sample Type Filter */}
        <div>
          <label htmlFor="sampleType" className="block text-sm font-medium text-slate-300 mb-2">Sample-Typ</label>
          <select
            id="sampleType"
            name="sampleType"
            value={filters.sampleType}
            onChange={handleInputChange}
            className="w-full bg-slate-700 text-slate-100 border border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Alle</option>
            <option value="loop">Loop</option>
            <option value="oneshot">One-Shot</option>
          </select>
        </div>

        {/* File Type Filter */}
        <div>
          <label htmlFor="fileType" className="block text-sm font-medium text-slate-300 mb-2">Dateiformat</label>
          <select
            id="fileType"
            name="fileType"
            value={filters.fileType}
            onChange={handleInputChange}
            className="w-full bg-slate-700 text-slate-100 border border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Alle</option>
            <option value="wav">WAV</option>
            <option value="mp3">MP3</option>
            <option value="ogg">OGG</option>
            <option value="flac">FLAC</option>
            <option value="aiff">AIFF</option>
          </select>
        </div>

        {/* License Filter */}
        <div>
          <label htmlFor="license" className="block text-sm font-medium text-slate-300 mb-2">Lizenz</label>
          <select
            id="license"
            name="license"
            value={filters.license}
            onChange={handleInputChange}
            className="w-full bg-slate-700 text-slate-100 border border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Alle</option>
            <option value="cc0">CC0 (Gemeinfrei)</option>
            <option value="ccby">CC BY (Namensnennung)</option>
          </select>
        </div>

        {/* Sample Rate Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Sample Rate (Hz)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              name="sampleRate.min"
              value={filters.sampleRate.min}
              onChange={handleInputChange}
              placeholder="Min"
              className="w-full bg-slate-700 text-slate-100 placeholder-slate-400 border border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <span className="text-slate-400">-</span>
            <input
              type="number"
              name="sampleRate.max"
              value={filters.sampleRate.max}
              onChange={handleInputChange}
              placeholder="Max"
              className="w-full bg-slate-700 text-slate-100 placeholder-slate-400 border border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Channels Filter */}
        <div>
          <label htmlFor="channels" className="block text-sm font-medium text-slate-300 mb-2">Kanäle</label>
          <select
            id="channels"
            name="channels"
            value={filters.channels}
            onChange={handleInputChange}
            className="w-full bg-slate-700 text-slate-100 border border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Alle</option>
            <option value="1">Mono</option>
            <option value="2">Stereo</option>
          </select>
        </div>

        {/* Tonality (Key) Filter */}
        <div>
          <label htmlFor="tonality" className="block text-sm font-medium text-slate-300 mb-2">Tonart</label>
          <select
            id="tonality"
            name="tonality"
            value={filters.tonality}
            onChange={handleInputChange}
            className="w-full bg-slate-700 text-slate-100 border border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Alle</option>
            {['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'].flatMap(note =>
              ['Dur', 'Moll'].map(scale => (
                <option key={`${note}-${scale}`} value={`${note} ${scale.toLowerCase()}`}>{`${note} ${scale}`}</option>
              ))
            )}
          </select>
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
