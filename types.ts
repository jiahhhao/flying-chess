export enum PlayerColor {
  RED = 'RED',
  YELLOW = 'YELLOW',
  BLUE = 'BLUE',
  GREEN = 'GREEN'
}

export type PieceStatus = 'HANGAR' | 'PATH' | 'HOME_PATH' | 'FINISHED';

export interface Piece {
  id: number; // 0-3
  color: PlayerColor;
  status: PieceStatus;
  position: number; // 0-51 for PATH, 0-5 for HOME_PATH relative to start
  distanceTravelled: number; // To track if we reached home
}

export interface Player {
  color: PlayerColor;
  name: string;
  isActive: boolean; // Is this player in the game?
  pieces: Piece[];
  hasFinished: boolean;
}

export interface GameState {
  phase: 'WELCOME' | 'PLAYING' | 'GAME_OVER';
  players: Player[];
  currentPlayerIndex: number; // Index in the players array
  diceValue: number | null;
  isRolling: boolean;
  waitingForMove: boolean; // True if player needs to click a piece
  message: string;
  winner: PlayerColor | null;
  consecutiveSixes: number;
}

export interface CellPosition {
  x: number; // Grid column 1-11
  y: number; // Grid row 1-11
}
