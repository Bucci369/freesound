'use client'

import React from 'react';
import { Download, Tag, Music, Zap, Heart } from 'lucide-react';
import WaveformPlayer from './WaveformPlayer';
import Link from 'next/link';
import { useUser } from '../../context/UserProvider';
import { SoundData } from '@/types/sound';
import { useSoundStore } from '@/store/useSoundStore';

// Die Props für unsere SampleCard-Komponente
interface SampleCardProps {
  sound: SoundData;
}

const SampleCard: React.FC<SampleCardProps> = ({ sound }) => {
  const { user } = useUser();
  const { isFavorite, addToFavorites, removeFromFavorites } = useSoundStore();

  // Stellt sicher, dass eine gültige Sound-Prop übergeben wurde
  if (!sound) {
    return null;
  }

  const downloadUrl = user 
    ? `/api/download/${sound.id}` 
    : `/api/auth/login`;

  const handleFavoriteToggle = () => {
    if (isFavorite(sound.id)) {
      removeFromFavorites(sound.id);
    } else {
      addToFavorites(sound.id);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${Math.round(bytes / 1024)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-lg transition-all duration-300 hover:border-purple-500/50 hover:shadow-purple-500/10 h-full flex flex-col">
      {/* Header Section mit Titel und Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        {/* Sound-Titel und Autor */}
        <div className="flex-grow min-w-0 sm:pr-4">
          <h3 className="text-lg sm:text-xl font-bold text-slate-100 leading-tight mb-1 h-12 overflow-hidden" title={sound.name}>
            {sound.name}
          </h3>
          <p className="text-sm text-slate-400 truncate">by {sound.username}</p>
          {/* Zusätzliche Metadaten */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
            {sound.duration && <span>{formatDuration(sound.duration)}</span>}
            {sound.filesize && <span>{formatFileSize(sound.filesize)}</span>}
            {sound.type && <span>{sound.type.toUpperCase()}</span>}
            {sound.samplerate && <span>{sound.samplerate} Hz</span>}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex-shrink-0 flex items-center gap-2">
          <button
            onClick={handleFavoriteToggle}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              isFavorite(sound.id)
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
            title={isFavorite(sound.id) ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
          >
            <Heart size={16} fill={isFavorite(sound.id) ? 'currentColor' : 'none'} />
          </button>
          
          <Link
            href={downloadUrl}
            className="inline-flex items-center justify-center gap-2 bg-purple-600/80 backdrop-blur-sm text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:bg-purple-700/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 text-sm whitespace-nowrap border border-purple-500/20"
            title={user ? "HQ-Datei herunterladen" : "Anmelden, um HQ-Datei herunterzuladen"}
          >
            <Download size={16} />
            Download
          </Link>
        </div>
      </div>

      <div className="mb-5">
        <WaveformPlayer audioUrl={sound.previews['preview-hq-mp3']} />
      </div>

      {/* BPM and Key Info */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
        {sound.ac_analysis?.ac_tempo && (
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Music size={16} className="text-purple-400" />
            <span>{Math.round(sound.ac_analysis.ac_tempo)} BPM</span>
          </div>
        )}
        {sound.ac_analysis?.ac_tonality && (
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Zap size={16} className="text-purple-400" />
            <span>{sound.ac_analysis.ac_tonality.replace('major', 'Dur').replace('minor', 'Moll')}</span>
          </div>
        )}
      </div>

      {/* Tags Sektion */}
      <div className="flex flex-wrap items-center gap-2 mt-auto">
        <Tag size={16} className="text-slate-500" />
        {sound.tags.slice(0, 5).map((tag) => ( // Zeigt maximal 5 Tags an
          <span
            key={tag}
            className="bg-slate-700 text-slate-300 text-xs font-medium px-2.5 py-1 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SampleCard;
