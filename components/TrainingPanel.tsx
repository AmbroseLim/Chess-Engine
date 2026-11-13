'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { STOCKFISH_CONFIG } from '@/lib/constants';

type TrainingMode = 'simulated' | 'autogtp';

type TrainingHistoryItem = {
  step: number;
  elo: number;
  score: number;
  elapsed?: number;
};

export default function TrainingPanel() {
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState<TrainingMode>('simulated');
  const [targetElo, setTargetElo] = useState<number>(3000);
  const [steps, setSteps] = useState<number>(100);
  const [activeSteps, setActiveSteps] = useState<number | null>(null);
  const [history, setHistory] = useState<TrainingHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function fetchStatus() {
    try {
      const resp = await fetch('/api/train');
      const json = await resp.json();
      setRunning(!!json.running);
      setActiveSteps(typeof json.steps === 'number' ? json.steps : null);
      setHistory(Array.isArray(json.history) ? json.history : []);
      setMessage(json.error ? String(json.error) : null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    }
  }

  useEffect(() => {
    fetchStatus();
    const id = window.setInterval(fetchStatus, 3000);
    return () => window.clearInterval(id);
  }, []);

  async function start() {
    setLoading(true);
    setMessage(null);

    try {
      const resp = await fetch('/api/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, targetElo, steps }),
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || 'Training failed to start');

      setRunning(true);
      setActiveSteps(steps);
      await fetchStatus();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  }

  async function stop() {
    setLoading(true);
    setMessage(null);

    try {
      const resp = await fetch('/api/train', { method: 'DELETE' });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || 'Training failed to stop');

      setRunning(false);
      await fetchStatus();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  }

  const last = history.length > 0 ? history[history.length - 1] : null;
  const expectedSteps = activeSteps || steps;
  const progress = useMemo(() => {
    if (!last || expectedSteps <= 0) return 0;
    return Math.min(100, Math.round((last.step / expectedSteps) * 100));
  }, [expectedSteps, last]);

  return (
    <div className="space-y-3 rounded-lg border border-border bg-secondary/20 p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Training</p>
          <p className="text-xs text-muted-foreground">{running ? 'Running' : 'Idle'}</p>
        </div>
        <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="training-mode">
          Mode
        </label>
        <select
          id="training-mode"
          value={mode}
          onChange={(event) => setMode(event.target.value as TrainingMode)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          disabled={running || loading}
        >
          <option value="simulated">Simulation</option>
          <option value="autogtp">AutoGTP</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1 text-xs font-medium text-muted-foreground">
          Target ELO
          <input
            type="number"
            min={STOCKFISH_CONFIG.MIN_ELO}
            max={STOCKFISH_CONFIG.MAX_ELO}
            value={targetElo}
            onChange={(event) => setTargetElo(Number(event.target.value))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
            disabled={running || loading}
          />
        </label>
        <label className="space-y-1 text-xs font-medium text-muted-foreground">
          Steps
          <input
            type="number"
            min={1}
            max={5000}
            value={steps}
            onChange={(event) => setSteps(Number(event.target.value))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground"
            disabled={running || loading}
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button onClick={start} disabled={running || loading} size="sm">
          Start
        </Button>
        <Button onClick={stop} disabled={!running || loading} variant="outline" size="sm">
          Stop
        </Button>
      </div>

      <div className="space-y-1 text-xs text-muted-foreground">
        {last ? (
          <p>
            Last step: {last.step} / {expectedSteps} | ELO tested: {last.elo} | Score: {last.score.toFixed(2)}
          </p>
        ) : (
          <p>No training history yet.</p>
        )}
        {message && <p className="text-destructive">{message}</p>}
      </div>
    </div>
  );
}
