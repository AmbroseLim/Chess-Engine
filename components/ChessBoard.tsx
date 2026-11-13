'use client';

import React, { useCallback, useMemo, useState, useLayoutEffect, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, Square } from 'chess.js';
import { UI_CONFIG } from '@/lib/constants';

export interface ChessBoardTheme {
  light: string;
  dark: string;
  highlight: string;
  selected: string;
}

interface ChessBoardProps {
  fen: string;
  onMove: (source: Square, target: Square) => Promise<boolean>;
  highlights?: { from?: Square; to?: Square };
  isThinking?: boolean;
  playerColor?: 'white' | 'black';
  isPlayersTurn?: boolean;
  customBoardStyle?: React.CSSProperties;
  boardTheme?: ChessBoardTheme;
  animationDuration?: number;
}

export function ChessBoard({
  fen,
  onMove,
  highlights,
  isThinking = false,
  playerColor = 'white',
  isPlayersTurn = true,
  customBoardStyle,
  boardTheme = {
    light: '#d9dece',
    dark: '#435448',
    highlight: 'rgba(72, 187, 120, 0.34)',
    selected: 'rgba(245, 158, 11, 0.36)',
  },
  animationDuration = UI_CONFIG.ANIMATION_DURATION,
}: ChessBoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);

  const getBoardOrientation = useCallback(() => {
    return playerColor === 'black' ? 'black' : 'white';
  }, [playerColor]);

  const getLegalTargets = useCallback(
    (square: Square) => {
      try {
        const chess = new Chess(fen);
        return (chess.moves({ square, verbose: true }) as Array<{ to: Square }>).map((move) => move.to);
      } catch {
        return [];
      }
    },
    [fen]
  );

  const isLegalMove = useCallback(
    (source: Square, target: Square) => {
      try {
        const chess = new Chess(fen);
        return (chess.moves({ square: source, verbose: true }) as Array<{ to: Square }>).some(
          (move) => move.to === target
        );
      } catch {
        return false;
      }
    },
    [fen]
  );

  const handleSquareClick = useCallback(
    async (square: Square) => {
      if (isThinking || !isPlayersTurn) return;

      if (!selectedSquare) {
        setSelectedSquare(square);
        setLegalMoves(getLegalTargets(square));
        return;
      }

      if (selectedSquare === square) {
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      const success = await onMove(selectedSquare, square);
      if (success) {
        setSelectedSquare(null);
        setLegalMoves([]);
      } else {
        setSelectedSquare(square);
        setLegalMoves(getLegalTargets(square));
      }
    },
    [selectedSquare, onMove, isThinking, isPlayersTurn, getLegalTargets]
  );

  const handlePieceDrop = useCallback(
    (source: Square, target: Square) => {
      if (isThinking || !isPlayersTurn) return false;
      if (!isLegalMove(source, target)) {
        setSelectedSquare(source);
        setLegalMoves(getLegalTargets(source));
        return false;
      }

      onMove(source, target).then((success) => {
        if (success) {
          setSelectedSquare(null);
          setLegalMoves([]);
        } else {
          setSelectedSquare(target);
          setLegalMoves(getLegalTargets(target));
        }
      });

      return true;
    },
    [isThinking, onMove, isPlayersTurn, isLegalMove, getLegalTargets]
  );

  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};

    // Highlight move
    if (highlights?.from) {
      styles[highlights.from] = {
        backgroundColor: boardTheme.highlight,
        boxShadow: 'inset 0 0 0 2px rgba(255, 255, 255, 0.36)',
      };
    }
    if (highlights?.to) {
      styles[highlights.to] = {
        backgroundColor: boardTheme.highlight,
        boxShadow: 'inset 0 0 0 2px rgba(255, 255, 255, 0.36)',
      };
    }

    legalMoves.forEach((square) => {
      styles[square] = {
        ...styles[square],
        backgroundImage: 'radial-gradient(circle, rgba(18, 24, 20, 0.42) 18%, transparent 20%)',
      };
    });

    // Highlight selected square
    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: boardTheme.selected,
        boxShadow: 'inset 0 0 0 2px rgba(255, 255, 255, 0.48)',
      };
    }

    return styles;
  }, [boardTheme.highlight, boardTheme.selected, highlights, legalMoves, selectedSquare]);

  const boardStyle: React.CSSProperties = {
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: boardTheme.dark,
    boxShadow: '0 18px 50px rgba(0, 0, 0, 0.28)',
    opacity: isThinking ? 0.7 : 1,
    pointerEvents: isThinking ? 'none' : 'auto',
    transition: 'opacity 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
    width: '100%',
    ...customBoardStyle,
  };

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [computedBoardWidth, setComputedBoardWidth] = useState<number>(() => {
    if (typeof window === 'undefined') return 560;
    return Math.max(280, Math.min(560, window.innerWidth - 96));
  });

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const compute = () => {
      const containerWidth = Math.max(120, el.clientWidth || 0);
      let parsedMax: number | undefined = undefined;
      let parsedMin: number | undefined = undefined;

      if (customBoardStyle && (customBoardStyle as any).maxWidth !== undefined) {
        const mw = (customBoardStyle as any).maxWidth;
        if (typeof mw === 'string') {
          const parsed = parseInt(mw.replace('px', ''), 10);
          if (!isNaN(parsed)) parsedMax = parsed;
        } else if (typeof mw === 'number') {
          parsedMax = mw;
        }
      }
      if (customBoardStyle && (customBoardStyle as any).minWidth !== undefined) {
        const mw = (customBoardStyle as any).minWidth;
        if (typeof mw === 'string') {
          const parsed = parseInt(mw.replace('px', ''), 10);
          if (!isNaN(parsed)) parsedMin = parsed;
        } else if (typeof mw === 'number') {
          parsedMin = mw;
        }
      }

      const maxW = parsedMax && parsedMax > 0 ? parsedMax : Math.min(containerWidth, 640);
      const minW = parsedMin && parsedMin > 0 ? parsedMin : 280;
      const newWidth = Math.min(Math.max(minW, Math.min(containerWidth, maxW)), 640);
      setComputedBoardWidth((previous) => (previous === newWidth ? previous : newWidth));
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [customBoardStyle]);

  const containerWidthStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '100%',
  };

  return (
    <div className="relative" ref={containerRef} style={containerWidthStyle}>
      <div style={boardStyle}>
        <Chessboard
          position={fen}
          onSquareClick={handleSquareClick}
          onPieceDrop={handlePieceDrop}
          boardOrientation={getBoardOrientation()}
          customSquareStyles={customSquareStyles}
          customLightSquareStyle={{ backgroundColor: boardTheme.light }}
          customDarkSquareStyle={{ backgroundColor: boardTheme.dark }}
          customDropSquareStyle={{ boxShadow: 'inset 0 0 0 4px rgba(255, 255, 255, 0.52)' }}
          customNotationStyle={{ color: 'rgba(18, 24, 20, 0.72)', fontWeight: 700 }}
          arePiecesDraggable={!isThinking && isPlayersTurn}
          areArrowsAllowed={true}
          customArrows={[]}
          boardWidth={computedBoardWidth}
          animationDuration={animationDuration}
          autoPromoteToQueen={true}
          snapToCursor={true}
          showBoardNotation={true}
        />
      </div>
      {isThinking && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm font-medium text-muted-foreground">Engine thinking...</p>
          </div>
        </div>
      )}
    </div>
  );
}
