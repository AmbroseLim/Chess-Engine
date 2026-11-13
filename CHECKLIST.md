# Project Checklist & Testing Guide

## Pre-Development Checklist

- [ ] Node.js 18+ installed
- [ ] npm installed
- [ ] Git initialized (if needed)
- [ ] Code editor configured (VS Code recommended)
- [ ] ESLint/Prettier configured

## Installation Checklist

- [ ] Run `npm install` successfully
- [ ] No dependency warnings
- [ ] package-lock.json generated
- [ ] node_modules folder created
- [ ] All dependencies installed correctly

## Configuration Checklist

- [ ] `tsconfig.json` present
- [ ] `next.config.js` configured for WASM
- [ ] `tailwind.config.ts` setup
- [ ] `postcss.config.js` configured
- [ ] `.env.example` created
- [ ] `.gitignore` configured

## Development Environment

- [ ] Run `npm run dev` without errors
- [ ] Server starts on http://localhost:3000
- [ ] Page loads in browser
- [ ] No console errors
- [ ] Hot reload working (edit and save)

## Component Checklist

### App Structure
- [ ] `app/layout.tsx` created
- [ ] `app/page.tsx` created
- [ ] `app/globals.css` created
- [ ] Metadata configured

### UI Components
- [ ] `components/ui/button.tsx` ✓
- [ ] `components/ui/card.tsx` ✓
- [ ] `components/ui/slider.tsx` ✓
- [ ] All components export properly
- [ ] No TypeScript errors

### Game Components
- [ ] `components/ChessBoard.tsx` ✓
- [ ] `components/ChessGame.tsx` ✓
- [ ] `components/ControlPanel.tsx` ✓
- [ ] `components/MoveHistory.tsx` ✓
- [ ] All components compile
- [ ] No missing imports

### Logic Files
- [ ] `lib/stockfish.ts` ✓
- [ ] `lib/useChessGame.ts` ✓
- [ ] `lib/constants.ts` ✓
- [ ] `lib/utils.ts` ✓
- [ ] `lib/hooks.ts` ✓
- [ ] `types/index.ts` ✓

## Feature Testing

### Game Basics
- [ ] Chessboard displays correctly
- [ ] Board orientation correct
- [ ] Pieces in starting position
- [ ] Board responsive
- [ ] Squares clickable

### Move Making
- [ ] Can click and drag pieces
- [ ] Legal moves only allowed
- [ ] Invalid moves rejected
- [ ] Move notation appears in history
- [ ] Highlights show last move

### Engine Integration
- [ ] Stockfish initializes
- [ ] Engine responds with moves
- [ ] Takes time to think (visible)
- [ ] ELO slider changes strength
- [ ] Engine plays legal moves

### UI Controls
- [ ] New Game button works
- [ ] Game resets properly
- [ ] Take Back button works
- [ ] Move history updates
- [ ] ELO slider responds
- [ ] Player color selection works

### Game States
- [ ] Detects check
- [ ] Detects checkmate
- [ ] Detects stalemate
- [ ] Detects draw
- [ ] Shows game result
- [ ] Prevents moves after game over

### Move History
- [ ] Shows correct notation
- [ ] Updates after each move
- [ ] Scrollable for many moves
- [ ] Correct numbering
- [ ] White and black moves align

### Visual Feedback
- [ ] Highlights work
- [ ] Thinking indicator shows
- [ ] Board disables during thinking
- [ ] Smooth animations
- [ ] Dark mode colors correct

## Performance Testing

- [ ] [ ] App loads in < 3 seconds
- [ ] [ ] Move calculation < 2 seconds (ELO 1600)
- [ ] [ ] No memory leaks (check DevTools)
- [ ] [ ] Smooth scrolling in history
- [ ] [ ] No lag when clicking
- [ ] [ ] CPU usage reasonable

Performance Benchmarks:
- [ ] Beginner (800 ELO): < 500ms
- [ ] Intermediate (1200 ELO): 800ms-1s
- [ ] Advanced (1600 ELO): 1-2s
- [ ] Master (2000 ELO): 2-3s

## Build & Production

- [ ] Run `npm run build` successfully
- [ ] No TypeScript errors
- [ ] Build output generated in `.next`
- [ ] No warnings in build log
- [ ] Build completes < 60 seconds

### Production Build Checklist
- [ ] Code minified
- [ ] Images optimized
- [ ] CSS minified
- [ ] JavaScript minified
- [ ] Source maps generated
- [ ] All assets included

