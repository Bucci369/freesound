'use client';

import React, { useState } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import { SoundData } from '@/types/sound';

interface AddToPlayerButtonProps {
  sound: SoundData;
  onAddToPlayer: (sound: SoundData, slotId: number) => void;
}

const AddToPlayerButton: React.FC<AddToPlayerButtonProps> = ({ sound, onAddToPlayer }) => {
  const [isOpen, setIsOpen] = useState(false);

  const slots = [
    { id: 1, label: 'LEADS', color: 'bg-green-400' },
    { id: 2, label: 'FX', color: 'bg-yellow-400' },
    { id: 3, label: 'KEYS', color: 'bg-blue-400' },
    { id: 4, label: 'BASS', color: 'bg-purple-400' },
    { id: 5, label: 'CHORDS', color: 'bg-orange-400' },
    { id: 6, label: 'DRUMS', color: 'bg-yellow-300' },
    { id: 7, label: 'PERC', color: 'bg-gray-400' },
    { id: 8, label: 'VOCAL', color: 'bg-pink-400' }
  ];

  const handleSlotSelect = (slotId: number) => {
    onAddToPlayer(sound, slotId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center gap-2 bg-green-600/80 backdrop-blur-sm text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:bg-green-700/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 text-sm whitespace-nowrap border border-green-500/20"
        title="Add to Player"
      >
        <Plus size={16} />
        Add to Player
        <ChevronDown size={16} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-20">
            <div className="p-2">
              <div className="text-xs text-slate-400 mb-2 px-2">Select Slot:</div>
              {slots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => handleSlotSelect(slot.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-slate-700 rounded-md transition-colors"
                >
                  <div className={`w-4 h-4 rounded ${slot.color}`} />
                  <span className="text-white text-sm">{slot.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AddToPlayerButton;