# Gloom

A sonar survival roguelike. Navigate dark mazes using only sonar pings. Browser-native, instant play.

## Play

**[getgloom.app](https://getgloom.app)** (or [gloom-game.vercel.app](https://gloom-game.vercel.app))

## What is Gloom?

You're dropped into a procedurally generated maze in near-total darkness. You can see a few tiles around you. Everything else is void.

A red sonar line sweeps across the screen, briefly revealing approximate enemy positions — but the data is noisy, imprecise. Enemies hunt you using pathfinding. You have to reach the green exit. One touch from any enemy and you're done.

Four enemy types demand different strategies:
- **Basic** — hunts you directly
- **Patrol** — follows a fixed route until you get close
- **Stalker** — follows your breadcrumb trail
- **Lurker** — invisible to sonar, only appears at point-blank range

Your visibility is powered by light — a depletable resource that drains as you move. Safe rooms recharge it. The maze closes behind you. Each level gets harder.

## Game Modes

| Mode | Description |
|------|-------------|
| **Normal** | Auto sonar, breadcrumbs, exit hint, safe rooms, checkpoints every 5 levels |
| **Hard** | Manual sonar (limited charges), no hints, shifting walls, faster enemies. Unlock: reach level 10 in Normal |
| **Helpless** | No sonar, no hints, minimum visibility, no safe rooms. Unlock: reach level 10 in Hard |
| **Custom** | Mix any settings *(coming soon)* |

## Controls

| Input | Action |
|-------|--------|
| WASD / Arrows | Move |
| Space (tap) | Sonar sweep |
| Space (hold) | Shout reveal (wider visibility, attracts enemies) |
| R | Retry / Next level |
| Esc | Back to menu |

Touch controls available on mobile.

## Tech

- React 19 + Vite 8
- Canvas 2D rendering
- Zero dependencies beyond React
- ~68KB gzipped

## Development

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # Production build to dist/
```

See [docs/architecture.md](docs/architecture.md) for codebase structure and [docs/development.md](docs/development.md) for the full development guide.

## Design

The complete Game Design Document is at [_bmad-output/gdd.md](_bmad-output/gdd.md).

## License

All rights reserved.
