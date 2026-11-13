'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  BOARD_THEME_PRESETS,
  PAGE_THEME_PRESETS,
  STOCKFISH_CONFIG,
  getEloLabel,
  type BoardThemeId,
  type PageThemeId,
} from '@/lib/constants';
import TrainingPanel from '@/components/TrainingPanel';
import NetworkManager from '@/components/NetworkManager';

type ThemeSettings = {
  pageTheme: PageThemeId;
  boardTheme: BoardThemeId;
  boardLight: string;
  boardDark: string;
};

interface ControlPanelProps {
  elo: number;
  onEloChange: (elo: number) => void;
  onNewGame: () => void;
  onTakeback: () => void;
  canTakeback: boolean;
  isThinking: boolean;
  gameResult: string | null;
  playerColor: 'white' | 'black';
  onColorChange: (color: 'white' | 'black') => void;
  engineType: 'stockfish' | 'lc0';
  onEngineChange: (engine: 'stockfish' | 'lc0') => void;
  themeSettings: ThemeSettings;
  onThemeSettingsChange: (settings: Partial<ThemeSettings>) => void;
}

export function ControlPanel({
  elo,
  onEloChange,
  onNewGame,
  onTakeback,
  canTakeback,
  isThinking,
  gameResult,
  playerColor,
  onColorChange,
  engineType,
  onEngineChange,
  themeSettings,
  onThemeSettingsChange,
}: ControlPanelProps) {
  const [showThemeEditor, setShowThemeEditor] = useState(false);

  const handleBoardThemeChange = (boardTheme: BoardThemeId) => {
    if (boardTheme === 'custom') {
      onThemeSettingsChange({ boardTheme });
      return;
    }

    const preset = BOARD_THEME_PRESETS[boardTheme];
    onThemeSettingsChange({
      boardTheme,
      boardLight: preset.light,
      boardDark: preset.dark,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Game Control</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {gameResult && (
          <div className="rounded-lg border-2 border-accent bg-accent/10 p-3">
            <p className="text-center font-semibold text-accent">{gameResult}</p>
          </div>
        )}

        {isThinking && (
          <div className="rounded-lg border-2 border-primary bg-primary/10 p-3">
            <p className="text-center text-sm font-medium text-primary">
              {engineType === 'stockfish' ? 'Stockfish' : 'LC0'} is thinking...
            </p>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium">Play As</label>
          <div className="flex gap-2">
            <Button
              variant={playerColor === 'white' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onColorChange('white')}
              className="flex-1"
            >
              White
            </Button>
            <Button
              variant={playerColor === 'black' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onColorChange('black')}
              className="flex-1"
            >
              Black
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Engine</label>
          <select
            value={engineType}
            onChange={(event) => onEngineChange(event.target.value as 'stockfish' | 'lc0')}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground"
            aria-label="Select engine"
          >
            <option value="stockfish">Stockfish (WASM)</option>
            <option value="lc0">LC0 (Server - optional)</option>
          </select>
          <p className="text-xs text-muted-foreground">
            LC0 requires server mode and a trained network; see the training guide.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <label className="text-sm font-medium">Engine Strength (ELO)</label>
            <div className="text-right">
              <p className="text-lg font-bold text-primary">{elo}</p>
              <p className="text-xs text-muted-foreground">{getEloLabel(elo)}</p>
            </div>
          </div>
          <Slider
            min={STOCKFISH_CONFIG.MIN_ELO}
            max={STOCKFISH_CONFIG.MAX_ELO}
            step={STOCKFISH_CONFIG.ELO_STEP}
            value={[elo]}
            onValueChange={(value) => onEloChange(value[0])}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{STOCKFISH_CONFIG.MIN_ELO}</span>
            <span>{STOCKFISH_CONFIG.MAX_ELO}</span>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-border bg-secondary/20 p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Theme</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowThemeEditor((value) => !value)}
              className="h-8 px-2"
            >
              {showThemeEditor ? 'Hide' : 'Edit'}
            </Button>
          </div>

          <div className="grid gap-2">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="page-theme">
              Page
            </label>
            <select
              id="page-theme"
              value={themeSettings.pageTheme}
              onChange={(event) => onThemeSettingsChange({ pageTheme: event.target.value as PageThemeId })}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              {Object.entries(PAGE_THEME_PRESETS).map(([id, theme]) => (
                <option key={id} value={id}>
                  {theme.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="board-theme">
              Board
            </label>
            <select
              id="board-theme"
              value={themeSettings.boardTheme}
              onChange={(event) => handleBoardThemeChange(event.target.value as BoardThemeId)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              {Object.entries(BOARD_THEME_PRESETS).map(([id, theme]) => (
                <option key={id} value={id}>
                  {theme.label}
                </option>
              ))}
            </select>
          </div>

          {showThemeEditor && (
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-xs font-medium text-muted-foreground">
                Light Square
                <input
                  type="color"
                  value={themeSettings.boardLight}
                  onChange={(event) =>
                    onThemeSettingsChange({
                      boardTheme: 'custom',
                      boardLight: event.target.value,
                    })
                  }
                  className="h-10 w-full rounded-md border border-border bg-background p-1"
                />
              </label>
              <label className="space-y-1 text-xs font-medium text-muted-foreground">
                Dark Square
                <input
                  type="color"
                  value={themeSettings.boardDark}
                  onChange={(event) =>
                    onThemeSettingsChange({
                      boardTheme: 'custom',
                      boardDark: event.target.value,
                    })
                  }
                  className="h-10 w-full rounded-md border border-border bg-background p-1"
                />
              </label>
            </div>
          )}
        </div>

        <div className="space-y-2 pt-2">
          <Button onClick={onNewGame} variant="default" className="w-full" disabled={isThinking}>
            New Game
          </Button>
          <Button
            onClick={onTakeback}
            variant="outline"
            className="w-full"
            disabled={!canTakeback || isThinking}
          >
            Take Back
          </Button>
        </div>

        <TrainingPanel />

        <NetworkManager />

        <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          Low ELO settings include intentional engine mistakes so the bottom of the slider feels playable.
        </div>
      </CardContent>
    </Card>
  );
}
