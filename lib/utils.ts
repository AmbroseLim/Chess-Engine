/**
 * Utility Functions for Chess Game
 */

import { Square } from 'chess.js';
import { PIECE_VALUES } from './constants';

/**
 * Convert square notation to coordinates
 * Example: 'e4' -> { file: 4, rank: 3 }
 */
export function squareToCoordinates(square: string): { file: number; rank: number } {
  const file = square.charCodeAt(0) - 97; // 'a' = 0, 'h' = 7
  const rank = parseInt(square[1], 10) - 1; // '1' = 0, '8' = 7
  return { file, rank };
}

/**
 * Convert coordinates to square notation
 */
export function coordinatesToSquare(file: number, rank: number): Square {
  const fileChar = String.fromCharCode(97 + file);
  const rankChar = String.fromCharCode(49 + rank);
  return `${fileChar}${rankChar}` as Square;
}

/**
 * Check if square is light or dark
 */
export function isLightSquare(square: string): boolean {
  const { file, rank } = squareToCoordinates(square);
  return (file + rank) % 2 === 0;
}

/**
 * Parse move in algebraic notation and extract details
 */
export function parseMoveNotation(notation: string): {
  piece: string;
  source?: string;
  target: string;
  isCapture: boolean;
  isCheck: boolean;
  isCheckmate: boolean;
  isPromotion: boolean;
} {
  const isCheckmate = notation.includes('#');
  const isCheck = notation.includes('+');
  const isCapture = notation.includes('x');
  const isPromotion = notation.includes('=');

  // Extract target square (last 2 characters before modifiers)
  const target = notation.slice(-2).match(/[a-h][1-8]/) ? notation.slice(-2) : '';

  return {
    piece: notation[0],
    target,
    isCapture,
    isCheck,
    isCheckmate,
    isPromotion,
  };
}

/**
 * Calculate material balance
 * Positive = white advantage, Negative = black advantage
 */
export function calculateMaterialBalance(position: string): number {
  let balance = 0;
  for (const char of position) {
    const value = PIECE_VALUES[char as keyof typeof PIECE_VALUES];
    if (value) {
      balance += char === char.toUpperCase() ? value : -value;
    }
  }
  return balance;
}

/**
 * Get all pieces from FEN position
 */
export function getPiecesFromFen(fen: string): Record<string, string[]> {
  const parts = fen.split(' ');
  const boardPart = parts[0];
  const pieces: Record<string, string[]> = {
    white: [],
    black: [],
  };

  let square = 0;
  for (const char of boardPart) {
    if (char === '/') continue;
    if (/\d/.test(char)) {
      square += parseInt(char, 10);
    } else {
      const file = String.fromCharCode(97 + (square % 8));
      const rank = String.fromCharCode(56 - Math.floor(square / 8));
      const squareNotation = `${file}${rank}`;
      if (char === char.toUpperCase()) {
        pieces.white.push(squareNotation);
      } else {
        pieces.black.push(squareNotation);
      }
      square++;
    }
  }

  return pieces;
}

/**
 * Check if a square is under attack (simplified check)
 * This is a placeholder - real implementation would check all attacking pieces
 */
export function isSquareAttacked(
  fen: string,
  square: string,
  byWhite: boolean
): boolean {
  // Placeholder implementation
  // Real implementation would check all pieces attacking the square
  return false;
}

/**
 * Format time duration
 */
export function formatTime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
}

/**
 * Get game statistics from move history
 */
export interface GameStats {
  totalMoves: number;
  whiteMoves: number;
  blackMoves: number;
  captures: number;
  checks: number;
  castles: number;
  promotions: number;
}

export function calculateGameStats(history: string[]): GameStats {
  const stats: GameStats = {
    totalMoves: history.length,
    whiteMoves: Math.ceil(history.length / 2),
    blackMoves: Math.floor(history.length / 2),
    captures: 0,
    checks: 0,
    castles: 0,
    promotions: 0,
  };

  for (const move of history) {
    if (move.includes('x')) stats.captures++;
    if (move.includes('+')) stats.checks++;
    if (move.includes('O-O')) stats.castles++;
    if (move.includes('=')) stats.promotions++;
  }

  return stats;
}

