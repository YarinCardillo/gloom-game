# Gloom — Architecture Overview

## Tech Stack

- **Framework:** React 19
- **Bundler:** Vite 8
- **Rendering:** Canvas 2D API (no WebGL, no external graphics libraries)
- **Dependencies:** Zero beyond React — pure procedural rendering

## Project Structure

```
src/
  main.jsx              # Entry point, renders <Gloom />
  Gloom.jsx             # Root game component (orchestrator)
  engine/
    constants.js        # All game constants (dimensions, timing, tuning)
    maze.js             # Maze generation (DFS + multi-path wall removal)
    pathfinding.js      # BFS pathfinding and farthest-point search
    gameState.js        # Game state creation, enemy/ping updates, collision
    renderer.js         # Canvas rendering (tiles, player, enemies, effects)
  components/
    GameOverlay.jsx     # Win/lose screen overlay
    TouchControls.jsx   # Mobile D-pad buttons
```

## Architecture Principles

### Separation of Concerns

The codebase follows a strict separation:

- **Engine layer** (`src/engine/`): Pure JavaScript, no React dependencies. Contains all game logic, state management, and rendering. Can be tested and run independently.
- **Component layer** (`src/components/`): React components for UI overlays and input. Thin, presentational.
- **Orchestrator** (`Gloom.jsx`): Wires engine + components together. Manages the game loop via `requestAnimationFrame`, handles keyboard/touch input, and bridges engine state with React UI state.

### Game Loop

```
requestAnimationFrame(loop)
  └─ Process keyboard input (MOVE_REPEAT_MS throttle)
  └─ Update enemies (BFS pathfinding, speed-throttled)
  └─ Update sonar pings (interval-based)
  └─ Prune expired pings
  └─ Check win/lose conditions
  └─ Render frame (canvas 2D)
```

### State Management

Game state is held in a `useRef` (not `useState`) to avoid re-renders on every frame. React state is only used for the UI overlay (win/lose status, level number) — updated via `setUi` only when game status changes.

### Rendering Pipeline

All rendering happens in `renderer.js` via a single `renderFrame()` call per frame:

1. Clear canvas (dark background)
2. Render visible tiles (radial visibility falloff)
3. Render exit beacon (pulse animation, distance-based hint)
4. Render sonar pings (expanding rings with fade)
5. Render visible enemies (within visibility radius)
6. Render danger vignette (proximity-based red edge glow)
7. Render player (white dot with blue glow + ambient light ring)

### Maze Generation

Uses recursive DFS carving on odd coordinates, then removes ~4.5% of remaining walls to create alternative paths. This ensures the maze is always solvable with multiple routes — critical for the evasion gameplay.

### Enemy AI

Simple BFS pathfinding toward the player. Each enemy recalculates its path on every movement tick. Movement speed is throttled by `enemySpeed` which decreases (faster enemies) as levels increase.

## Performance Notes

- Canvas 2D rendering at 60fps via `requestAnimationFrame`
- Only tiles within visibility radius are rendered (not full grid)
- BFS pathfinding runs once per enemy per movement tick (not every frame)
- Pings are pruned every frame to prevent unbounded array growth
- No DOM manipulation during gameplay — all rendering is canvas-based
- Bundle size: ~64KB gzipped (React + game code)
