/**
 * Game Constants and Configuration
 */

export const STOCKFISH_CONFIG = {
  DEFAULT_ELO: 1600,
  MIN_ELO: 100,
  MAX_ELO: 5000,
  ELO_STEP: 10,
  DEFAULT_DEPTH: 8,
  DEFAULT_TIME: 1000, // milliseconds
  MAX_TIME: 8000,
  THREADS: 2,
  HASH: 256, // MB
} as const;

export const ENGINE_STRENGTH_CONFIG = {
  UCI_MIN_ELO: 1320,
  UCI_MAX_ELO: 3190,
  LOW_ELO_NOISE_CAP: 1800,
  MIN_DEPTH: 1,
  MAX_DEPTH: 30,
  MIN_TIME: 120,
} as const;

export const ELO_LEVELS = {
  BEGINNER: { elo: 800, label: 'Beginner', depth: 6 },
  INTERMEDIATE: { elo: 1200, label: 'Intermediate', depth: 12 },
  ADVANCED: { elo: 1600, label: 'Advanced', depth: 16 },
  MASTER: { elo: 2000, label: 'Master', depth: 20 },
  GRANDMASTER: { elo: 2800, label: 'Grandmaster', depth: 25 },
} as const;

export const GAME_CONFIG = {
  MAX_MOVES: 1000,
  ENABLE_TAKEBACK: true,
  AUTO_PROMOTE_TO: 'q' as const, // queen
  CHECK_INDICATOR: true,
  SHOW_LEGAL_MOVES: true,
  SHOW_LAST_MOVE: true,
} as const;

export const UI_CONFIG = {
  BOARD_WIDTH: 400,
  ANIMATION_DURATION: 300, // ms
  THINKING_INDICATOR: true,
  SHOW_NOTATION: true,
  PIECE_STYLE: 'default',
} as const;

export const COLORS = {
  // Light mode
  LIGHT: {
    background: '#ffffff',
    foreground: '#1f2937',
    primary: '#000000',
    secondary: '#f3f4f6',
    accent: '#22c55e',
    muted: '#9ca3af',
    border: '#e5e7eb',
  },
  // Dark mode
  DARK: {
    background: '#0f172a',
    foreground: '#f8fafc',
    primary: '#f8fafc',
    secondary: '#1e293b',
    accent: '#22c55e',
    muted: '#64748b',
    border: '#334155',
  },
  // Chess board
  BOARD: {
    light: '#d9dece',
    dark: '#435448',
    highlight: 'rgba(34, 197, 94, 0.3)',
    selected: 'rgba(59, 130, 246, 0.3)',
  },
} as const;

export const PAGE_THEME_PRESETS = {
  dark: { label: 'Dark', className: 'theme-dark', isDark: true },
  light: { label: 'Light', className: 'theme-light', isDark: false },
  graphite: { label: 'Graphite', className: 'theme-graphite', isDark: true },
  tournament: { label: 'Tournament', className: 'theme-tournament', isDark: false },
} as const;

export const BOARD_THEME_PRESETS = {
  midnight: {
    label: 'Midnight',
    light: '#d9dece',
    dark: '#435448',
    highlight: 'rgba(72, 187, 120, 0.34)',
    selected: 'rgba(245, 158, 11, 0.36)',
  },
  classic: {
    label: 'Classic',
    light: '#eeeed2',
    dark: '#769656',
    highlight: 'rgba(34, 197, 94, 0.32)',
    selected: 'rgba(59, 130, 246, 0.32)',
  },
  walnut: {
    label: 'Walnut',
    light: '#ead7b7',
    dark: '#8b5e3c',
    highlight: 'rgba(234, 179, 8, 0.34)',
    selected: 'rgba(20, 184, 166, 0.32)',
  },
  harbor: {
    label: 'Harbor',
    light: '#cdd7df',
    dark: '#4f6f82',
    highlight: 'rgba(20, 184, 166, 0.34)',
    selected: 'rgba(251, 146, 60, 0.34)',
  },
  custom: {
    label: 'Custom',
    light: '#d9dece',
    dark: '#435448',
    highlight: 'rgba(72, 187, 120, 0.34)',
    selected: 'rgba(245, 158, 11, 0.36)',
  },
} as const;

export type PageThemeId = keyof typeof PAGE_THEME_PRESETS;
export type BoardThemeId = keyof typeof BOARD_THEME_PRESETS;

