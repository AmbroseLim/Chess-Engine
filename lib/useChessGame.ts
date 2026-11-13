'use client';

import { useState, useCallback, useRef } from 'react';
import { Chess, Move, Square } from 'chess.js';
import { stockfishEngine } from '@/lib/stockfish';
import { lc0Engine } from '@/lib/lc0';
import { getDepthForElo, getLowEloMoveNoise, getThinkingTimeForElo } from '@/lib/constants';

export interface GameState {
  chess: Chess;
  history: string[];
  highlights: { from?: Square; to?: Square };
  isThinking: boolean;
  gameOver: boolean;
  result: string | null;
}

function createMoveObject(from: Square, to: Square, chess: Chess) {
  const moves = chess.moves({ square: from, verbose: true }) as Array<{
    from: Square;
    to: Square;
    promotion?: string;
  }>;

  if (!moves || moves.length === 0) {
    return null;
  }

  const exactMove = moves.find((move) => move.to === to);
  if (!exactMove) {
    return null;
  }

  return {
    from: exactMove.from,
    to: exactMove.to,
    ...(exactMove.promotion ? { promotion: exactMove.promotion } : {}),
  };
}

function moveToUci(move: Move): string {
  return `${move.from}${move.to}${move.promotion || ''}`;
}

function getSimpleMoveScore(move: Move): number {
  const pieceValues: Record<string, number> = {
    p: 1,
    n: 3,
    b: 3,
    r: 5,
    q: 9,
    k: 0,
  };

  let score = 0;
  if (move.captured) score += pieceValues[move.captured] || 0;
  if (move.promotion) score += pieceValues[move.promotion] || 0;
  if (move.san.includes('+')) score += 1;
  if (move.san.includes('#')) score += 20;
  if (move.san === 'O-O' || move.san === 'O-O-O') score += 1;
  return score;
}

function addLowEloMistakes(chess: Chess, bestMove: string | undefined, elo: number): string | undefined {
  const legalMoves = chess.moves({ verbose: true }) as Move[];
  if (legalMoves.length === 0 || !bestMove) return bestMove;

  const { randomMoveChance, inaccuracyChance } = getLowEloMoveNoise(elo);
  const roll = Math.random();

  if (roll > randomMoveChance + inaccuracyChance) {
    return bestMove;
  }

  if (roll <= randomMoveChance) {
    return moveToUci(legalMoves[Math.floor(Math.random() * legalMoves.length)]);
  }

  const quieterMoves = [...legalMoves].sort((a, b) => getSimpleMoveScore(a) - getSimpleMoveScore(b));
  const poolSize = Math.max(1, Math.ceil(quieterMoves.length * 0.45));
  return moveToUci(quieterMoves[Math.floor(Math.random() * poolSize)]);
}

export interface MoveRecord {
  moveNumber: number;
  white: string;
  black: string | null;
}

