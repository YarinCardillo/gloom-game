# Gloom — Development Guide

## Prerequisites

- Node.js 22+
- npm

## Setup

```bash
git clone https://github.com/YarinCardillo/gloom-game.git
cd gloom-game
npm install
```

## Development

```bash
npm run dev
```

Opens at `http://localhost:5173`. Hot module replacement is enabled.

## Build

```bash
npm run build
```

Output goes to `dist/`. Preview the production build:

```bash
npm run preview
```

## Project Layout

| Path | Purpose |
|------|---------|
| `src/engine/` | Pure JS game logic — no React deps |
| `src/components/` | React UI components |
| `src/Gloom.jsx` | Main game orchestrator |
| `_bmad-output/gdd.md` | Game Design Document |
| `docs/` | Architecture and development docs |

## Game Constants

All tuning constants are in `src/engine/constants.js`:

| Constant | Default | Purpose |
|----------|---------|---------|
| `COLS` / `ROWS` | 31 / 21 | Maze dimensions |
| `TILE` | 20 | Tile size in pixels |
| `VIS_RADIUS` | 3.5 | Player visibility radius |
| `PING_NOISE` | 2.5 | Positional noise on sonar pings |
| `PING_INTERVAL` | 2000 | ms between sonar sweeps |
| `MOVE_REPEAT_MS` | 115 | Key repeat throttle |
| `ENEMY_BASE_SPEED` | 700 | Starting enemy move interval (ms) |
| `MAX_ENEMIES` | 8 | Maximum enemies per level |

## Controls

**Desktop:** WASD or arrow keys to move. R to retry/continue.

**Mobile:** On-screen D-pad buttons.

## CI/CD

GitHub Actions runs on push/PR to `master`:
- Installs dependencies
- Builds the project
- Uploads `dist/` as artifact

## Deployment

Deploy to Vercel:

```bash
vercel login        # First time only
vercel --prod       # Deploy to production
```

Or connect the GitHub repo to Vercel for automatic deploys on push.

Custom domain: Add `getgloom.app` in Vercel dashboard under project settings > Domains.
