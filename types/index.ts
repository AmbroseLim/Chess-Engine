import { Chess } from 'chess.js';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_API_URL?: string;
    }
  }
}

export interface GameState {
  chess: Chess;
  history: string[];
  highlights: {
    from?: string;
    to?: string;
  };
  isThinking: boolean;
  gameOver: boolean;
  result: string | null;
}

export interface MoveRecord {
  moveNumber: number;
  white: string;
  black: string | null;
}

export interface StockfishOptions {
  elo?: number;
  depth?: number;
  time?: number;
}

export type PlayerColor = 'white' | 'black';
export type ChessColor = 'w' | 'b';

export interface EngineEvaluation {
  evaluation: number;
  depth: number;
  mate?: number;
}

export interface BestMoveResponse {
  move: string;
  ponder?: string;
  evaluation?: number;
}
