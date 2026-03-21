import {
  COLS, ROWS, ENEMY_BASE_SPEED, ENEMY_SPEED_STEP,
  ENEMY_MIN_SPEED, MAX_ENEMIES, ENEMY_START_COUNT,
  ENEMY_MIN_SPAWN_DIST, PING_INTERVAL, PING_LIFE, PING_NOISE,
} from "./constants.js";
import { generateMaze, findRandomEmpty } from "./maze.js";
import { bfsPath, findFarthest } from "./pathfinding.js";

/**
 * Create a fresh game state for the given level.
 */
export function createGameState(level) {
  const maze = generateMaze(COLS, ROWS);
  const [exitX, exitY] = findFarthest(maze, 1, 1);
  const enemies = spawnEnemies(maze, level, exitX, exitY);

  return {
    maze,
    player: { x: 1, y: 1 },
    exit: { x: exitX, y: exitY },
    enemies,
    pings: [],
    enemySpeed: computeEnemySpeed(level),
    lastEnemyMove: 0,
    lastPing: 0,
  };
}

function computeEnemySpeed(level) {
  return Math.max(ENEMY_MIN_SPEED, ENEMY_BASE_SPEED - level * ENEMY_SPEED_STEP);
}

function spawnEnemies(maze, level, exitX, exitY) {
  const count = Math.min(ENEMY_START_COUNT + level, MAX_ENEMIES);
  const enemies = [];
  const avoid = [[1, 1], [exitX, exitY]];

  for (let i = 0; i < count; i++) {
    const [px, py] = findRandomEmpty(
      maze,
      [...avoid, ...enemies.map((e) => [e.x, e.y])],
      ENEMY_MIN_SPAWN_DIST
    );
    enemies.push({ x: px, y: py });
  }
  return enemies;
}

/**
 * Advance enemy positions toward the player using BFS pathfinding.
 */
export function updateEnemies(state, timestamp) {
  if (timestamp - state.lastEnemyMove < state.enemySpeed) return;

  for (const enemy of state.enemies) {
    const path = bfsPath(state.maze, enemy.x, enemy.y, state.player.x, state.player.y);
    if (path && path.length > 0) {
      [enemy.x, enemy.y] = path[0];
    }
  }
  state.lastEnemyMove = timestamp;
}

/**
 * Generate sonar pings with positional noise.
 */
export function updatePings(state, timestamp) {
  if (timestamp - state.lastPing < PING_INTERVAL) return;

  for (const enemy of state.enemies) {
    state.pings.push({
      x: enemy.x + (Math.random() - 0.5) * PING_NOISE * 2,
      y: enemy.y + (Math.random() - 0.5) * PING_NOISE * 2,
      born: timestamp,
    });
  }
  state.lastPing = timestamp;
}

/**
 * Remove expired pings.
 */
export function pruneExpiredPings(state, timestamp) {
  state.pings = state.pings.filter((p) => timestamp - p.born < PING_LIFE);
}

/**
 * Check if the player has reached the exit.
 */
export function hasReachedExit(state) {
  return state.player.x === state.exit.x && state.player.y === state.exit.y;
}

/**
 * Check if any enemy occupies the player's tile.
 */
export function isPlayerCaught(state) {
  return state.enemies.some(
    (e) => e.x === state.player.x && e.y === state.player.y
  );
}

/**
 * Attempt to move the player by (dx, dy). Returns true if moved.
 */
export function movePlayer(state, dx, dy) {
  const nx = state.player.x + dx;
  const ny = state.player.y + dy;
  if (state.maze[ny]?.[nx] === 0) {
    state.player.x = nx;
    state.player.y = ny;
    return true;
  }
  return false;
}
