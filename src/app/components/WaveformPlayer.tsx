'use client';

import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface WaveformPlayerProps {
  audioUrl: string;
}

const WaveformPlayer: React.FC<WaveformPlayerProps> = ({ audioUrl }) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let cleanup = false;
    
    if (waveformRef.current) {
      // Bereinige vorherige Instanz OHNE destroy
      if (wavesurfer.current) {
        wavesurfer.current = null;
      }

      const ws = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#A855F7',
        progressColor: '#6D28D9',
        height: 100,
        barWidth: 2,
      });

      ws.load(audioUrl);

      ws.on('play', () => {
        if (!cleanup) setIsPlaying(true);
      });
      ws.on('pause', () => {
        if (!cleanup) setIsPlaying(false);
      });

      wavesurfer.current = ws;

      return () => {
        cleanup = true;
        // Nur pause, KEIN destroy
        if (ws) {
          try {
            ws.pause();
          } catch (error) {
            // Ignore
          }
        }
      };
    }
  }, [audioUrl]);

  const handlePlayPause = () => {
    wavesurfer.current?.playPause();
  };

  return (
    <div>
      <div ref={waveformRef} />
      <button onClick={handlePlayPause} className="bg-purple-600/80 backdrop-blur-sm text-white font-semibold py-1 px-4 rounded-full mt-2 text-sm hover:bg-purple-700/80 transition-all duration-200 border border-purple-500/20">
        {isPlaying ? 'Pause' : 'Abspielen'}
      </button>
    </div>
  );
};

export default WaveformPlayer;
