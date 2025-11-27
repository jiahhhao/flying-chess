import React from 'react';
import { PlayerColor } from '../types';
import { COLOR_MAP } from '../constants';

interface PieceProps {
  color: PlayerColor;
  isClickable: boolean;
  onClick: () => void;
  style?: React.CSSProperties;
  className?: string;
  isMultiple?: boolean;
}

export const PieceComponent: React.FC<PieceProps> = ({ color, isClickable, onClick, style, className, isMultiple }) => {
  const colors = COLOR_MAP[color];
  
  return (
    // Wrapper for larger click area
    <div 
      className={`absolute flex items-center justify-center ${isClickable ? 'z-50 cursor-pointer' : 'z-10'}`}
      style={{
          width: '200%', // Larger touch target
          height: '200%',
          ...style, // Position passed from parent, but we might need to adjust logic if using absolute here
      }}
      onClick={(e) => {
        if (isClickable) {
            e.stopPropagation();
            onClick();
        }
      }}
    >
        {/* Actual visible piece */}
        <div className={`
            relative w-7 h-7 md:w-9 md:h-9 rounded-full border-2 border-white shadow-md flex items-center justify-center transition-all duration-300
            ${colors.bg} 
            ${isClickable ? 'animate-bounce ring-4 ring-white ring-opacity-70 scale-110' : ''}
            ${className}
        `}>
        <span className="text-white text-[10px] md:text-xs drop-shadow-sm transform -rotate-45 pointer-events-none">✈️</span>
        {isMultiple && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center border border-gray-200 pointer-events-none">
            <span className="text-[8px] text-gray-600 font-bold">+</span>
            </div>
        )}
        </div>
    </div>
  );
};