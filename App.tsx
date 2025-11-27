import React, { useState } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Dice } from './components/Dice';
import { PieceComponent } from './components/Piece';
import { GameState, Player, PlayerColor, Piece } from './types';
import { 
    BASE_COORDS, 
    HOME_PATHS_COORDS, 
    MAIN_PATH_COORDS, 
    START_POSITIONS, 
    PATH_LENGTH, 
    COLOR_MAP, 
    WIN_CENTER,
    CELL_COLOR_SEQUENCE
} from './constants';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'WELCOME',
    players: [],
    currentPlayerIndex: 0,
    diceValue: null,
    isRolling: false,
    waitingForMove: false,
    message: 'Welcome!',
    winner: null,
    consecutiveSixes: 0,
  });

  const playSound = (type: 'roll' | 'move' | 'win' | 'crash' | 'jump') => {
      // Placeholder
  };

  const startGame = (selectedColors: PlayerColor[]) => {
    const players: Player[] = selectedColors.map(color => ({
      color,
      name: `${COLOR_MAP[color].name}`,
      isActive: true,
      hasFinished: false,
      pieces: [0, 1, 2, 3].map(id => ({
        id,
        color,
        status: 'HANGAR',
        position: 0,
        distanceTravelled: 0,
      }))
    }));

    setGameState({
      phase: 'PLAYING',
      players,
      currentPlayerIndex: 0,
      diceValue: null,
      isRolling: false,
      waitingForMove: false,
      message: `${players[0].name}'s turn! Roll the dice.`,
      winner: null,
      consecutiveSixes: 0,
    });
  };

  const quitGame = () => {
      setGameState(prev => ({ 
          ...prev, 
          phase: 'WELCOME',
          players: [],
          diceValue: null 
      }));
  };

  const rollDice = () => {
    setGameState(prev => ({ ...prev, isRolling: true, message: 'Rolling...' }));
    playSound('roll');

    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      
      setGameState(prev => {
        const currentPlayer = prev.players[prev.currentPlayerIndex];
        
        // Check availability of moves
        let hasMoves = false;
        
        currentPlayer.pieces.forEach(p => {
          if (p.status === 'FINISHED') return;
          // Rule: 5 or 6 to exit hangar
          if (p.status === 'HANGAR') {
              if (roll >= 5) hasMoves = true;
          } else if (p.status === 'PATH' || p.status === 'HOME_PATH') {
             // Bounce back rule: We can always move on the path/home path if not finished.
             // Even if we overshoot, we just bounce back.
             hasMoves = true;
          }
        });

        const nextState = {
            ...prev,
            isRolling: false,
            diceValue: roll,
            waitingForMove: hasMoves,
        };

        if (!hasMoves) {
             const isSix = roll === 6;
             nextState.message = isSix 
                ? `Rolled 6! No moves available. Roll again!` 
                : `Rolled ${roll}. No moves! Next turn.`;
             
             setTimeout(() => {
                 const nextSixes = isSix ? prev.consecutiveSixes : 0;
                 switchTurn(prev.players, prev.currentPlayerIndex, roll, nextSixes);
             }, 1500);
             
             return { ...nextState, waitingForMove: false };
        } else {
             nextState.message = roll === 6 
                ? `Rolled 6! Pick a plane (Free turn).` 
                : `Rolled ${roll}. Select a plane!`;
             return nextState;
        }
      });
    }, 600);
  };

  const switchTurn = (players: Player[], currentIndex: number, lastRoll: number, consecutiveSixes: number) => {
    // Rule: If rolled 6, player keeps turn.
    if (lastRoll === 6) {
        setGameState(prev => ({
            ...prev,
            players,
            waitingForMove: false,
            diceValue: null, // Reset for next roll
            consecutiveSixes: consecutiveSixes + 1,
            message: `${players[currentIndex].name} rolled 6! Roll again!`,
        }));
        return;
    }

    let nextIndex = (currentIndex + 1) % players.length;
    // Skip finished players
    let loops = 0;
    while(players[nextIndex].hasFinished && loops < players.length) {
         nextIndex = (nextIndex + 1) % players.length;
         loops++;
    }

    setGameState(prev => ({
      ...prev,
      players,
      currentPlayerIndex: nextIndex,
      diceValue: null,
      waitingForMove: false,
      consecutiveSixes: 0,
      message: `${players[nextIndex].name}'s turn!`,
    }));
  };

  const handlePieceClick = (piece: Piece) => {
    if (!gameState.waitingForMove || !gameState.diceValue) return;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (piece.color !== currentPlayer.color) return;

    const roll = gameState.diceValue;
    let newPieceState = { ...piece };
    let moveDescription = '';
    
    // 1. Take off from Hangar
    if (piece.status === 'HANGAR') {
      if (roll >= 5) {
        newPieceState.status = 'PATH';
        newPieceState.position = 0; // Relative to start
        newPieceState.distanceTravelled = 0;
        moveDescription = 'Taking off!';
      } else {
        return; // Should be handled by isMoveValid
      }
    } 
    // 2. Move on Path/Home with Bounce Logic
    else {
      const MAX_DISTANCE = PATH_LENGTH + 6; // Center spot
      let nextDistance = newPieceState.distanceTravelled + roll;
      let didBounce = false;

      // Check for overshoot
      if (nextDistance > MAX_DISTANCE) {
          const excess = nextDistance - MAX_DISTANCE;
          nextDistance = MAX_DISTANCE - excess;
          didBounce = true;
          moveDescription = 'Overshot! Bouncing back!';
      }
      
      newPieceState.distanceTravelled = nextDistance;
      
      // Update position/status based on new calculated distance
      if (newPieceState.distanceTravelled === MAX_DISTANCE) {
         newPieceState.status = 'FINISHED';
         newPieceState.position = 0; // Center
         moveDescription = 'Reached destination!';
      } else if (newPieceState.distanceTravelled >= PATH_LENGTH) {
        // In Home Path
        newPieceState.status = 'HOME_PATH';
        newPieceState.position = newPieceState.distanceTravelled - PATH_LENGTH;
        if (!didBounce) moveDescription = 'Heading home!';
      } else {
        // Still on Main Path
        newPieceState.status = 'PATH';
        newPieceState.position = newPieceState.distanceTravelled % PATH_LENGTH;
        if (!didBounce) moveDescription = 'Flying...';
      }

      // --- Color Jump Logic (Only on MAIN PATH) ---
      // We skip jump logic if we bounced, as bouncing usually happens inside Home Path or near finish
      if (!didBounce && newPieceState.status === 'PATH' && newPieceState.distanceTravelled < PATH_LENGTH) {
         const startOffset = START_POSITIONS[piece.color];
         const globalIdx = (startOffset + newPieceState.position) % PATH_LENGTH;
         const cellColor = CELL_COLOR_SEQUENCE[globalIdx % 4];

         if (cellColor === piece.color) {
             const jumpDist = 4;
             // Ensure jump doesn't overshoot straight to finish without bounce check (simplified: jumps are exact)
             if (newPieceState.distanceTravelled + jumpDist <= MAX_DISTANCE) {
                 moveDescription = `Color Match! Jump +4! 🚀`;
                 playSound('jump');
                 newPieceState.distanceTravelled += jumpDist;

                 if (newPieceState.distanceTravelled >= PATH_LENGTH) {
                    newPieceState.status = 'HOME_PATH';
                    newPieceState.position = newPieceState.distanceTravelled - PATH_LENGTH;
                    if (newPieceState.distanceTravelled === MAX_DISTANCE) {
                         newPieceState.status = 'FINISHED';
                         newPieceState.position = 0;
                         moveDescription = 'Jumped to Finish!';
                    }
                 } else {
                    newPieceState.status = 'PATH';
                    newPieceState.position = (newPieceState.position + jumpDist) % PATH_LENGTH;
                 }
             }
         }
      }
    }

    // --- Trampling (Collision) Logic ---
    let playersCopy = JSON.parse(JSON.stringify(gameState.players));
    let collisionMsg = '';
    
    if (newPieceState.status === 'PATH') {
        const myStartOffset = START_POSITIONS[piece.color];
        const myGlobalIdx = (myStartOffset + newPieceState.position) % PATH_LENGTH;

        // Check opponents
        playersCopy.forEach((pl: Player) => {
            if (pl.color !== piece.color && !pl.hasFinished) {
                pl.pieces.forEach((targetP: Piece) => {
                    if (targetP.status === 'PATH') {
                        const targetStartOffset = START_POSITIONS[targetP.color];
                        const targetGlobalIdx = (targetStartOffset + targetP.position) % PATH_LENGTH;
                        
                        if (myGlobalIdx === targetGlobalIdx) {
                            // TRAMPLE!
                            targetP.status = 'HANGAR';
                            targetP.distanceTravelled = 0;
                            targetP.position = 0;
                            collisionMsg = `💥 BOOM! ${COLOR_MAP[pl.color].name} was trampled!`;
                            playSound('crash');
                        }
                    }
                });
            }
        });
    }

    // Update current player
    const playerIdx = gameState.currentPlayerIndex;
    playersCopy[playerIdx].pieces = playersCopy[playerIdx].pieces.map((p: Piece) => p.id === piece.id ? newPieceState : p);

    // Check Win
    const activePieces = playersCopy[playerIdx].pieces.filter((p: Piece) => p.status !== 'FINISHED');
    if (activePieces.length === 0) {
        playersCopy[playerIdx].hasFinished = true;
        collisionMsg = `${playersCopy[playerIdx].name} Wins!`;
    }

    // Check Game Over
    const activePlayers = playersCopy.filter((p: Player) => !p.hasFinished);
    if (activePlayers.length <= 1 && playersCopy.length > 1) {
        setGameState(prev => ({
            ...prev,
            players: playersCopy,
            winner: playersCopy[playerIdx].color,
            phase: 'GAME_OVER',
            message: 'Game Over!'
        }));
        return;
    }
    
    // Commit Move
    setGameState(prev => ({
        ...prev,
        players: playersCopy,
        waitingForMove: false,
        message: collisionMsg || `${moveDescription}`
    }));

    if (!collisionMsg && !moveDescription.includes('Jump')) playSound('move');

    // Next Turn / Re-roll
    setTimeout(() => {
        switchTurn(playersCopy, gameState.currentPlayerIndex, roll, gameState.consecutiveSixes);
    }, (collisionMsg || moveDescription.includes('Jump')) ? 2000 : 1000);
  };

  // --- Rendering Helpers ---

  const getPositionStyle = (piece: Piece) => {
    let pos = { x: 0, y: 0 };
    
    if (piece.status === 'HANGAR') {
        pos = BASE_COORDS[piece.color][piece.id];
    } else if (piece.status === 'FINISHED') {
        pos = WIN_CENTER;
    } else if (piece.status === 'HOME_PATH') {
        const path = HOME_PATHS_COORDS[piece.color];
        if (piece.position > 0 && piece.position <= 5) {
            pos = path[piece.position - 1]; 
        } else {
             pos = path[0];
        }
    } else if (piece.status === 'PATH') {
         const startOffset = START_POSITIONS[piece.color];
         const actualIndex = (startOffset + piece.position) % PATH_LENGTH;
         pos = MAIN_PATH_COORDS[actualIndex];
    }

    if (!pos) return {};

    const step = 100 / 11;
    return {
        left: `${(pos.x - 1) * step}%`,
        top: `${(pos.y - 1) * step}%`,
        width: `${step}%`,
        height: `${step}%`,
    };
  };

  const isMoveValid = (piece: Piece) => {
      if (!gameState.waitingForMove || !gameState.diceValue) return false;
      if (piece.color !== gameState.players[gameState.currentPlayerIndex].color) return false;
      
      const roll = gameState.diceValue;
      
      if (piece.status === 'HANGAR') return roll >= 5;
      if (piece.status === 'FINISHED') return false;
      
      // Moving on path is always valid (due to bounce back)
      return true;
  };

  if (gameState.phase === 'WELCOME') {
    return <WelcomeScreen onStart={startGame} />;
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const currentColorObj = COLOR_MAP[currentPlayer.color];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-fredoka overflow-hidden select-none">
      
      {/* Top Bar */}
      <div className="w-full max-w-lg flex justify-between items-center mb-4 px-2">
         <div className={`text-xl font-bold px-4 py-1 rounded-full shadow-sm bg-white border-2 ${currentColorObj.border} ${currentColorObj.text}`}>
             Turn: {currentPlayer.name}
         </div>
         <button 
            onClick={quitGame}
            className="px-4 py-2 bg-red-100 text-red-500 rounded-xl font-bold hover:bg-red-200 hover:scale-105 active:scale-95 transition-all text-sm shadow-sm cursor-pointer z-50"
         >
            Quit
         </button>
      </div>

      {/* Message Area */}
      <div className="mb-4 flex flex-col items-center w-full max-w-lg min-h-[60px]">
        <div className={`text-2xl font-bold mb-1 px-6 py-2 rounded-xl shadow-md bg-white border transition-all duration-300 text-center ${currentColorObj.border} ${currentColorObj.text}`}>
            {gameState.message}
        </div>
      </div>

      {/* Game Board Container */}
      <div className="relative w-full max-w-[450px] aspect-square bg-white rounded-[2rem] shadow-2xl border-8 border-white overflow-hidden ring-1 ring-gray-100">
         
         {/* 1. Bases (Corners) - Added pointer-events-none */}
         {/* Red */}
         <div className={`absolute bottom-0 left-0 w-[36.36%] h-[36.36%] ${COLOR_MAP[PlayerColor.RED].base} rounded-tr-3xl flex items-center justify-center pointer-events-none`}>
            <div className="grid grid-cols-2 gap-3 p-4">
                 {[0,1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-white/60 border-2 border-dashed border-red-300" />)}
            </div>
         </div>
         {/* Blue */}
         <div className={`absolute top-0 left-0 w-[36.36%] h-[36.36%] ${COLOR_MAP[PlayerColor.BLUE].base} rounded-br-3xl flex items-center justify-center pointer-events-none`}>
             <div className="grid grid-cols-2 gap-3 p-4">
                 {[0,1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-white/60 border-2 border-dashed border-blue-300" />)}
            </div>
         </div>
         {/* Yellow */}
         <div className={`absolute top-0 right-0 w-[36.36%] h-[36.36%] ${COLOR_MAP[PlayerColor.YELLOW].base} rounded-bl-3xl flex items-center justify-center pointer-events-none`}>
            <div className="grid grid-cols-2 gap-3 p-4">
                 {[0,1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-white/60 border-2 border-dashed border-amber-300" />)}
            </div>
         </div>
         {/* Green */}
         <div className={`absolute bottom-0 right-0 w-[36.36%] h-[36.36%] ${COLOR_MAP[PlayerColor.GREEN].base} rounded-tl-3xl flex items-center justify-center pointer-events-none`}>
            <div className="grid grid-cols-2 gap-3 p-4">
                 {[0,1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-white/60 border-2 border-dashed border-emerald-300" />)}
            </div>
         </div>

         {/* 2. Main Track (Colored Cells) - Added pointer-events-none */}
         {MAIN_PATH_COORDS.map((pos, index) => {
             const color = CELL_COLOR_SEQUENCE[index % 4];
             const styling = COLOR_MAP[color];
             const isStartSpot = Object.entries(START_POSITIONS).find(([c, idx]) => idx === index);
             const isStart = !!isStartSpot;

             return (
                 <div 
                    key={`path-${index}`}
                    style={{
                        left: `${(pos.x-1)*(100/11)}%`, 
                        top: `${(pos.y-1)*(100/11)}%`, 
                        width: `${100/11}%`, 
                        height: `${100/11}%`
                    }}
                    className={`
                        absolute border-[1px] border-white/50 flex items-center justify-center pointer-events-none
                        ${styling.bg} 
                        ${isStart ? 'brightness-110 z-0' : 'opacity-80'}
                    `}
                 >
                    {isStart && <span className="text-white text-[10px]">★</span>}
                 </div>
             );
         })}

         {/* 3. Home Paths - Added pointer-events-none */}
         {/* Red */}
         {HOME_PATHS_COORDS[PlayerColor.RED].map((pos, i) => (
             <div key={`rh-${i}`} style={{left: `${(pos.x-1)*(100/11)}%`, top: `${(pos.y-1)*(100/11)}%`, width: `${100/11}%`, height: `${100/11}%`}} className={`absolute ${COLOR_MAP[PlayerColor.RED].bg} flex items-center justify-center border-white/40 border-[0.5px] pointer-events-none`}>
                 {i === 4 && <span className="text-white text-[8px]">▲</span>}
             </div>
         ))}
         {/* Blue */}
         {HOME_PATHS_COORDS[PlayerColor.BLUE].map((pos, i) => (
             <div key={`bh-${i}`} style={{left: `${(pos.x-1)*(100/11)}%`, top: `${(pos.y-1)*(100/11)}%`, width: `${100/11}%`, height: `${100/11}%`}} className={`absolute ${COLOR_MAP[PlayerColor.BLUE].bg} flex items-center justify-center border-white/40 border-[0.5px] pointer-events-none`}>
                  {i === 4 && <span className="text-white text-[8px] rotate-90">▲</span>}
             </div>
         ))}
         {/* Yellow */}
         {HOME_PATHS_COORDS[PlayerColor.YELLOW].map((pos, i) => (
             <div key={`yh-${i}`} style={{left: `${(pos.x-1)*(100/11)}%`, top: `${(pos.y-1)*(100/11)}%`, width: `${100/11}%`, height: `${100/11}%`}} className={`absolute ${COLOR_MAP[PlayerColor.YELLOW].bg} flex items-center justify-center border-white/40 border-[0.5px] pointer-events-none`}>
                 {i === 4 && <span className="text-white text-[8px] rotate-180">▲</span>}
             </div>
         ))}
         {/* Green */}
         {HOME_PATHS_COORDS[PlayerColor.GREEN].map((pos, i) => (
             <div key={`gh-${i}`} style={{left: `${(pos.x-1)*(100/11)}%`, top: `${(pos.y-1)*(100/11)}%`, width: `${100/11}%`, height: `${100/11}%`}} className={`absolute ${COLOR_MAP[PlayerColor.GREEN].bg} flex items-center justify-center border-white/40 border-[0.5px] pointer-events-none`}>
                 {i === 4 && <span className="text-white text-[8px] -rotate-90">▲</span>}
             </div>
         ))}

         {/* 4. Center - Added pointer-events-none */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[9.09%] h-[9.09%] bg-white/90 z-0 rounded-md flex items-center justify-center shadow-inner pointer-events-none">
             <span className="text-xl">🏆</span>
         </div>

         {/* 5. Render Pieces */}
         {gameState.players.map(player => (
            player.pieces.map(piece => {
                const isValid = isMoveValid(piece);
                const style = getPositionStyle(piece);
                
                return (
                     <PieceComponent
                        key={`${piece.color}-${piece.id}`}
                        color={piece.color}
                        isClickable={isValid}
                        onClick={() => handlePieceClick(piece)}
                        style={style}
                     />
                );
            })
         ))}
      </div>

      {/* Controls */}
      <div className="mt-8 flex flex-col items-center">
         <Dice 
            value={gameState.diceValue} 
            isRolling={gameState.isRolling} 
            onRoll={rollDice}
            disabled={gameState.waitingForMove || gameState.phase === 'GAME_OVER'}
            colorClass={currentColorObj.bg}
         />
      </div>
      
      {/* Game Over Overlay */}
      {gameState.phase === 'GAME_OVER' && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
           <div className="bg-white p-10 rounded-[2rem] text-center animate-bounce shadow-2xl border-4 border-yellow-400">
               <div className="text-6xl mb-4">🏆</div>
               <h2 className="text-4xl font-bold mb-4 text-gray-800">Victory!</h2>
               <p className="text-2xl text-gray-600 mb-8">{COLOR_MAP[gameState.winner!].name} Pilot Wins!</p>
               <button 
                onClick={() => setGameState(prev => ({ ...prev, phase: 'WELCOME' }))}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-bold shadow-lg hover:scale-105 transition-transform"
               >
                   Back to Menu
               </button>
           </div>
        </div>
      )}

    </div>
  );
};

export default App;