export function useChessGame(
  playerColor: 'w' | 'b' = 'w',
  elo: number = 1600,
  engineType: 'stockfish' | 'lc0' = 'stockfish'
) {
  const chessRef = useRef(new Chess());
  const [gameState, setGameState] = useState<GameState>({
    chess: chessRef.current,
    history: [],
    highlights: {},
    isThinking: false,
    gameOver: false,
    result: null,
  });

  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [engineElo, setEngineElo] = useState(elo);

  const makeMove = useCallback(
    async (source: Square, target: Square) => {
      const chess = chessRef.current;

      try {
        const moveObject = createMoveObject(source, target, chess);
        if (!moveObject) {
          return false;
        }

        const move = chess.move(moveObject);
        if (!move) return false;

        const updatedHistory = [...gameState.history, move.san];
        setGameState((prev) => ({
          ...prev,
          chess,
          history: updatedHistory,
          highlights: { from: source, to: target },
        }));

        // Update move history
        const moveNum = Math.floor(updatedHistory.length / 2);
        if (updatedHistory.length % 2 === 1) {
          setMoveHistory((prev) => [
            ...prev,
            { moveNumber: moveNum + 1, white: move.san, black: null },
          ]);
        } else {
          setMoveHistory((prev) => {
            const updated = [...prev];
            updated[updated.length - 1].black = move.san;
            return updated;
          });
        }

        // Check for game end
        if (chess.isCheckmate()) {
          setGameState((prev) => ({
            ...prev,
            gameOver: true,
            result: `Checkmate! ${chess.turn() === 'w' ? 'Black' : 'White'} wins`,
          }));
          return true;
        }

        if (chess.isDraw()) {
          setGameState((prev) => ({
            ...prev,
            gameOver: true,
            result: 'Draw',
          }));
          return true;
        }

        // Engine's turn if player just moved
        if (chess.turn() !== playerColor) {
          setGameState((prev) => ({ ...prev, isThinking: true }));

          const depth = getDepthForElo(engineElo);
          const movetime = getThinkingTimeForElo(engineElo);

          try {
            let bestMove;
            const useServer = process.env.NEXT_PUBLIC_USE_SERVER_ENGINE === 'true';
            if (useServer && engineType === 'lc0') {
              try {
                const resp = await fetch('/api/lc0', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'bestmove', fen: chess.fen(), options: { elo: engineElo, depth, time: movetime }, color: chess.turn() }),
                });
                const json = await resp.json();
                
                if (json && json.move) {
                  bestMove = { move: json.move };
                } else {
                  bestMove = await lc0Engine.getBestMove(chess.fen(), { elo: engineElo, depth, time: movetime });
                }
              } catch (e) {
                console.error('LC0 server error, falling back to client:', e);
                bestMove = await lc0Engine.getBestMove(chess.fen(), { elo: engineElo, depth, time: movetime });
              }
            } else {
              bestMove = await stockfishEngine.getBestMove(chess.fen(), {
                elo: engineElo,
                depth,
                time: movetime,
              });
            }

            // Ultimate safety net: If engine fails to produce a move format, find a random valid legal move
            if (!bestMove || !bestMove.move) {
              const legalMoves = chess.moves({ verbose: true });
              if (legalMoves.length > 0) {
                const randomMove = legalMoves[0];
                bestMove = { 
                  move: randomMove.from + randomMove.to + (randomMove.promotion || '') 
                };
              } else {
                setGameState((prev) => ({ ...prev, isThinking: false }));
                return false;
              }
            }

            const engineMoveUci = addLowEloMistakes(chess, bestMove.move, engineElo) || bestMove.move;
            const fromSquare = engineMoveUci.substring(0, 2) as Square;
            const toSquare = engineMoveUci.substring(2, 4) as Square;
            const promotionPiece = engineMoveUci.length === 5 ? engineMoveUci.substring(4, 5) : undefined;

            const engineMove = chess.move({
              from: fromSquare,
              to: toSquare,
              ...(promotionPiece && { promotion: promotionPiece })
            });

            if (engineMove) {
              const finalHistory = [...updatedHistory, engineMove.san];
              setGameState((prev) => ({
                ...prev,
                chess,
                history: finalHistory,
                highlights: {
                  from: fromSquare,
                  to: toSquare,
                },
                isThinking: false,
                gameOver: chess.isCheckmate() || chess.isDraw(),
                result: chess.isCheckmate()
                  ? `Checkmate! ${chess.turn() === 'w' ? 'Black' : 'White'} wins`
                  : chess.isDraw()
                    ? 'Draw'
                    : null,
              }));

              // Update move history
              const finalMoveNum = Math.floor(finalHistory.length / 2);
              setMoveHistory((prev) => {
                const updated = [...prev];
                if (finalHistory.length % 2 === 0) {
                  updated[updated.length - 1].black = engineMove.san;
                } else {
                  updated.push({
                    moveNumber: finalMoveNum + 1,
                    white: engineMove.san,
                    black: null,
                  });
                }
                return updated;
              });
            }
          } catch (error) {
            console.error('Engine error:', error);
            setGameState((prev) => ({ ...prev, isThinking: false }));
          }
        }

        return true;
      } catch (error) {
        console.error('Move error:', error);
        return false;
      }
    },
    [gameState.history, playerColor, engineElo, engineType]
  );

  const takeback = useCallback(() => {
    if (gameState.history.length === 0) return;

    const chess = chessRef.current;
    chess.undo();

    if (gameState.history.length > 1) {
      chess.undo();
    }

    const newHistory = gameState.history.slice(0, -2);
    setGameState((prev) => ({
      ...prev,
      history: newHistory,
      highlights: {},
      gameOver: false,
      result: null,
    }));

    // Update move history
    const newMoveHistory = moveHistory.slice(
      0,
      Math.floor(newHistory.length / 2)
    );
    setMoveHistory(newMoveHistory);
  }, [gameState.history, moveHistory]);

  const resetGame = useCallback(async () => {
    chessRef.current = new Chess();
    setGameState({
      chess: chessRef.current,
      history: [],
      highlights: {},
      isThinking: false,
      gameOver: false,
      result: null,
    });
    setMoveHistory([]);
  }, []);

  const handleEloChange = useCallback(
    async (newElo: number) => {
      setEngineElo(newElo);
      if (engineType === 'lc0') {
        await lc0Engine.setElo(newElo);
      } else {
        await stockfishEngine.setElo(newElo);
      }
    },
    [engineType]
  );

  return {
    gameState,
    moveHistory,
    makeMove,
    takeback,
    resetGame,
    engineElo,
    setEngineElo: handleEloChange,
  };
}