/**
 * Check if move is a capture
 */
export function isCaptureMove(moveNotation: string): boolean {
  return moveNotation.includes('x');
}

/**
 * Check if move is a check
 */
export function isCheckMove(moveNotation: string): boolean {
  return moveNotation.includes('+');
}

/**
 * Check if move is checkmate
 */
export function isCheckmateMove(moveNotation: string): boolean {
  return moveNotation.includes('#');
}

/**
 * Check if move is castling
 */
export function isCastlingMove(moveNotation: string): boolean {
  return moveNotation.includes('O-O');
}

/**
 * Check if move is en passant
 */
export function isEnPassantMove(moveNotation: string): boolean {
  // En passant captures are typically represented with x and pawn move
  return moveNotation.startsWith('a') || moveNotation.startsWith('h') || moveNotation.includes('x');
}

/**
 * Get piece from move notation
 */
export function getPieceFromMove(moveNotation: string): string {
  if (moveNotation.includes('O-O')) return 'K'; // Castling
  if (moveNotation[0] === moveNotation[0].toUpperCase()) {
    return moveNotation[0];
  }
  return 'P'; // Pawn
}

/**
 * Validate FEN string
 */
export function isValidFen(fen: string): boolean {
  const parts = fen.split(' ');
  if (parts.length !== 6) return false;

  const [position, turn, castling, enpassant, halfmove, fullmove] = parts;

  // Validate turn
  if (!['w', 'b'].includes(turn)) return false;

  // Validate castling
  if (!/^(-|K?Q?k?q?)$/.test(castling)) return false;

  // Validate move numbers
  if (isNaN(parseInt(halfmove, 10)) || isNaN(parseInt(fullmove, 10))) return false;

  return true;
}

/**
 * Export game as PGN
 */
export interface PgnExportOptions {
  event?: string;
  site?: string;
  date?: string;
  white?: string;
  black?: string;
  result?: string;
  moves: string[];
  comment?: string;
}

export function exportToPgn(options: PgnExportOptions): string {
  const {
    event = 'Chess Master Game',
    site = 'Chess Master UI',
    date = new Date().toISOString().split('T')[0],
    white = 'Player',
    black = 'Stockfish',
    result = '*',
    moves,
    comment = '',
  } = options;

  let pgn = '';
  pgn += `[Event "${event}"]\n`;
  pgn += `[Site "${site}"]\n`;
  pgn += `[Date "${date}"]\n`;
  pgn += `[White "${white}"]\n`;
  pgn += `[Black "${black}"]\n`;
  pgn += `[Result "${result}"]\n`;

  if (comment) {
    pgn += `\n{${comment}}\n`;
  }

  pgn += '\n';

  // Format moves
  for (let i = 0; i < moves.length; i += 2) {
    const moveNum = Math.floor(i / 2) + 1;
    const whiteMove = moves[i];
    const blackMove = moves[i + 1];

    pgn += `${moveNum}. ${whiteMove}`;
    if (blackMove) {
      pgn += ` ${blackMove}`;
    }
    pgn += ' ';
  }

  pgn += `${result}`;
  return pgn;
}

/**
 * Parse PGN string
 */
export function parsePgn(pgn: string): {
  tags: Record<string, string>;
  moves: string[];
  comment?: string;
} {
  const lines = pgn.split('\n');
  const tags: Record<string, string> = {};
  let moveStartIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.match(/\[.*\]/)) {
      const match = line.match(/\[(\w+)\s"([^"]*)"\]/);
      if (match) {
        tags[match[1]] = match[2];
      }
    } else if (line && !line.startsWith('[')) {
      moveStartIndex = i;
      break;
    }
  }

  const moveText = lines.slice(moveStartIndex).join(' ');
  const moves = moveText
    .replace(/\d+\./g, '')
    .replace(/\{.*?\}/g, '')
    .split(/\s+/)
    .filter((m) => m && !m.includes('*'))
    .slice(0, -1); // Remove result marker

  return { tags, moves };
}

/**
 * Get square color (for highlighting)
 */
export function getSquareColor(square: string, lightColor: string, darkColor: string): string {
  return isLightSquare(square) ? lightColor : darkColor;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
