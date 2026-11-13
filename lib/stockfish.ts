'use client';

import { STOCKFISH_CONFIG, getEffectiveEngineElo } from './constants';

export interface StockfishOptions {
  elo?: number;
  depth?: number;
  time?: number;
}

interface BestMoveResponse {
  move: string;
  ponder?: string;
  evaluation?: number;
}

interface StockfishQueueItem {
  command: string;
  callback?: (result: string) => void;
  onInfo?: (message: string) => void;
}

class StockfishEngine {
  private worker: Worker | null = null;
  private initialized: boolean = false;
  private currentElo: number = 1600;
  private messageQueue: StockfishQueueItem[] = [];

  private async createWorker() {
    if (typeof window === 'undefined') return null;

    try {
      // Prefer loading the worker directly from the public/stockfish path so it keeps a proper origin
      // This avoids COOP/COEP issues when creating a worker from a blob URL.
      return new Worker('/stockfish/stockfish.wasm.js');
    } catch (directError) {
      console.warn('Direct worker creation failed, falling back to blob worker:', directError);
      try {
        // Fallback: fetch the worker script and create a blob URL
        const response = await fetch('/stockfish/stockfish.wasm.js');
        const scriptText = await response.text();
        const blob = new Blob([scriptText], { type: 'application/javascript' });
        const blobUrl = URL.createObjectURL(blob);

        return new Worker(blobUrl);
      } catch (error) {
        console.error('Failed to load Stockfish worker (fallback):', error);
        return null;
      }
    }
  }

  async init(): Promise<void> {
    if (this.initialized || typeof window === 'undefined') return;

    this.worker?.terminate();
    this.worker = await this.createWorker();

    if (!this.worker) {
      throw new Error('Stockfish worker could not be created.');
    }

    this.worker.onmessage = (event: MessageEvent) => {
      const message = typeof event.data === 'string' ? event.data : String(event.data);
      this.handleEngineMessage(message);
    };

    this.worker.onerror = (error) => {
      console.error('Stockfish worker error:', error);
    };

    this.initialized = true;

    return new Promise((resolve) => {
      this.enqueue({ command: 'uci' });
      this.enqueue({ command: 'setoption name UCI_LimitStrength value true' });
      this.enqueue({ command: `setoption name UCI_Elo value ${getEffectiveEngineElo(this.currentElo)}` });
      this.enqueue({ command: 'isready', callback: () => resolve() });
      this.processQueue();
    });
  }

  private enqueue(item: StockfishQueueItem) {
    this.messageQueue.push(item);
  }

  private processQueue() {
    if (!this.worker || this.messageQueue.length === 0) {
      return;
    }

    const current = this.messageQueue[0];
    this.worker.postMessage(current.command);

    if (!current.callback) {
      this.messageQueue.shift();
      this.processQueue();
    }
  }

  private handleEngineMessage(message: string) {
    if (this.messageQueue.length === 0) {
      return;
    }

    const current = this.messageQueue[0];

    if (message.startsWith('info') && current.onInfo) {
      current.onInfo(message);
    }

    const isResponse =
      (current.command.startsWith('go') && message.startsWith('bestmove')) ||
      (current.command === 'uci' && message === 'uciok') ||
      (current.command === 'isready' && message === 'readyok');

    if (isResponse) {
      this.messageQueue.shift();
      if (current.callback) {
        current.callback(message);
      }
      this.processQueue();
    }
  }

  private async ensureInitialized() {
    if (!this.initialized) {
      await this.init();
    }
  }

  async setOption(name: string, value: string | number | boolean): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve) => {
      this.enqueue({ command: `setoption name ${name} value ${value}` });
      this.enqueue({ command: 'isready', callback: () => resolve() });
      this.processQueue();
    });
  }

  async setElo(elo: number): Promise<void> {
    this.currentElo = Math.max(STOCKFISH_CONFIG.MIN_ELO, Math.min(STOCKFISH_CONFIG.MAX_ELO, elo));
    await this.setOption('UCI_LimitStrength', true);
    await this.setOption('UCI_Elo', getEffectiveEngineElo(this.currentElo));
  }

  async evaluatePosition(fen: string): Promise<{ evaluation: number; depth: number }> {
    await this.ensureInitialized();

    return new Promise((resolve) => {
      let bestEval = 0;
      let bestDepth = 0;

      this.enqueue({ command: 'ucinewgame' });
      this.enqueue({ command: `position fen ${fen}` });
      this.enqueue({
        command: 'go depth 20',
        onInfo: (message: string) => {
          const depthMatch = message.match(/depth (\d+)/);
          const scoreMatch = message.match(/score (?:cp|mate) (-?\d+)/);

          if (depthMatch) {
            bestDepth = parseInt(depthMatch[1], 10);
          }
          if (scoreMatch) {
            bestEval = parseInt(scoreMatch[1], 10);
          }
        },
        callback: () => {
          resolve({ evaluation: bestEval, depth: bestDepth });
        },
      });

      this.processQueue();

      setTimeout(() => {
        if (this.messageQueue.length > 0 && this.messageQueue[0].command.startsWith('go')) {
          resolve({ evaluation: bestEval, depth: bestDepth });
          this.messageQueue.shift();
          this.processQueue();
        }
      }, 3000);
    });
  }

  async getBestMove(
    fen: string,
    options: StockfishOptions = {}
  ): Promise<BestMoveResponse> {
    await this.ensureInitialized();

    const { elo = this.currentElo, depth = 15, time = 1000 } = options;

    if (elo !== this.currentElo) {
      await this.setElo(elo);
    }

    return new Promise((resolve) => {
      let bestMove = '';
      let bestPonder = '';

      this.enqueue({ command: 'ucinewgame' });
      this.enqueue({ command: `position fen ${fen}` });
      this.enqueue({
        command: `go depth ${depth}`,
        callback: (message: string) => {
          if (message.startsWith('bestmove')) {
            const parts = message.split(' ');
            bestMove = parts[1] || 'e2e4';
            bestPonder = parts[3] || '';
          }
          resolve({
            move: bestMove,
            ponder: bestPonder || undefined,
          });
        },
      });

      this.processQueue();

      setTimeout(() => {
        if (!bestMove) {
          resolve({
            move: 'e2e4',
            ponder: undefined,
          });
        }
      }, time);
    });
  }

  async isReady(): Promise<boolean> {
    return this.initialized && this.worker !== null;
  }

  quit(): void {
    if (this.worker) {
      this.worker.postMessage('quit');
      this.worker.terminate();
      this.worker = null;
    }
    this.messageQueue = [];
    this.initialized = false;
  }
}

export const stockfishEngine = new StockfishEngine();
