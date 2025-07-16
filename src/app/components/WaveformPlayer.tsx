'use client';

import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface WaveformPlayerProps {
  audioUrl: string;
  waveformUrl?: string;
}

const WaveformPlayer: React.FC<WaveformPlayerProps> = ({ audioUrl, waveformUrl }) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const initializeWaveSurfer = async () => {
    if (!waveformRef.current || isLoaded || isLoading) return;
    
    setIsLoading(true);
    
    try {
      if (wavesurfer.current) {
        wavesurfer.current = null;
      }

      const ws = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#A855F7',
        progressColor: '#6D28D9',
        height: 100,
        barWidth: 2,
        backend: 'MediaElement',
        mediaControls: false,
        normalize: true
      });

      ws.on('ready', () => {
        setIsLoaded(true);
        setIsLoading(false);
      });

      ws.on('loading', () => {
        // Optional: Show loading progress
      });

      ws.on('play', () => {
        setIsPlaying(true);
      });

      ws.on('pause', () => {
        setIsPlaying(false);
      });

      ws.on('error', (error) => {
        console.error('WaveSurfer error:', error);
        setIsLoading(false);
      });

      await ws.load(audioUrl);
      wavesurfer.current = ws;

    } catch (error) {
      console.error('Error initializing WaveSurfer:', error);
      setIsLoading(false);
    }
  };

  const handlePlayPause = () => {
    if (!isLoaded) {
      initializeWaveSurfer();
    } else {
      wavesurfer.current?.playPause();
    }
  };

  useEffect(() => {
    return () => {
      if (wavesurfer.current) {
        try {
          wavesurfer.current.pause();
        } catch (error) {
          // Ignore
        }
      }
    };
  }, []);

  return (
    <div>
      <div ref={waveformRef} className="min-h-[100px] flex items-center justify-center relative">
        {!isLoaded && !isLoading && waveformUrl && (
          <img 
            src={waveformUrl} 
            alt="Waveform" 
            className="w-full h-[100px] object-cover opacity-50"
          />
        )}
        {!isLoaded && !isLoading && !waveformUrl && (
          <div className="text-slate-400 text-sm">Klicke zum Laden</div>
        )}
        {isLoading && (
          <div className="text-purple-400 text-sm">Lädt...</div>
        )}
      </div>
      <button 
        onClick={handlePlayPause} 
        disabled={isLoading}
        className="bg-purple-600/80 backdrop-blur-sm text-white font-semibold py-1 px-4 rounded-full mt-2 text-sm hover:bg-purple-700/80 transition-all duration-200 border border-purple-500/20 disabled:bg-slate-600 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Lädt...' : isPlaying ? 'Pause' : 'Abspielen'}
      </button>
    </div>
  );
};

export default WaveformPlayer;
