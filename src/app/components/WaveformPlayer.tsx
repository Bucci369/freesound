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
    if (waveformRef.current) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#A855F7',
        progressColor: '#6D28D9',
        height: 100,
        barWidth: 2,
      });

      wavesurfer.current.load(audioUrl);

      wavesurfer.current.on('play', () => setIsPlaying(true));
      wavesurfer.current.on('pause', () => setIsPlaying(false));

      return () => {
        if (wavesurfer.current) {
          try {
            wavesurfer.current.destroy();
          } catch (error) {
            // Ignore AbortError
          }
          wavesurfer.current = null;
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
      <button onClick={handlePlayPause} className="bg-purple-600 text-white font-semibold py-1 px-4 rounded-full mt-2 text-sm hover:bg-purple-700 transition-colors duration-200">
        {isPlaying ? 'Pause' : 'Abspielen'}
      </button>
    </div>
  );
};

export default WaveformPlayer;
