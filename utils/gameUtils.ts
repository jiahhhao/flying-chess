import { MAIN_PATH_COORDS, START_POSITIONS, PATH_LENGTH } from '../constants';
import { PlayerColor, Piece, CellPosition } from '../types';

// Convert logical position to grid coordinates
export const getGridPosition = (piece: Piece): CellPosition | null => {
  if (piece.status === 'HANGAR') return null; // Handled separately by base coords
  if (piece.status === 'FINISHED') return null; // Handled by winner center

  if (piece.status === 'PATH') {
    // Determine actual index on the main path array
    // The piece.position is relative to the start of the path (0-39)
    // We need to shift it based on the player's start index
    const startOffset = START_POSITIONS[piece.color];
    const actualIndex = (startOffset + piece.position) % PATH_LENGTH;
    return MAIN_PATH_COORDS[actualIndex];
  }

  return null;
};

export const canMove = (piece: Piece, diceValue: number): boolean => {
  if (piece.status === 'FINISHED') return false;

  // Rule: 5 or 6 to exit hangar
  if (piece.status === 'HANGAR') {
    return diceValue >= 5;
  }

  // Path movement
  if (piece.status === 'PATH') {
    const nextPos = piece.position + diceValue;
    // Check if entering home path
    // Path length is usually ~40. Let's say track is length X.
    // If position + dice > Full Loop, we enter home strip.
    // In this simplified mapping, let's say one lap is PATH_LENGTH steps.
    // piece.position starts at 0. 
    // If piece.position + dice < PATH_LENGTH, it's normal path.
    // If it exceeds, we check remaining steps.
    return true; 
  }
  
  if (piece.status === 'HOME_PATH') {
    // 5 steps in home path. 
    return piece.position + diceValue <= 5; // Exact landing on center (index 5) required? or just <= 5
  }

  return false;
};
