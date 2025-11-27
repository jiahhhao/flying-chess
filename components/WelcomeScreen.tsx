import React, { useState } from 'react';
import { PlayerColor } from '../types';
import { COLOR_MAP } from '../constants';

interface WelcomeScreenProps {
  onStart: (selectedPlayers: PlayerColor[]) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const [selected, setSelected] = useState<Record<PlayerColor, boolean>>({
    [PlayerColor.RED]: true,
    [PlayerColor.BLUE]: false,
    [PlayerColor.YELLOW]: true,
    [PlayerColor.GREEN]: false,
  });

  const togglePlayer = (color: PlayerColor) => {
    setSelected(prev => ({ ...prev, [color]: !prev[color] }));
  };

  const playerCount = Object.values(selected).filter(Boolean).length;
  const canStart = playerCount >= 2 && playerCount <= 4;

  const handleStart = () => {
    if (canStart) {
      const activeColors = (Object.keys(selected) as PlayerColor[]).filter(c => selected[c]);
      const turnOrder = [PlayerColor.RED, PlayerColor.BLUE, PlayerColor.YELLOW, PlayerColor.GREEN];
      const sortedActive = turnOrder.filter(c => activeColors.includes(c));
      onStart(sortedActive);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-pink-50 p-4 font-fredoka">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-lg w-full text-center border-4 border-pink-100">
        <h1 className="text-5xl font-bold text-gray-800 mb-2">✈️ Flight Chess</h1>
        <p className="text-gray-500 mb-8 text-lg">Customize your game (2-4 Players)</p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {(Object.keys(COLOR_MAP) as PlayerColor[]).map((color) => {
             const styling = COLOR_MAP[color];
             const isSelected = selected[color];
             
             return (
               <div 
                key={color}
                onClick={() => togglePlayer(color)}
                className={`
                  relative p-4 rounded-2xl border-4 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 overflow-hidden
                  ${isSelected ? `${styling.base} ${styling.border}` : 'bg-gray-50 border-gray-200 opacity-60'}
                  hover:scale-105
                `}
               >
                 <div className={`w-10 h-10 rounded-full border-4 border-white shadow-md ${styling.bg} flex items-center justify-center text-xl`}>
                    ✈️
                 </div>
                 <span className={`font-bold ${isSelected ? styling.text : 'text-gray-400'}`}>
                   {styling.name} Position
                 </span>
                 {isSelected && <div className="absolute top-2 right-2 text-green-500 text-xl">✓</div>}
               </div>
             );
          })}
        </div>

        <button
          onClick={handleStart}
          disabled={!canStart}
          className={`
            w-full py-4 rounded-xl font-bold text-2xl text-white shadow-lg transition-all
            ${canStart ? 'bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 hover:scale-[1.02] active:scale-95' : 'bg-gray-300 cursor-not-allowed'}
          `}
        >
          {canStart ? 'Start Game! 🚀' : 'Select at least 2 players'}
        </button>
      </div>
      
      <div className="mt-8 bg-white/80 p-4 rounded-xl shadow-sm text-sm text-gray-500 max-w-md text-center">
        <p className="font-bold mb-1">How to Play:</p>
        <ul className="list-disc list-inside space-y-1 text-left inline-block">
            <li>Roll <strong>5</strong> or <strong>6</strong> to take off.</li>
            <li>Roll <strong>6</strong> to move and roll again!</li>
            <li>Land on <strong>Same Color</strong> to JUMP (+4)!</li>
            <li>Land on opponent to <strong>Trample</strong> them!</li>
        </ul>
      </div>
    </div>
  );
};