'use client';

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Play, Pause, Volume2, RotateCcw } from 'lucide-react';
import { SoundData } from '@/types/sound';

interface PlayerSlot {
  id: number;
  sound: SoundData | null;
  audio: HTMLAudioElement | null;
  isPlaying: boolean;
  volume: number;
  loop: boolean;
}

interface SamplePlayerProps {
  onSoundAdded?: (sound: SoundData, slotId: number) => void;
}

export interface SamplePlayerRef {
  loadSoundToSlot: (sound: SoundData, slotId: number) => void;
}

const SamplePlayer = forwardRef<SamplePlayerRef, SamplePlayerProps>(({ onSoundAdded }, ref) => {
  const audioRefsMap = useRef<Map<number, HTMLAudioElement>>(new Map());
  
  const [slots, setSlots] = useState<PlayerSlot[]>(() => 
    Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      sound: null,
      audio: null,
      isPlaying: false,
      volume: 0.7,
      loop: false
    }))
  );
  
  const [draggedOver, setDraggedOver] = useState<number | null>(null);
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [allPlaying, setAllPlaying] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup all audio properly
      audioRefsMap.current.forEach(audio => {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
      });
      audioRefsMap.current.clear();
    };
  }, []);

  // Slot colors like in the image
  const slotColors = [
    'bg-green-400', 'bg-yellow-400', 'bg-blue-400', 'bg-purple-400',
    'bg-orange-400', 'bg-yellow-300', 'bg-gray-400', 'bg-pink-400'
  ];

  const slotLabels = ['LEADS', 'FX', 'KEYS', 'BASS', 'CHORDS', 'DRUMS', 'PERC', 'VOCAL'];

  const loadSoundToSlot = (sound: SoundData, slotId: number) => {
    console.log('Loading sound to slot:', slotId, sound.name);
    console.log('Audio URL:', sound.previews['preview-hq-mp3']);
    
    // Cleanup existing audio for this slot
    const existingAudio = audioRefsMap.current.get(slotId);
    if (existingAudio) {
      existingAudio.pause();
      existingAudio.removeAttribute('src');
      existingAudio.load();
      audioRefsMap.current.delete(slotId);
    }
    
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.crossOrigin = 'anonymous';
    
    // Store reference for cleanup
    audioRefsMap.current.set(slotId, audio);
    
    const handleLoadedMetadata = () => {
      console.log('Audio loaded for slot', slotId);
    };
    
    const handleError = (e: Event) => {
      console.error('Audio error for slot', slotId, e);
    };
    
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('error', handleError);
    
    // Set src after event listeners
    audio.src = sound.previews['preview-hq-mp3'];
    
    setSlots(prev => prev.map(slot => 
      slot.id === slotId 
        ? { ...slot, sound, audio, isPlaying: false }
        : slot
    ));
    
    onSoundAdded?.(sound, slotId);
  };

  const handleDragOver = (e: React.DragEvent, slotId: number) => {
    e.preventDefault();
    setDraggedOver(slotId);
  };

  const handleDragLeave = () => {
    setDraggedOver(null);
  };

  const handleDrop = (e: React.DragEvent, slotId: number) => {
    e.preventDefault();
    setDraggedOver(null);
    
    try {
      const soundData = e.dataTransfer.getData('sound');
      if (soundData) {
        const sound: SoundData = JSON.parse(soundData);
        loadSoundToSlot(sound, slotId);
      }
    } catch (error) {
      console.error('Error loading sound:', error);
    }
  };

  const togglePlay = (slotId: number) => {
    console.log('Toggle play for slot:', slotId);
    
    setSlots(prev => prev.map(slot => {
      if (slot.id === slotId && slot.audio) {
        const newIsPlaying = !slot.isPlaying;
        console.log('Slot', slotId, 'isPlaying:', newIsPlaying);
        
        if (newIsPlaying) {
          slot.audio.volume = slot.volume * masterVolume;
          slot.audio.loop = slot.loop;
          slot.audio.currentTime = 0; // Reset to beginning
          
          slot.audio.play().then(() => {
            console.log('Audio started playing for slot', slotId);
          }).catch(err => {
            console.error('Error playing audio for slot', slotId, err);
          });
        } else {
          slot.audio.pause();
          console.log('Audio paused for slot', slotId);
        }
        
        return { ...slot, isPlaying: newIsPlaying };
      }
      return slot;
    }));
  };

  const clearSlot = (slotId: number) => {
    // Clean up audio properly
    const audio = audioRefsMap.current.get(slotId);
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      audioRefsMap.current.delete(slotId);
    }
    
    setSlots(prev => prev.map(slot => {
      if (slot.id === slotId) {
        return { ...slot, sound: null, audio: null, isPlaying: false };
      }
      return slot;
    }));
  };

  const updateVolume = (slotId: number, volume: number) => {
    setSlots(prev => prev.map(slot => {
      if (slot.id === slotId) {
        if (slot.audio) {
          slot.audio.volume = volume * masterVolume;
        }
        return { ...slot, volume };
      }
      return slot;
    }));
  };

  const playAll = () => {
    setAllPlaying(true);
    slots.forEach(slot => {
      if (slot.audio && slot.sound) {
        slot.audio.volume = slot.volume * masterVolume;
        slot.audio.loop = slot.loop;
        slot.audio.currentTime = 0;
        slot.audio.play();
      }
    });
    setSlots(prev => prev.map(slot => ({ ...slot, isPlaying: slot.sound ? true : false })));
  };

  const stopAll = () => {
    setAllPlaying(false);
    slots.forEach(slot => {
      if (slot.audio) {
        slot.audio.pause();
        slot.audio.currentTime = 0;
      }
    });
    setSlots(prev => prev.map(slot => ({ ...slot, isPlaying: false })));
  };

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    loadSoundToSlot
  }));

  // Update master volume
  useEffect(() => {
    slots.forEach(slot => {
      if (slot.audio) {
        slot.audio.volume = slot.volume * masterVolume;
      }
    });
  }, [masterVolume]);

  return (
    <div className="bg-slate-800 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Sample Player</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={playAll}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Play size={16} />
            Play All
          </button>
          <button
            onClick={stopAll}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Pause size={16} />
            Stop All
          </button>
        </div>
      </div>

      {/* Master Volume */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Volume2 size={16} className="text-white" />
          <span className="text-white text-sm">Master Volume</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={masterVolume}
          onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Slots Grid */}
      <div className="grid grid-cols-1 gap-3">
        {slots.map((slot, index) => (
          <div
            key={slot.id}
            className={`relative rounded-lg p-4 min-h-[80px] border-2 transition-all ${
              draggedOver === slot.id 
                ? 'border-purple-400 bg-purple-900/20' 
                : 'border-slate-600'
            }`}
            onDragOver={(e) => handleDragOver(e, slot.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, slot.id)}
          >
            <div className="flex items-center gap-3 h-full">
              {/* Slot Color & Label */}
              <div className={`w-16 h-16 rounded-lg ${slotColors[index]} flex items-center justify-center`}>
                <span className="text-black font-bold text-xs">{slotLabels[index]}</span>
              </div>

              {/* Content */}
              <div className="flex-1">
                {slot.sound ? (
                  <div>
                    <h3 className="text-white font-semibold text-sm truncate mb-1">
                      {slot.sound.name}
                    </h3>
                    <p className="text-slate-400 text-xs truncate mb-2">
                      by {slot.sound.username}
                    </p>
                    
                    {/* Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => togglePlay(slot.id)}
                        className={`p-2 rounded ${
                          slot.isPlaying 
                            ? 'bg-orange-600 hover:bg-orange-700' 
                            : 'bg-green-600 hover:bg-green-700'
                        } text-white`}
                      >
                        {slot.isPlaying ? <Pause size={14} /> : <Play size={14} />}
                      </button>
                      
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={slot.volume}
                        onChange={(e) => updateVolume(slot.id, parseFloat(e.target.value))}
                        className="flex-1"
                      />
                      
                      <button
                        onClick={() => clearSlot(slot.id)}
                        className="p-2 rounded bg-red-600 hover:bg-red-700 text-white"
                      >
                        <RotateCcw size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-slate-400 text-center">
                      {draggedOver === slot.id ? 'Drop here!' : 'Drag sound here or use "Add to Player" button'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

SamplePlayer.displayName = 'SamplePlayer';

export default SamplePlayer;