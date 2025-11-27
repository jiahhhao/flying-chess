import { CellPosition, PlayerColor } from './types';

export const BOARD_SIZE = 11; // 11x11 Grid
export const PATH_LENGTH = 40; // Total steps in the main loop

// Colors matching Tailwind classes
export const COLOR_MAP = {
  [PlayerColor.RED]: {
    name: 'Red',
    bg: 'bg-red-400',
    border: 'border-red-500',
    text: 'text-red-500',
    base: 'bg-red-100',
    light: 'bg-red-200',
    dark: 'bg-red-600',
    shadow: 'shadow-red-300',
  },
  [PlayerColor.YELLOW]: {
    name: 'Yellow',
    bg: 'bg-amber-400',
    border: 'border-amber-500',
    text: 'text-amber-500',
    base: 'bg-amber-100',
    light: 'bg-amber-200',
    dark: 'bg-amber-600',
    shadow: 'shadow-amber-300',
  },
  [PlayerColor.BLUE]: {
    name: 'Blue',
    bg: 'bg-blue-400',
    border: 'border-blue-500',
    text: 'text-blue-500',
    base: 'bg-blue-100',
    light: 'bg-blue-200',
    dark: 'bg-blue-600',
    shadow: 'shadow-blue-300',
  },
  [PlayerColor.GREEN]: {
    name: 'Green',
    bg: 'bg-emerald-400',
    border: 'border-emerald-500',
    text: 'text-emerald-500',
    base: 'bg-emerald-100',
    light: 'bg-emerald-200',
    dark: 'bg-emerald-600',
    shadow: 'shadow-emerald-300',
  },
};

export const START_POSITIONS = {
  [PlayerColor.RED]: 0,
  [PlayerColor.BLUE]: 10,
  [PlayerColor.YELLOW]: 20,
  [PlayerColor.GREEN]: 30,
};

// Map colors to the board cells to create the repeating pattern (R, B, Y, G...)
// We will assign a color type to each index of the main path for rendering
export const CELL_COLOR_SEQUENCE = [
  PlayerColor.RED, PlayerColor.BLUE, PlayerColor.YELLOW, PlayerColor.GREEN
];

export const MAIN_PATH_COORDS: CellPosition[] = [
  // Red side (Bottom, moving right then up)
  { x: 5, y: 11 }, { x: 5, y: 10 }, { x: 5, y: 9 }, { x: 5, y: 8 }, { x: 5, y: 7 }, // 0-4
  { x: 4, y: 7 }, { x: 3, y: 7 }, { x: 2, y: 7 }, { x: 1, y: 7 }, { x: 1, y: 6 }, // 5-9
  
  // Blue side (Left, moving up then right)
  { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 }, // 10-14
  { x: 5, y: 4 }, { x: 5, y: 3 }, { x: 5, y: 2 }, { x: 5, y: 1 }, { x: 6, y: 1 }, // 15-19

  // Yellow side (Top, moving left then down)
  { x: 7, y: 1 }, { x: 7, y: 2 }, { x: 7, y: 3 }, { x: 7, y: 4 }, { x: 7, y: 5 }, // 20-24
  { x: 8, y: 5 }, { x: 9, y: 5 }, { x: 10, y: 5 }, { x: 11, y: 5 }, { x: 11, y: 6 }, // 25-29

  // Green side (Right, moving down then left)
  { x: 11, y: 7 }, { x: 10, y: 7 }, { x: 9, y: 7 }, { x: 8, y: 7 }, { x: 7, y: 7 }, // 30-34
  { x: 7, y: 8 }, { x: 7, y: 9 }, { x: 7, y: 10 }, { x: 7, y: 11 }, { x: 6, y: 11 }, // 35-39
];

export const HOME_PATHS_COORDS = {
  [PlayerColor.RED]: [{x:6, y:11}, {x:6, y:10}, {x:6, y:9}, {x:6, y:8}, {x:6, y:7}],
  [PlayerColor.BLUE]: [{x:1, y:6}, {x:2, y:6}, {x:3, y:6}, {x:4, y:6}, {x:5, y:6}],
  [PlayerColor.YELLOW]: [{x:6, y:1}, {x:6, y:2}, {x:6, y:3}, {x:6, y:4}, {x:6, y:5}],
  [PlayerColor.GREEN]: [{x:11, y:6}, {x:10, y:6}, {x:9, y:6}, {x:8, y:6}, {x:7, y:6}],
};

export const BASE_COORDS = {
  [PlayerColor.RED]: [{x:2, y:10}, {x:3, y:10}, {x:2, y:9}, {x:3, y:9}],
  [PlayerColor.BLUE]: [{x:2, y:2}, {x:3, y:2}, {x:2, y:3}, {x:3, y:3}],
  [PlayerColor.YELLOW]: [{x:10, y:2}, {x:9, y:2}, {x:10, y:3}, {x:9, y:3}],
  [PlayerColor.GREEN]: [{x:10, y:10}, {x:9, y:10}, {x:10, y:9}, {x:9, y:9}],
};

export const WIN_CENTER = { x: 6, y: 6 };