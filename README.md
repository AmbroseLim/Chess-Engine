# Chess Master - Stockfish Chess Engine UI

A beautiful, fully-typed React + TypeScript chess interface built with Next.js 15, Stockfish WASM, and shadcn/ui styling.

## Features

✨ **Core Features**
- Play against Stockfish chess engine via WASM
- Adjustable ELO rating (800–2800)
- Beautiful chessboard with piece animations
- Move highlights with automatic square highlighting
- Full move history with algebraic notation
- Take back moves functionality
- Play as white or black
- Responsive dark mode support
- Real-time game state management

🎮 **Game Features**
- Automatic checkmate and draw detection
- Piece validation and legal move checking
- Engine thinking indicator
- Game result notifications

🎨 **UI/UX**
- shadcn/ui component style
- Tailwind CSS styling
- Fully responsive design
- Dark mode friendly
- Smooth animations and transitions

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Chess Engine**: Stockfish 16 (WASM)
- **Game Logic**: chess.js
- **UI Components**: react-chessboard, @radix-ui
- **Styling**: Tailwind CSS
- **State Management**: React Hooks

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup

1. **Install dependencies**
```bash
npm install
```

2. **Run development server**
```bash
npm run dev
```

3. **Open in browser**
Navigate to `http://localhost:3000`

### Build for Production
```bash
npm run build
npm start
```

### Build for GitHub Pages (Static Export)
```bash
npm run build:static
```
This creates a static export in the `out/` directory suitable for GitHub Pages deployment.

## Project Structure

```
chess-engine/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/
│   ├── ChessBoard.tsx       # Chessboard component
│   ├── ChessGame.tsx        # Main game component
│   ├── ControlPanel.tsx     # Control panel with settings
│   ├── MoveHistory.tsx      # Move history display
│   └── ui/
│       ├── button.tsx       # Button component
│       ├── card.tsx         # Card components
│       └── slider.tsx       # Slider component
├── lib/
│   ├── stockfish.ts         # Stockfish engine integration
│   └── useChessGame.ts      # Game state management hook
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── postcss.config.js
```

## Component Architecture

### ChessGame (Main Container)
- Orchestrates all components
- Manages game initialization
- Handles player color switching

### ChessBoard
- Displays the chessboard using react-chessboard
- Shows move highlights
- Handles square click interactions
- Displays thinking indicator

### ControlPanel
- ELO slider (800-2800)
- New Game button
- Take Back button
- Player color selection
- Game status display

### MoveHistory
- Displays moves in standard notation
- Shows move numbers
- Scrollable history

## Hooks

### useChessGame
Main game logic hook providing:
- `gameState`: Current game state (chess instance, history, highlights)
- `moveHistory`: Array of moves with notation
- `makeMove(source, target)`: Make a move and trigger engine response
- `takeback()`: Undo last 2 moves (player + engine)
- `resetGame()`: Start new game
- `setEngineElo(elo)`: Change engine difficulty

## Engine Integration

### Stockfish WASM
The engine runs entirely in the browser via WebAssembly:
- No server required
- Fast computation
- Full offline support
- ELO-based difficulty adjustment

### Configuration Options
```typescript
interface StockfishOptions {
  elo?: number;      // 800-2800
  depth?: number;    // Search depth
  time?: number;     // Time limit in ms
}
```

## Styling System

### Tailwind CSS Variables
All colors use CSS custom properties defined in `globals.css`:
- `--background`: Main background color
- `--foreground`: Main text color
- `--primary`: Primary action color
- `--secondary`: Secondary elements
- `--accent`: Highlight color
- `--muted`: Disabled/secondary text
- `--border`: Border color

### Dark Mode
Dark mode is automatically supported via the `.dark` class. Theme can be switched by adding/removing the `dark` class to the root HTML element.

## Usage Example

```typescript
import { ChessGame } from '@/components/ChessGame';

export default function Home() {
  return <ChessGame />;
}
```

## Keyboard Shortcuts
- Click squares to select and move pieces
- Use Take Back button to undo moves
- Adjust difficulty with ELO slider

## Performance Optimization

- Stockfish runs in a Web Worker (WASM)
- React Hooks for efficient re-renders
- Memoized components prevent unnecessary updates
- Async/await for non-blocking engine computation

## Browser Support

- Chrome/Edge 91+
- Firefox 89+
- Safari 15+
- Opera 77+

(WebAssembly support required)

## Known Limitations

- Single-player only (vs Stockfish)
- Network play not implemented
- Puzzles/tutorials not included
- Chess.js limitations for en passant handling in some edge cases

## Future Enhancements

- [ ] Online multiplayer
- [ ] Game analysis
- [ ] Opening book
- [ ] Endgame tablebases
- [ ] Move suggestions
- [ ] Replay saved games
- [ ] Tournament mode
- [ ] Chess puzzle integration

## Troubleshooting

### Stockfish not initializing
- Check browser WebAssembly support
- Clear browser cache and reload
- Check browser console for errors

### Slow move calculation
- Reduce ELO rating (easier levels use less computation)
- Increase search depth in engine settings
- Check CPU usage

### Moves not registering
- Ensure you're playing with correct color
- Wait for engine to finish thinking (check indicator)
- Verify legal move according to chess rules

## Dependencies

### Production
- `react` - UI library
- `next` - React framework
- `chess.js` - Chess logic
- `react-chessboard` - Chessboard component
- `@stockfish/wasm` - Chess engine
- `@radix-ui/*` - UI primitives
- `tailwindcss` - Styling
- `clsx` - Class utilities

### Development
- `typescript` - Type safety
- `tailwindcss` - CSS framework
- `autoprefixer` - CSS processing

## GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages via GitHub Actions.

### Automatic Deployment (Recommended)

1. Push this repository to GitHub
2. Go to **Settings** → **Pages** in your GitHub repository
3. Under **Build and deployment**, select **GitHub Actions** as the source
4. The workflow in `.github/workflows/deploy-pages.yml` will automatically build and deploy on every push to `main`/`master`

The site will be available at `https://<your-username>.github.io/<repository-name>/`

### Manual Deployment

```bash
# Build static export
npm run build:static

# Deploy the `out/` directory to any static hosting:
# - GitHub Pages (push `out/` contents to `gh-pages` branch)
# - Netlify (drag and drop `out/` folder)
# - Vercel (import project)
# - Firebase Hosting
# - Any static file server
```

## License

MIT License - Feel free to use this for personal or commercial projects.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the code comments
3. Check the console for error messages

## Credits

Built with:
- **Stockfish** - Open-source chess engine
- **chess.js** - Chess game logic
- **react-chessboard** - React chessboard
- **shadcn/ui** - Component patterns
- **Tailwind CSS** - Utility-first CSS

---

### Server-side native Stockfish (optional)

To use a native Stockfish engine (stronger than the in-browser WASM), install Stockfish on the server and enable the server engine:

1. Install Stockfish and ensure the `stockfish` binary is on PATH (or place the executable where the server can spawn it).
   - Linux: `apt install stockfish` or download a prebuilt binary
   - Windows: download `stockfish.exe` and add its folder to PATH
2. Enable the server engine by adding `NEXT_PUBLIC_USE_SERVER_ENGINE=true` to `.env.local` and restarting the dev server.
3. The app exposes `POST /api/engine` — the client will call this when server engine mode is enabled. Adjust `threads`/`hash` via the API payload or environment as needed.

Note: Training Stockfish to an Elo &gt;5000 is not feasible. To increase playing strength, run native Stockfish on stronger hardware and increase search depth/time.

---

**Happy chess playing! ♟️**
