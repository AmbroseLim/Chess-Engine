'use client';

import React, { useEffect, useState } from 'react';
import { ChessBoard } from '@/components/ChessBoard';
import { ControlPanel } from '@/components/ControlPanel';
import { MoveHistory } from '@/components/MoveHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useChessGame } from '@/lib/useChessGame';
import { stockfishEngine } from '@/lib/stockfish';
import { lc0Engine } from '@/lib/lc0';
import {
  BOARD_THEME_PRESETS,
  PAGE_THEME_PRESETS,
  UI_CONFIG,
  type BoardThemeId,
  type PageThemeId,
} from '@/lib/constants';

type ThemeSettings = {
  pageTheme: PageThemeId;
  boardTheme: BoardThemeId;
  boardLight: string;
  boardDark: string;
};

const THEME_STORAGE_KEY = 'chess-master-theme-settings';

function getInitialThemeSettings(): ThemeSettings {
  const fallback = BOARD_THEME_PRESETS.midnight;
  const defaults: ThemeSettings = {
    pageTheme: 'dark',
    boardTheme: 'midnight',
    boardLight: fallback.light,
    boardDark: fallback.dark,
  };

  if (typeof window === 'undefined') return defaults;

  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (!saved) return defaults;

    const parsed = JSON.parse(saved) as Partial<ThemeSettings>;
    return {
      pageTheme: parsed.pageTheme && parsed.pageTheme in PAGE_THEME_PRESETS ? parsed.pageTheme : defaults.pageTheme,
      boardTheme: parsed.boardTheme && parsed.boardTheme in BOARD_THEME_PRESETS ? parsed.boardTheme : defaults.boardTheme,
      boardLight: parsed.boardLight || defaults.boardLight,
      boardDark: parsed.boardDark || defaults.boardDark,
    };
  } catch {
    return defaults;
  }
}

export function ChessGame() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white');
  const [engineType, setEngineType] = useState<'stockfish' | 'lc0'>('stockfish');
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(getInitialThemeSettings);

  const {
    gameState,
    moveHistory,
    makeMove,
    takeback,
    resetGame,
    engineElo,
    setEngineElo,
  } = useChessGame(playerColor === 'white' ? 'w' : 'b', 1600, engineType);

  const isPlayersTurn = gameState.chess.turn() === (playerColor === 'white' ? 'w' : 'b');

  const selectedBoardPreset = BOARD_THEME_PRESETS[themeSettings.boardTheme];
  const boardTheme = {
    light: themeSettings.boardTheme === 'custom' ? themeSettings.boardLight : selectedBoardPreset.light,
    dark: themeSettings.boardTheme === 'custom' ? themeSettings.boardDark : selectedBoardPreset.dark,
    highlight: selectedBoardPreset.highlight,
    selected: selectedBoardPreset.selected,
  };

  useEffect(() => {
    const root = document.documentElement;
    const selectedPageTheme = PAGE_THEME_PRESETS[themeSettings.pageTheme];

    Object.values(PAGE_THEME_PRESETS).forEach((theme) => {
      root.classList.remove(theme.className);
    });

    root.classList.add(selectedPageTheme.className);
    root.classList.toggle('dark', selectedPageTheme.isDark);

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(themeSettings));
    } catch {}
  }, [themeSettings]);

  // Initialize selected engine
  useEffect(() => {
    let cancelled = false;

    const initEngine = async () => {
      try {
        if (engineType === 'stockfish') {
          await stockfishEngine.init();
        } else {
          await lc0Engine.init();
        }

        try {
          await setEngineElo(engineElo);
        } catch (e) {
          console.warn('Failed to set engine elo after init', e);
        }

        if (!cancelled) setIsInitialized(true);
      } catch (error) {
        console.error(`Failed to initialize ${engineType} engine:`, error);
      }
    };

    (async () => {
      try {
        if (engineType === 'stockfish') {
          lc0Engine.quit();
        } else {
          stockfishEngine.quit();
        }
      } catch {}
      initEngine();
    })();

    return () => {
      cancelled = true;
      setIsInitialized(false);
      try {
        if (engineType === 'stockfish') stockfishEngine.quit();
        else lc0Engine.quit();
      } catch {}
    };
  }, [engineType]);

  // Handle player color change
  const handlePlayerColorChange = (color: 'white' | 'black') => {
    setPlayerColor(color);
  };

  return (
    <div className="min-h-screen bg-background p-4 text-foreground transition-colors duration-300 md:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
          <h1 className="text-4xl font-bold text-foreground">Chess Master</h1>
          <p className="mt-2 text-muted-foreground">
            Play chess against {engineType === 'stockfish' ? 'Stockfish' : 'LC0'} with adjustable difficulty
          </p>
          </div>
          <div className="rounded-md border border-border bg-secondary px-3 py-2 text-sm text-secondary-foreground">
            {PAGE_THEME_PRESETS[themeSettings.pageTheme].label} / {BOARD_THEME_PRESETS[themeSettings.boardTheme].label}
          </div>
        </div>

        {!isInitialized && (
          <div className="mb-4 rounded-md border border-accent/30 bg-accent/10 p-3 text-sm text-foreground">
            Initializing {engineType === 'stockfish' ? 'Stockfish' : 'LC0'} engine... This may take a moment.
          </div>
        )}

        {/* Main Game Layout */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Chessboard Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {playerColor === 'white' ? 'White' : 'Black'} to move
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ChessBoard
                  fen={gameState.chess.fen()}
                  onMove={makeMove}
                  highlights={gameState.highlights}
                  isThinking={gameState.isThinking}
                  playerColor={playerColor}
                  isPlayersTurn={isPlayersTurn}
                  customBoardStyle={{
                    maxWidth: '640px',
                    minWidth: '280px',
                    width: '100%',
                  }}
                  boardTheme={boardTheme}
                  animationDuration={UI_CONFIG.ANIMATION_DURATION}
                />
              </CardContent>
            </Card>

            {/* Move History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Move History</CardTitle>
              </CardHeader>
              <CardContent>
                <MoveHistory moves={moveHistory} />
              </CardContent>
            </Card>
          </div>

          {/* Control Panel */}
          <div>
            <ControlPanel
              elo={engineElo}
              onEloChange={setEngineElo}
              onNewGame={resetGame}
              onTakeback={takeback}
              canTakeback={gameState.history.length > 0}
              isThinking={gameState.isThinking}
              gameResult={gameState.result}
              playerColor={playerColor}
              onColorChange={handlePlayerColorChange}
              engineType={engineType}
              onEngineChange={(e) => setEngineType(e)}
              themeSettings={themeSettings}
              onThemeSettingsChange={(next) => setThemeSettings((current) => ({ ...current, ...next }))}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 rounded-lg border border-border bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
          <p>
            Powered by{' '}
            <span className="font-semibold text-foreground">Stockfish 16</span> and{' '}
            <span className="font-semibold text-foreground">chess.js</span>
          </p>
        </div>
      </div>
    </div>
  );
}