### Run Production Build
- [ ] Run `npm start`
- [ ] Server starts on port 3000
- [ ] Page loads and functions
- [ ] All features work
- [ ] No console errors

## Browser Compatibility

Test in:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile Browser

Check for:
- [ ] WebAssembly support
- [ ] CSS Grid support
- [ ] Flexbox support
- [ ] ES2020 support

## Testing

### Manual Testing
- [ ] Play 5 games successfully
- [ ] Test all difficulty levels
- [ ] Test taking back moves
- [ ] Test resetting game
- [ ] Test switching colors

### Error Scenarios
- [ ] Handle invalid moves gracefully
- [ ] Handle engine timeout
- [ ] Handle network errors (if applicable)
- [ ] Handle out of memory
- [ ] Show helpful error messages

### Edge Cases
- [ ] Castling works
- [ ] En passant works
- [ ] Pawn promotion works
- [ ] Checkmate detection accurate
- [ ] Draw detection accurate

## Code Quality

- [ ] No TypeScript errors: `npm run build`
- [ ] No console errors or warnings
- [ ] Comments on complex logic
- [ ] Proper error handling
- [ ] No console.log statements left (prod)
- [ ] Consistent code style
- [ ] No unused variables
- [ ] No unused imports

## Documentation

- [ ] README.md complete and accurate
- [ ] QUICKSTART.md easy to follow
- [ ] DEPLOYMENT.md up to date
- [ ] ADVANCED.md has examples
- [ ] Code comments clear
- [ ] Types documented
- [ ] API documented

## Dependencies

- [ ] All dependencies are used
- [ ] No conflicting versions
- [ ] No security vulnerabilities: `npm audit`
- [ ] Version pinned appropriately
- [ ] package-lock.json committed
- [ ] No peer dependency warnings

## Git Setup

- [ ] `.gitignore` configured
- [ ] Initial commit made
- [ ] Branch naming consistent
- [ ] Commit messages descriptive
- [ ] No sensitive data committed

## Accessibility

- [ ] Keyboard navigation works
- [ ] Tab order logical
- [ ] Color contrast sufficient
- [ ] Labels descriptive
- [ ] Error messages clear
- [ ] Mobile touch targets large enough

## Security

- [ ] No hardcoded secrets
- [ ] Environment variables used
- [ ] XSS protection
- [ ] CSRF protection (if needed)
- [ ] No eval() usage
- [ ] No dangerous innerHTML

## Deployment Readiness

Choose one deployment method and verify:

### Vercel
- [ ] GitHub repository created
- [ ] Connected to Vercel
- [ ] Build settings correct
- [ ] Environment variables set
- [ ] Deployment successful
- [ ] Live URL working

### Netlify
- [ ] GitHub repository connected
- [ ] Build command: `npm run build`
- [ ] Publish directory: `.next`
- [ ] Deployment successful
- [ ] Live URL working

### Self-Hosted
- [ ] Server configured
- [ ] Node.js installed
- [ ] Dependencies installed
- [ ] Build created
- [ ] PM2 process running
- [ ] Nginx reverse proxy configured
- [ ] HTTPS enabled
- [ ] Domain pointing to server

## Final Checks

- [ ] Feature complete
- [ ] No known bugs
- [ ] Performance acceptable
- [ ] User experience smooth
- [ ] Documentation complete
- [ ] Ready for users

## Launch Checklist

- [ ] Final testing completed
- [ ] All team members reviewed
- [ ] Backup created
- [ ] Rollback plan ready
- [ ] Monitoring configured
- [ ] Analytics setup
- [ ] Support documentation ready
- [ ] Launch approved

## Post-Launch

- [ ] Monitor for errors
- [ ] Check user feedback
- [ ] Monitor performance metrics
- [ ] Check analytics
- [ ] Fix critical bugs
- [ ] Plan first update

---

## Testing Commands Quick Reference

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Lint (if configured)
npm run lint

# Check for vulnerabilities
npm audit

# Audit fix (carefully!)
npm audit fix

# Check outdated packages
npm outdated

# Update packages
npm update
```

---

## Debugging Commands

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next

# Check npm cache
npm cache verify

# Clear npm cache
npm cache clean --force
```

---

## Performance Profiling

1. Open DevTools (F12)
2. Go to Performance tab
3. Click Record
4. Play a game
5. Click Stop
6. Analyze the timeline

Look for:
- JavaScript execution time
- Rendering time
- Paint timing
- Frame rate

---

**Use this checklist to ensure everything works before launch!**
