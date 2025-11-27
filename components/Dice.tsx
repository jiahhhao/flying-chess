import React, { useEffect, useState } from 'react';

interface DiceProps {
  value: number | null;
  isRolling: boolean;
  onRoll: () => void;
  disabled: boolean;
  colorClass: string;
}

export const Dice: React.FC<DiceProps> = ({ value, isRolling, onRoll, disabled, colorClass }) => {
  const [displayValue, setDisplayValue] = useState(1);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRolling) {
      interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
        setRotation({
          x: Math.random() * 360,
          y: Math.random() * 360
        });
      }, 100);
    } else if (value) {
      setDisplayValue(value);
      setRotation({ x: 0, y: 0 });
    }
    return () => clearInterval(interval);
  }, [isRolling, value]);

  const dots = {
    1: ['justify-center items-center flex'],
    2: ['justify-between'], // diagonal handled by child css
    3: ['justify-between'],
    4: ['justify-between'],
    5: ['justify-between'],
    6: ['justify-between']
  };

  const renderDots = (val: number) => {
    const dotStyle = "w-3 h-3 bg-white rounded-full shadow-sm";
    switch(val) {
      case 1: return <div className={dotStyle}></div>;
      case 2: return <><div className={dotStyle}></div><div className={`${dotStyle} self-end`}></div></>;
      case 3: return <><div className={dotStyle}></div><div className={`${dotStyle} self-center`}></div><div className={`${dotStyle} self-end`}></div></>;
      case 4: return (
        <div className="flex flex-col justify-between h-full w-full">
            <div className="flex justify-between"><div className={dotStyle}></div><div className={dotStyle}></div></div>
            <div className="flex justify-between"><div className={dotStyle}></div><div className={dotStyle}></div></div>
        </div>
      );
      case 5: return (
        <div className="flex flex-col justify-between h-full w-full">
            <div className="flex justify-between"><div className={dotStyle}></div><div className={dotStyle}></div></div>
            <div className="flex justify-center -my-1"><div className={dotStyle}></div></div>
            <div className="flex justify-between"><div className={dotStyle}></div><div className={dotStyle}></div></div>
        </div>
      );
      case 6: return (
        <div className="flex flex-col justify-between h-full w-full">
            <div className="flex justify-between"><div className={dotStyle}></div><div className={dotStyle}></div></div>
            <div className="flex justify-between"><div className={dotStyle}></div><div className={dotStyle}></div></div>
            <div className="flex justify-between"><div className={dotStyle}></div><div className={dotStyle}></div></div>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="relative flex flex-col items-center gap-4 z-20">
      <div className="perspective-dice w-20 h-20 cursor-pointer" onClick={() => !disabled && !isRolling && onRoll()}>
        <div 
            className={`w-full h-full rounded-2xl shadow-xl flex items-center justify-center text-white text-3xl font-bold transition-all duration-300 ${disabled ? 'bg-gray-300 opacity-50' : colorClass} ${isRolling ? 'animate-bounce' : ''}`}
            style={{
                transform: isRolling ? `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` : 'none'
            }}
        >
             <div className="p-3 w-full h-full flex flex-col">
                {renderDots(displayValue)}
             </div>
        </div>
      </div>
      <button 
        disabled={disabled || isRolling}
        onClick={onRoll}
        className={`px-6 py-2 rounded-full font-bold shadow-md text-white transition-all transform active:scale-95 ${disabled ? 'bg-gray-300 cursor-not-allowed' : `${colorClass} hover:brightness-110`}`}
      >
        {isRolling ? 'Rolling...' : value ? `Rolled: ${value}` : 'Roll Dice'}
      </button>
      <div className="text-sm font-semibold text-gray-500 h-5">
        {!disabled && !isRolling && !value && "Your Turn!"}
      </div>
    </div>
  );
};