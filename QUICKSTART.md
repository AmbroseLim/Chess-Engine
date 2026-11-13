# Quick Start Guide - Chess Master

## 🚀 Get Up and Running in 2 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open Browser
Navigate to **http://localhost:3000**

✅ You're ready to play chess!

---

## 🎮 How to Play

### Basic Controls
1. **Move pieces** - Click and drag or click to select, click target
2. **Adjust difficulty** - Use ELO slider (800-2800)
3. **Play as white or black** - Select using buttons
4. **Take back moves** - Click "Take Back" button
5. **Start new game** - Click "New Game" button

### Difficulty Levels
- **800-1000** - Beginner (learns quickly)
- **1200-1400** - Intermediate (decent opponent)
- **1600-1800** - Advanced (challenging)
- **2000-2200** - Master (very difficult)
- **2400-2800** - Grandmaster (nearly impossible)

---

## 📁 Project Structure Overview

```
components/         UI Components
├── ChessBoard      Displays the board
├── ChessGame       Main game component
├── ControlPanel    Settings & buttons
├── MoveHistory     Move list
└── ui/             Reusable UI components

lib/                Game Logic
├── stockfish.ts    Chess engine
├── useChessGame    Game state management
├── constants.ts    Configuration
├── utils.ts        Helper functions
└── hooks.ts        Custom React hooks

app/                Next.js pages
├── page.tsx        Home page
├── layout.tsx      Root layout
└── globals.css     Global styles
```

---

## ⚙️ Configuration

### Change Default ELO
Edit `lib/constants.ts`:
```typescript
export const STOCKFISH_CONFIG = {
  DEFAULT_ELO: 2000,  // Change this value
  MIN_ELO: 800,
  MAX_ELO: 2800,
};
```

### Enable/Disable Features
Edit `lib/constants.ts`:
```typescript
export const GAME_CONFIG = {
  ENABLE_TAKEBACK: true,
  SHOW_LEGAL_MOVES: true,
  SHOW_LAST_MOVE: true,
};
```

### Change Colors/Theme
Edit `app/globals.css`:
```css
:root {
  --primary: 0 0% 9%;           /* Change primary color */
  --accent: 142.1 76.2% 36.3%;  /* Change accent color */
}
```

---

## 📚 Key Files Explained

### `components/ChessGame.tsx`
- Main game container
- Manages all game state
- Initializes Stockfish engine
- Handles component orchestration

### `lib/useChessGame.ts`
- Game logic hook
- Handles move validation
- Manages move history
- Controls engine responses

### `lib/stockfish.ts`
- Stockfish engine wrapper
- WASM integration
- ELO adjustment
- Best move calculation

### `components/ChessBoard.tsx`
- Displays the chessboard
- Handles square clicks
- Shows move highlights
- Prevents moves during engine thinking

### `components/ControlPanel.tsx`
- ELO slider
- Game buttons (New Game, Take Back)
- Player color selection
- Game status display

---

## 🔧 Common Customizations

### Add Sound Effects
```typescript
// In ChessGame.tsx
const playMoveSound = () => {
  const audio = new Audio('/sounds/move.mp3');
  audio.play();
};
```

### Change Board Size
```typescript
// In ChessBoard.tsx
<Chessboard
  boardWidth={500}  // Change size here
  // ...
/>
```

### Add Game Timer
```typescript
import { useGameTimer } from '@/lib/hooks';

const timer = useGameTimer(300); // 5 minutes
```

### Export Game to PGN
```typescript
import { exportToPgn } from '@/lib/utils';

const pgn = exportToPgn({
  white: 'Player',
  black: 'Stockfish 16',
  moves: gameState.history,
});
```

---

## 🐛 Troubleshooting

### "Engine initialization failed"
- Check browser console for WebAssembly errors
- Ensure browser supports WebAssembly
- Clear cache and reload
- Check internet connection

### Slow moves
- Lower the ELO rating
- Check CPU usage
- Close other applications
- Increase thinking time in constants

### Moves not registering
- Wait for "Engine thinking..." to disappear
- Verify it's your turn (check color indicator)
- Ensure legal move according to chess rules
- Check browser console for errors

### Build fails
```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📖 Next Steps

1. **Read the full README** - `README.md` for all features
2. **Advanced guide** - `ADVANCED.md` for customization
3. **Deployment** - `DEPLOYMENT.md` for production setup
4. **Types** - `types/index.ts` for TypeScript definitions

---

## 🎯 Development Tips

### Debug Game State
```typescript
// Add to ChessGame.tsx to log game state
useEffect(() => {
  console.log('Game State:', gameState);
}, [gameState]);
```

### Test Engine Strength
```typescript
// In ControlPanel, add console log
onEloChange={(elo) => {
  console.log(`Engine ELO: ${elo}`);
  setEngineElo(elo);
}}
```

### Inspect Move History
```typescript
// In any component
console.log('Move History:', moveHistory);
```

---

## 📱 Mobile Support

The app is responsive and works on:
- ✅ Desktop browsers
- ✅ Tablets
- ✅ Mobile phones

For better mobile experience:
- Increase board size on small screens
- Use touch-friendly controls
- Consider fullscreen mode

---

## 🚀 Deploy Quickly

### Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

### Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod
```

### Docker
```bash
docker build -t chess-engine .
docker run -p 3000:3000 chess-engine
```

---

## 💡 Tips & Tricks

1. **Play multiple games** - Increase your skill by playing many games
2. **Adjust difficulty gradually** - Start low, increase as you improve
3. **Study the moves** - Review move history to learn patterns
4. **Use take back** - Explore different moves without commitment
5. **Try different colors** - Play as black to learn defense

---

## 📞 Support

- 📖 Check README.md for detailed docs
- 🔍 Search for TypeScript types in `types/index.ts`
- 💻 Check browser DevTools Console for errors
- 📝 Review code comments in source files

---

## 🎉 You're All Set!

Enjoy playing chess against Stockfish. Have fun! ♟️

---

**Pro Tip:** Save this file as `QUICKSTART.md` in your project for quick reference!