export const MESSAGES = {
  CHECKMATE_WHITE: 'Checkmate! White wins',
  CHECKMATE_BLACK: 'Checkmate! Black wins',
  DRAW_THREEFOLD: 'Draw by threefold repetition',
  DRAW_FIFTY_MOVE: 'Draw by fifty-move rule',
  DRAW_MATERIAL: 'Draw by insufficient material',
  DRAW_STALEMATE: 'Draw by stalemate',
  CHECK: 'Check!',
  ENGINE_THINKING: 'Engine thinking...',
  INITIALIZING_ENGINE: 'Initializing Stockfish engine...',
  MOVE_INVALID: 'Invalid move',
  GAME_OVER: 'Game Over',
  NEW_GAME: 'New Game',
  TAKE_BACK: 'Take Back',
  PLAY_AS_WHITE: 'Play As White',
  PLAY_AS_BLACK: 'Play As Black',
} as const;

export const KEYBOARD_SHORTCUTS = {
  NEW_GAME: 'Ctrl+N',
  TAKE_BACK: 'Ctrl+Z',
  FLIP_BOARD: 'Ctrl+F',
  HINT: 'Ctrl+H',
  COPY_FEN: 'Ctrl+C',
  PASTE_FEN: 'Ctrl+V',
} as const;

export const DEFAULT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const STARTING_POSITIONS = {
  STANDARD: DEFAULT_FEN,
  EMPTY: '8/8/8/8/8/8/8/8 w - - 0 1',
  SCHOLARS_MATE_WHITE_WINNING: 'rnbqkbnr/pppp1ppp/8/4p3/4PP2/8/PPPP2PP/RNBQKBNR w KQkq - 0 1',
} as const;

export const PIECE_VALUES = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0, // King has no material value
} as const;

/**
 * Helper function to get label for ELO rating
 */
export function getEloLabel(elo: number): string {
  if (elo < 400) return 'Learning';
  if (elo < 800) return 'Casual';
  if (elo < 1200) return 'Club';
  if (elo < 1600) return 'Competitive';
  if (elo < 2200) return 'Expert';
  if (elo < 3200) return 'Master';
  if (elo < 4200) return 'Grandmaster';
  return 'Superhuman';
}

function getDifficultyRatio(elo: number): number {
  const min = STOCKFISH_CONFIG.MIN_ELO;
  const max = STOCKFISH_CONFIG.MAX_ELO;
  return Math.min(Math.max((elo - min) / (max - min), 0), 1);
}

export function getEffectiveEngineElo(elo: number): number {
  const ratio = getDifficultyRatio(elo);
  const scaled = ENGINE_STRENGTH_CONFIG.UCI_MIN_ELO +
    Math.pow(ratio, 0.72) *
      (ENGINE_STRENGTH_CONFIG.UCI_MAX_ELO - ENGINE_STRENGTH_CONFIG.UCI_MIN_ELO);

  return Math.round(
    Math.min(
      ENGINE_STRENGTH_CONFIG.UCI_MAX_ELO,
      Math.max(ENGINE_STRENGTH_CONFIG.UCI_MIN_ELO, scaled)
    )
  );
}

export function getLowEloMoveNoise(elo: number): {
  randomMoveChance: number;
  inaccuracyChance: number;
} {
  if (elo >= ENGINE_STRENGTH_CONFIG.LOW_ELO_NOISE_CAP) {
    return { randomMoveChance: 0, inaccuracyChance: 0 };
  }

  const min = STOCKFISH_CONFIG.MIN_ELO;
  const max = ENGINE_STRENGTH_CONFIG.LOW_ELO_NOISE_CAP;
  const ratio = Math.min(Math.max((elo - min) / (max - min), 0), 1);
  const inverse = 1 - ratio;

  return {
    randomMoveChance: Number((0.7 * Math.pow(inverse, 1.35)).toFixed(3)),
    inaccuracyChance: Number((0.22 * Math.pow(inverse, 1.15)).toFixed(3)),
  };
}

/**
 * Helper function to get recommended depth for ELO
 */
export function getDepthForElo(elo: number): number {
  const minDepth = ENGINE_STRENGTH_CONFIG.MIN_DEPTH;
  const maxDepth = ENGINE_STRENGTH_CONFIG.MAX_DEPTH;
  const ratio = getDifficultyRatio(elo);
  return Math.max(1, Math.round(minDepth + ratio * (maxDepth - minDepth)));
}

/**
 * Helper function to get thinking time for ELO
 */
export function getThinkingTimeForElo(elo: number): number {
  const minTime = ENGINE_STRENGTH_CONFIG.MIN_TIME;
  const maxTime = STOCKFISH_CONFIG.MAX_TIME || 8000;
  const ratio = getDifficultyRatio(elo);
  return Math.round(minTime + ratio * (maxTime - minTime));
}
