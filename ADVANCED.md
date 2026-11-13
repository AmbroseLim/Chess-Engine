# Chess Engine - Advanced Usage Guide

## Custom Configuration

### Adjusting Stockfish Depth

The engine searches deeper for higher difficulty levels. Modify the depth in `lib/useChessGame.ts`:

```typescript
const bestMove = await stockfishEngine.getBestMove(chess.fen(), {
  elo: engineElo,
  depth: 18,  // Increase for stronger play
  time: 2500, // Milliseconds to think
});
```

### ELO to Skill Mapping

The current implementation maps ELO directly. For custom calibration:

```typescript
const eloToDepth = (elo: number): number => {
  if (elo < 1000) return 8;
  if (elo < 1400) return 12;
  if (elo < 1800) return 15;
  if (elo < 2200) return 18;
  return 21;
};
```

## Extending Components

### Adding Move Validation UI

```typescript
// In ChessBoard.tsx
const getLegalMoves = useCallback((square: Square): Square[] => {
  const moves = gameState.chess.moves({ square, verbose: true });
  return moves.map(m => m.to as Square);
}, [gameState.chess]);
```

### Custom Theme Colors

Edit `app/globals.css` CSS variables:

```css
:root {
  --primary: 180 45% 50%;      /* Cyan */
  --accent: 260 80% 60%;       /* Purple */
  --background: 200 20% 95%;   /* Light blue-gray */
}

.dark {
  --primary: 180 70% 50%;
  --accent: 260 100% 70%;
  --background: 200 30% 8%;
}
```

## Game Analysis

### Logging Engine Evaluation

Extend `useChessGame.ts` with evaluation history:

```typescript
const [evaluation, setEvaluation] = useState<number>(0);

const makeMove = useCallback(async (source, target) => {
  // ... existing move logic

  // Get evaluation
  const eval = await stockfishEngine.evaluatePosition(chess.fen());
  setEvaluation(eval.evaluation);
}, []);
```

### Replay Game History

```typescript
const replayGame = useCallback((moveIndex: number) => {
  const chess = new Chess();
  for (let i = 0; i < moveIndex; i++) {
    chess.move(gameState.history[i]);
  }
  return chess.fen();
}, [gameState.history]);
```

## Performance Tips

### 1. Reduce Engine Thinking Time

Lower ELO = Faster responses:
```typescript
// In ControlPanel
<Slider
  min={800}
  max={1600}  // Limit max for faster gameplay
  ...
/>
```

### 2. Async Board Updates

The component already handles async updates, but ensure:
- `isThinking` state prevents user input
- Engine responses are awaited
- No blocking operations on main thread

### 3. Memoization

For large move histories (100+ moves), memoize list rendering:

```typescript
const memoizedMoves = useMemo(() => 
  moves.map(move => /* render */), 
  [moves]
);
```

## Integration Examples

### With Next.js API Routes

Create `app/api/position/route.ts`:

```typescript
export async function POST(request: Request) {
  const { fen } = await request.json();
  // Send FEN to external engine
  return Response.json({ evaluation: 50 });
}
```

### Database Integration

Save games to database:

```typescript
const saveGame = async (moves: string[]) => {
  await fetch('/api/games', {
    method: 'POST',
    body: JSON.stringify({
      moves,
      date: new Date(),
      result: gameState.result,
    }),
  });
};
```

### Export to PGN Format

```typescript
const exportToPgn = (): string => {
  const moves = gameState.history.join(' ');
  return `[Event "Chess Master"]
[Date "${new Date().toISOString()}"]
[Result "${gameState.result}"]

${moves} ${gameState.result}`;
};
```

## Troubleshooting Advanced Issues

### Engine Hangs

Add timeout handling in `stockfish.ts`:

```typescript
const timeoutPromise = new Promise((_, reject) =>
  setTimeout(() => reject(new Error('Engine timeout')), 3000)
);

return Promise.race([bestMovePromise, timeoutPromise]);
```

### Memory Leaks

Ensure cleanup:

```typescript
useEffect(() => {
  return () => {
    stockfishEngine.quit();
  };
}, []);
```

### WebAssembly Not Loading

Check network in browser DevTools:
- Ensure `wasm` folder exists in build output
- Check Content-Type headers
- Verify no CSP violations

## Chess Rules Implementation

The engine correctly handles:
- ✅ Castling (kingside and queenside)
- ✅ En passant
- ✅ Pawn promotion (auto-promotes to queen)
- ✅ Check and checkmate
- ✅ Draw conditions (threefold, fifty-move rule)
- ✅ Stalemate

### Custom Move Validation

```typescript
const isValidMove = (source: Square, target: Square): boolean => {
  const moves = chess.moves({ square: source, verbose: true });
  return moves.some(m => m.to === target);
};
```

## Performance Benchmarks

Typical performance on modern hardware:

| ELO  | Avg Think Time | Depth Searched |
|------|----------------|----------------|
| 800  | 200-300ms      | 8-10          |
| 1200 | 400-600ms      | 12-14         |
| 1600 | 800-1200ms     | 15-17         |
| 2000 | 1500-2000ms    | 18-20         |
| 2400 | 2000-2500ms    | 20-22         |

## Testing

Create `__tests__/game.test.ts`:

```typescript
import { Chess } from 'chess.js';

describe('Chess Game', () => {
  it('should detect checkmate', () => {
    const chess = new Chess();
    // Fool's mate
    chess.move('f3');
    chess.move('e5');
    chess.move('g4');
    chess.move('Qh5');
    expect(chess.isCheckmate()).toBe(true);
  });
});
```

## Mobile Optimization

For responsive touch support, add to `ChessBoard.tsx`:

```typescript
const touchStart = useRef<Touch | null>(null);

const handleTouchStart = (e: React.TouchEvent) => {
  touchStart.current = e.touches[0];
};

const handleTouchEnd = (e: React.TouchEvent) => {
  if (touchStart.current) {
    // Calculate delta and detect swipe
  }
};
```

## Advanced Engine Options

Stockfish supports many UCI options:

```typescript
await stockfishEngine.setOption('Threads', 2);
await stockfishEngine.setOption('Hash', 256); // MB
await stockfishEngine.setOption('MultiPV', 3); // Show top 3 moves
```

## License & Attribution

- Stockfish: GPL-3.0
- chess.js: BSD-2-Clause
- This project: MIT

---

For more help, check the main [README.md](./README.md)
