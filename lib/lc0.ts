'use client';

export interface LC0Options {
  elo?: number;
  depth?: number;
  time?: number;
}

class LC0Engine {
  private initialized = false;

  async init(networkPath?: string): Promise<void> {
    if (this.initialized) return;
    try {
      const res = await fetch('/api/lc0', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'init', networkPath }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`LC0 server init failed: ${text}`);
      }
      this.initialized = true;
    } catch (e) {
      throw e;
    }
  }

  async setElo(elo: number): Promise<void> {
    try {
      await fetch('/api/lc0', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setElo', elo }),
      });
    } catch (e) { /* ignore */ }
  }

  async downloadNetwork(url: string, name?: string): Promise<{ ok?: boolean; path?: string; name?: string; error?: string }> {
    try {
      const res = await fetch('/api/lc0', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'downloadNetwork', url, name }),
      });
      if (!res.ok) {
        const txt = await res.text();
        return { error: txt };
      }
      return await res.json();
    } catch (e: any) {
      return { error: String(e) };
    }
  }

  async getBestMove(fen: string, options: LC0Options = {}, color: 'w' | 'b' = 'b'): Promise<{ move: string; color?: string }> {
    try {
      const res = await fetch('/api/lc0', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'bestmove', fen, options, color }),
      });
      if (!res.ok) {
        return { move: 'e2e4' };
      }
      const data = await res.json();
      return { move: data.move || 'e2e4', color: data.color };
    } catch (e) {
      return { move: 'e2e4' };
    }
  }

  async isReady(): Promise<boolean> {
    return this.initialized;
  }

  quit(): void {
    this.initialized = false;
    try {
      fetch('/api/lc0', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'quit' }),
      });
    } catch {}
  }
}

export const lc0Engine = new LC0Engine();