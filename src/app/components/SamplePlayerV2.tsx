'use client';

import React, { useState, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { Play, Pause, Volume2, RotateCcw } from 'lucide-react';
import { SoundData } from '@/types/sound';

interface PlayerSlot {
  id: number;
  sound: SoundData | null;
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

const SamplePlayerV2 = forwardRef<SamplePlayerRef, SamplePlayerProps>(({ onSoundAdded }, ref) => {
  const [slots, setSlots] = useState<PlayerSlot[]>(() => 
    Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      sound: null,
      isPlaying: false,
      volume: 0.7,
      loop: false
    }))
  );
  
  const [draggedOver, setDraggedOver] = useState<number | null>(null);
  const [masterVolume, setMasterVolume] = useState(0.8);
  
  // Audio instances stored in ref - no state updates needed
  const audioInstances = useRef<Map<number, HTMLAudioElement>>(new Map());

  // Slot colors and labels
  const slotColors = [
    'bg-green-400', 'bg-yellow-400', 'bg-blue-400', 'bg-purple-400',
    'bg-orange-400', 'bg-yellow-300', 'bg-gray-400', 'bg-pink-400'
  ];
  const slotLabels = ['LEADS', 'FX', 'KEYS', 'BASS', 'CHORDS', 'DRUMS', 'PERC', 'VOCAL'];

  // Cleanup function
  const cleanupAudio = useCallback((slotId: number) => {
    const audio = audioInstances.current.get(slotId);
    if (audio) {
      audio.pause();
      audio.removeEventListener('ended', () => {});
      audio.src = '';
      audioInstances.current.delete(slotId);
    }
  }, []);

  // Load sound to slot
  const loadSoundToSlot = useCallback((sound: SoundData, slotId: number) => {
    console.log('Loading sound to slot:', slotId, sound.name);
    console.log('Available slots:', slots.map(s => s.id));
    
    // Cleanup existing audio
    cleanupAudio(slotId);
    
    // Create new audio
    const audio = new Audio(sound.previews['preview-hq-mp3']);
    audio.volume = 0.7 * masterVolume;
    audio.preload = 'metadata';
    
    // Handle ended event
    audio.addEventListener('ended', () => {
      setSlots(prev => prev.map(slot => 
        slot.id === slotId ? { ...slot, isPlaying: false } : slot
      ));
    });
    
    // Store audio instance
    audioInstances.current.set(slotId, audio);
    
    // Update slot state
    setSlots(prev => prev.map(slot => 
      slot.id === slotId 
        ? { ...slot, sound, isPlaying: false }
        : slot
    ));
    
    console.log('Sound loaded successfully to slot', slotId);
    onSoundAdded?.(sound, slotId);
  }, [cleanupAudio, masterVolume, onSoundAdded, slots]);

  // Toggle play/pause
  const togglePlay = useCallback((slotId: number) => {
    const audio = audioInstances.current.get(slotId);
    if (!audio) return;
    
    setSlots(prev => prev.map(slot => {
      if (slot.id === slotId) {
        const newIsPlaying = !slot.isPlaying;
        
        if (newIsPlaying) {
          audio.currentTime = 0;
          audio.play().catch(console.error);
        } else {
          audio.pause();
        }
        
        return { ...slot, isPlaying: newIsPlaying };
      }
      return slot;
    }));
  }, []);

  // Clear slot
  const clearSlot = useCallback((slotId: number) => {
    cleanupAudio(slotId);
    setSlots(prev => prev.map(slot => 
      slot.id === slotId 
        ? { ...slot, sound: null, isPlaying: false }
        : slot
    ));
  }, [cleanupAudio]);

  // Update volume
  const updateVolume = useCallback((slotId: number, volume: number) => {
    const audio = audioInstances.current.get(slotId);
    if (audio) {
      audio.volume = volume * masterVolume;
    }
    
    setSlots(prev => prev.map(slot => 
      slot.id === slotId ? { ...slot, volume } : slot
    ));
  }, [masterVolume]);

  // Play all
  const playAll = useCallback(() => {
    audioInstances.current.forEach((audio, slotId) => {
      const slot = slots.find(s => s.id === slotId);
      if (slot?.sound) {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      }
    });
    
    setSlots(prev => prev.map(slot => ({ 
      ...slot, 
      isPlaying: slot.sound ? true : false 
    })));
  }, [slots]);

  // Stop all
  const stopAll = useCallback(() => {
    audioInstances.current.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    
    setSlots(prev => prev.map(slot => ({ 
      ...slot, 
      isPlaying: false 
    })));
  }, []);

  // Update master volume
  const handleMasterVolumeChange = useCallback((volume: number) => {
    setMasterVolume(volume);
    
    // Update all audio instances
    audioInstances.current.forEach((audio, slotId) => {
      const slot = slots.find(s => s.id === slotId);
      if (slot) {
        audio.volume = slot.volume * volume;
      }
    });
  }, [slots]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent, slotId: number) => {
    e.preventDefault();
    setDraggedOver(slotId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDraggedOver(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, slotId: number) => {
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
  }, [loadSoundToSlot]);

  // Cleanup on unmount
  React.useEffect(() => {
    const currentAudioInstances = audioInstances.current;
    return () => {
      currentAudioInstances.forEach(audio => {
        audio.pause();
        audio.src = '';
      });
      currentAudioInstances.clear();
    };
  }, []);

  // Expose loadSoundToSlot for parent
  useImperativeHandle(ref, () => ({
    loadSoundToSlot
  }));

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
          onChange={(e) => handleMasterVolumeChange(parseFloat(e.target.value))}
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

SamplePlayerV2.displayName = 'SamplePlayerV2';

export default SamplePlayerV2;