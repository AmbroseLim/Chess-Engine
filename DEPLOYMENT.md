# Setup & Deployment Guide

## Quick Start

### Prerequisites
- Node.js 18.x or later
- npm or yarn package manager
- Modern web browser with WebAssembly support

### Installation

1. **Clone/Download the project**
```bash
cd chess-engine
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development server**
```bash
npm run dev
```

4. **Open browser**
Navigate to `http://localhost:3000`

## Development

### Project Structure
```
chess-engine/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ChessBoard.tsx     # Main board display
│   ├── ChessGame.tsx      # Game container
│   ├── ControlPanel.tsx   # Game controls
│   ├── MoveHistory.tsx    # Move list
│   └── ui/                # shadcn/ui components
├── lib/                   # Utilities & logic
│   ├── stockfish.ts       # Engine integration
│   ├── useChessGame.ts    # Game state hook
│   ├── constants.ts       # Configuration
│   ├── utils.ts           # Helper functions
│   └── hooks.ts           # Custom React hooks
├── types/                 # TypeScript definitions
│   └── index.ts           # Shared types
├── __tests__/             # Test files
│   └── game.test.ts       # Game logic tests
└── public/                # Static assets

```

### Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Run tests (when configured)
npm test
```

### Environment Variables

Create `.env.local` (optional):

```env
NEXT_PUBLIC_DEFAULT_ELO=1600
NEXT_PUBLIC_ENGINE_TIMEOUT=3000
```

See `.env.example` for all available options.

## Features Configuration

### Enable/Disable Features

Edit `lib/constants.ts`:

```typescript
export const GAME_CONFIG = {
  ENABLE_TAKEBACK: true,      // Allow move takebacks
  SHOW_LEGAL_MOVES: true,     // Highlight legal moves
  SHOW_LAST_MOVE: true,       // Highlight last move
  CHECK_INDICATOR: true,      // Highlight king in check
};
```

### Customize ELO Levels

Edit `lib/constants.ts`:

```typescript
export const ELO_LEVELS = {
  BEGINNER: { elo: 800, label: 'Beginner', depth: 6 },
  // ... modify as needed
};
```

### Theme Customization

Edit `app/globals.css` to change colors:

```css
:root {
  --primary: 0 0% 9%;           /* Primary color */
  --accent: 142.1 76.2% 36.3%;  /* Highlight color */
  --background: 0 0% 100%;      /* Background */
}

.dark {
  --primary: 0 0% 98.2%;
  --accent: 142.1 76.2% 36.3%;
  --background: 0 0% 3.6%;
}
```

## Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Click "Deploy"

Vercel will automatically:
- Install dependencies
- Build the project
- Deploy to production
- Provide a live URL

### Deploy to Netlify

1. **Build locally**
```bash
npm run build
```

2. **Connect to Netlify**
   - Go to https://netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect GitHub account
   - Select repository
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Click "Deploy"

### Deploy to AWS Amplify

1. **Connect repository**
   - Go to AWS Amplify Console
   - Click "New app" → "Host web app"
   - Select GitHub
   - Authorize and select repository

2. **Configure build settings**
   - Build command: `npm run build`
   - Start command: `npm start`
   - Environment variables: Add as needed

3. **Deploy**
   - Click "Save and deploy"

### Self-Hosted (VPS/Server)

1. **Install Node.js on server**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Clone repository**
```bash
git clone <your-repo-url>
cd chess-engine
```

3. **Install dependencies**
```bash
npm install
```

4. **Build project**
```bash
npm run build
```

5. **Run with PM2 (process manager)**
```bash
npm install -g pm2
pm2 start "npm start" --name "chess-engine"
pm2 save
pm2 startup
```

6. **Setup reverse proxy (Nginx)**

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

7. **Enable HTTPS (Let's Encrypt)**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Docker Deployment

1. **Create Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

2. **Create .dockerignore**
```
node_modules
.git
.gitignore
.next
out
build
.env
.env.local
npm-debug.log
```

3. **Build and run**
```bash
docker build -t chess-engine .
docker run -p 3000:3000 chess-engine
```

4. **Deploy to Docker Hub**
```bash
docker login
docker tag chess-engine <username>/chess-engine
docker push <username>/chess-engine
```

## Performance Optimization

### Production Build

The production build automatically:
- Minifies code
- Optimizes images
- Tree-shakes unused code
- Enables compression

### Caching Strategy

Next.js automatically handles:
- Static page caching
- Image optimization
- API route caching

### Lighthouse Score Tips

1. **Lazy load components**
```typescript
import dynamic from 'next/dynamic';
const ChessBoard = dynamic(() => import('../ChessBoard'), {
  loading: () => <div>Loading...</div>,
});
```

2. **Optimize images**
- Use optimized asset sizes
- Use modern formats (WebP)

3. **Reduce JavaScript**
- Tree-shake unused code
- Use dynamic imports

## Troubleshooting

### WebAssembly Not Loading

**Error:** "Failed to initialize Stockfish"

**Solutions:**
1. Check browser DevTools Console
2. Verify `.wasm` files exist in build output
3. Check CORS headers if served from CDN
4. Ensure browser supports WebAssembly

### Slow Performance

**Check:**
1. CPU usage (engine thinking)
2. Browser console for errors
3. Network latency
4. ELO setting (reduce if too high)

**Optimize:**
- Reduce max ELO
- Decrease search depth
- Use browser cache

### Memory Issues

**Symptoms:** Browser crashes on long games

**Solutions:**
1. Increase swap space
2. Limit max game length
3. Clear old games from memory
4. Use efficient data structures

### Build Fails

**Common issues:**
1. Missing dependencies: `npm install`
2. TypeScript errors: `npm run build` shows details
3. Node version: Ensure 18+

## Monitoring

### Setup Error Tracking

```typescript
// lib/sentry.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
});
```

### Analytics

Add tracking for:
- Games played
- Average ELO
- Common end conditions
- User retention

## Security

### Content Security Policy

Add to `next.config.js`:

```javascript
const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
];
```

### HTTPS

Always use HTTPS in production:
- Use Let's Encrypt (free)
- Or cloud provider's SSL
- Update links to use `https://`

## Maintenance

### Regular Updates

```bash
# Check outdated packages
npm outdated

# Update packages
npm update

# Update specific package
npm install package-name@latest
```

### Backup

- Backup database (if added)
- Backup configuration
- Version control all code

### Logs

Monitor:
- Application errors
- Engine errors
- Performance metrics
- User issues

## Support & Resources

- **Next.js Docs:** https://nextjs.org/docs
- **React Docs:** https://react.dev
- **TypeScript:** https://www.typescriptlang.org
- **Tailwind CSS:** https://tailwindcss.com
- **Stockfish:** https://stockfishchess.org

---

**Questions?** Check README.md or ADVANCED.md for more details.
