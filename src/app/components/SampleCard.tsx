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

  const handleDownloadClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Download button clicked for sound:', sound.id);
    console.log('User:', user);
    
    if (!user) {
      console.log('No user, redirecting to login');
      window.location.href = '/api/auth/login';
      return;
    }
    
    console.log('Starting download for sound:', sound.id);
    
    // Disable button during download
    const button = e.currentTarget;
    button.disabled = true;
    button.textContent = 'Downloading...';
    
    try {
      const response = await fetch(`/api/download/${sound.id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/octet-stream'
        }
      });
      
      console.log('Download response status:', response.status);
      console.log('Download response headers:', response.headers);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('Download error:', errorData);
        
        if (response.status === 401) {
          alert('Please login with Freesound first to download files.');
          window.location.href = '/api/auth/login';
          return;
        }
        
        alert(`Download failed: ${errorData.error || 'Unknown error'}`);
        return;
      }
      
      // Download successful, handle as blob
      const blob = await response.blob();
      console.log('Blob created:', blob.size, 'bytes');
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sound.name}.${sound.type}`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
      console.log('Download completed successfully');
      
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed. Please try again.');
    } finally {
      // Re-enable button
      button.disabled = false;
      button.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 0 1 2-2h6l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>Download';
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
    <div 
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-lg transition-all duration-300 hover:border-purple-500/50 hover:shadow-purple-500/10 h-full flex flex-col"
    >
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
          
          
          {user ? (
            <a
              href={`/api/download/${sound.id}`}
              download={`${sound.name}.${sound.type}`}
              className="inline-flex items-center justify-center gap-2 bg-purple-600/80 backdrop-blur-sm text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:bg-purple-700/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 text-sm whitespace-nowrap border border-purple-500/20"
              title="HQ-Datei herunterladen"
              onClick={(e) => {
                console.log('Download link clicked for sound:', sound.id);
                // Let the browser handle the download naturally
              }}
            >
              <Download size={16} />
              Download
            </a>
          ) : (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = '/api/auth/login';
              }}
              className="inline-flex items-center justify-center gap-2 bg-purple-600/80 backdrop-blur-sm text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:bg-purple-700/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 text-sm whitespace-nowrap border border-purple-500/20"
              title="Anmelden, um HQ-Datei herunterzuladen"
              type="button"
            >
              <Download size={16} />
              Download
            </button>
          )}
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
