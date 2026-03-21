import {
  VIS_RADIUS, PING_NOISE, PING_LIFE,
  ENEMY_BASE_SPEED, ENEMY_SPEED_STEP, ENEMY_MIN_SPEED,
  MAX_ENEMIES, ENEMY_START_COUNT, ENEMY_MIN_SPAWN_DIST,
  SONAR_SWEEP_DURATION, SONAR_COOLDOWN,
  SHOUT_REVEAL_RADIUS, SHOUT_DURATION, SHOUT_CHARGE_MS,
  SHOUT_ENEMY_SPEED_BOOST, SHOUT_BOOST_DURATION,
  SAFE_ROOM_RADIUS,
  getMazeDimensions, getLevelType,
} from "./constants.js";
import { generateMaze, findRandomEmpty } from "./maze.js";
import { bfsPath, findFarthest } from "./pathfinding.js";

// --- Enemy type definitions ---
const ENEMY_TYPES = {
  basic:   { color: [255, 25, 25],  sonarVisible: true,  label: "basic" },
  patrol:  { color: [255, 140, 25], sonarVisible: true,  label: "patrol" },
  stalker: { color: [200, 25, 255], sonarVisible: true,  label: "stalker" },
  lurker:  { color: [255, 25, 25],  sonarVisible: false, label: "lurker" },
  swarm:   { color: [255, 80, 80],  sonarVisible: true,  label: "swarm" },
};

function pickEnemyType(level, index) {
  if (level >= 10 && index >= 6) return "swarm";
  if (level >= 7 && index >= 4) return "lurker";
  if (level >= 5 && index >= 2) return "stalker";
  if (level >= 3 && index >= 1) return "patrol";
  return "basic";
}

// --- Patrol route generation ---
function generatePatrolRoute(maze, startX, startY) {
  const route = [[startX, startY]];
  const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  let x = startX, y = startY;

  for (let step = 0; step < 8; step++) {
    const shuffled = dirs.filter(([dx, dy]) => maze[y + dy]?.[x + dx] === 0);
    if (shuffled.length === 0) break;
    const [dx, dy] = shuffled[Math.floor(Math.random() * shuffled.length)];
    x += dx;
    y += dy;
    route.push([x, y]);
  }
  return route;
}

/**
 * Create a fresh game state for the given level and mode config.
 */
export function createGameState(level, modeConfig) {
  const { cols, rows } = getMazeDimensions(level);
  const maze = generateMaze(cols, rows);
  const [exitX, exitY] = findFarthest(maze, 1, 1);
  const levelType = getLevelType(level);
  const enemies = spawnEnemies(maze, level, exitX, exitY, levelType);
  const safeRooms = modeConfig.safeRooms
    ? placeSafeRooms(maze, level, levelType, exitX, exitY)
    : [];

  return {
    maze,
    cols,
    rows,
    level,
    levelType,
    modeConfig,
    player: { x: 1, y: 1 },
    exit: { x: exitX, y: exitY },
    enemies,
    safeRooms,
    visited: new Set(["1,1"]),

    // Sonar state
    sonar: {
      active: false,
      sweepProgress: 0,
      sweepStart: 0,
      cooldownUntil: 0,
      chargesLeft: modeConfig.sonarCharges,
      pings: [],
    },

    // Shout reveal state
    shout: {
      charging: false,
      chargeStart: 0,
      active: false,
      revealStart: 0,
      boostUntil: 0,
    },

    // Light system
    light: modeConfig.lightEnabled ? modeConfig.lightStart : 1.0,

    // Corridor closing
    closedTiles: new Set(),
    closingQueue: [],

    // Timing
    enemySpeed: computeEnemySpeed(level, modeConfig),
    lastEnemyMove: 0,

    // Level transition
    transitioning: false,
    transitionStart: 0,
  };
}

function computeEnemySpeed(level, modeConfig) {
  const base = Math.max(ENEMY_MIN_SPEED, ENEMY_BASE_SPEED - level * ENEMY_SPEED_STEP);
  return Math.round(base / modeConfig.enemySpeedMod);
}

function spawnEnemies(maze, level, exitX, exitY, levelType) {
  let count = Math.min(ENEMY_START_COUNT + level, MAX_ENEMIES);
  if (levelType === "gauntlet") count = MAX_ENEMIES;

  const enemies = [];
  const avoid = [[1, 1], [exitX, exitY]];

  for (let i = 0; i < count; i++) {
    const type = pickEnemyType(level, i);
    const [px, py] = findRandomEmpty(
      maze,
      [...avoid, ...enemies.map((e) => [e.x, e.y])],
      ENEMY_MIN_SPAWN_DIST
    );
    const enemy = {
      x: px, y: py, type,
      ...ENEMY_TYPES[type],
    };
    if (type === "patrol") {
      enemy.route = generatePatrolRoute(maze, px, py);
      enemy.routeIndex = 0;
      enemy.routeDir = 1;
    }
    enemies.push(enemy);
  }
  return enemies;
}

function placeSafeRooms(maze, level, levelType, exitX, exitY) {
  const count = levelType === "milestone" ? 2 : (level % 3 === 0 ? 1 : 0);
  if (count === 0 && level <= 2) return [{ x: -1, y: -1 }].slice(0, 0); // none for early easy levels

  const rooms = [];
  const avoid = [[1, 1], [exitX, exitY]];

  for (let i = 0; i < Math.max(count, level <= 3 ? 1 : 0); i++) {
    const [rx, ry] = findRandomEmpty(
      maze,
      [...avoid, ...rooms.map((r) => [r.x, r.y])],
      5
    );
    rooms.push({ x: rx, y: ry });
    avoid.push([rx, ry]);
  }
  return rooms;
}

// --- Update functions ---

export function updateEnemies(state, timestamp) {
  const speed = state.shout.boostUntil > timestamp
    ? Math.round(state.enemySpeed / SHOUT_ENEMY_SPEED_BOOST)
    : state.enemySpeed;

  if (timestamp - state.lastEnemyMove < speed) return;

  for (const enemy of state.enemies) {
    // Don't move into safe rooms
    let targetX = state.player.x;
    let targetY = state.player.y;

    if (enemy.type === "patrol" && !isPlayerNear(enemy, state.player, 5)) {
      // Patrol follows route when player is far
      const route = enemy.route;
      enemy.routeIndex += enemy.routeDir;
      if (enemy.routeIndex >= route.length - 1 || enemy.routeIndex <= 0) {
        enemy.routeDir *= -1;
      }
      const [nx, ny] = route[Math.min(enemy.routeIndex, route.length - 1)];
      if (!isInSafeRoom(nx, ny, state.safeRooms)) {
        enemy.x = nx;
        enemy.y = ny;
      }
      continue;
    }

    if (enemy.type === "stalker" && state.visited.size > 0) {
      // Stalker follows player's trail
      const trail = findNearestVisited(state.visited, enemy.x, enemy.y, state.player);
      if (trail) {
        targetX = trail[0];
        targetY = trail[1];
      }
    }

    if (enemy.type === "lurker") {
      // Lurker only moves when player is close
      const dist = Math.hypot(enemy.x - state.player.x, enemy.y - state.player.y);
      if (dist > 4) continue;
    }

    const path = bfsPath(state.maze, enemy.x, enemy.y, targetX, targetY);
    if (path && path.length > 0) {
      const [nx, ny] = path[0];
      if (!isInSafeRoom(nx, ny, state.safeRooms)) {
        enemy.x = nx;
        enemy.y = ny;
      }
    }
  }
  state.lastEnemyMove = timestamp;
}

function isPlayerNear(enemy, player, dist) {
  return Math.hypot(enemy.x - player.x, enemy.y - player.y) <= dist;
}

function findNearestVisited(visited, ex, ey, player) {
  let best = null, bestDist = Infinity;
  for (const key of visited) {
    const [vx, vy] = key.split(",").map(Number);
    const distToEnemy = Math.hypot(vx - ex, vy - ey);
    const distToPlayer = Math.hypot(vx - player.x, vy - player.y);
    const score = distToEnemy - distToPlayer * 0.5;
    if (score < bestDist && distToEnemy > 0) {
      bestDist = score;
      best = [vx, vy];
    }
  }
  return best;
}

export function isInSafeRoom(x, y, safeRooms) {
  return safeRooms.some(
    (r) => Math.hypot(x - r.x, y - r.y) <= SAFE_ROOM_RADIUS
  );
}

export function updateSonar(state, timestamp) {
  const { sonar, modeConfig } = state;

  // Auto sonar in normal mode
  if (modeConfig.autoSonar && !sonar.active && timestamp >= sonar.cooldownUntil) {
    triggerSonarSweep(state, timestamp);
  }

  // Update active sweep
  if (sonar.active) {
    sonar.sweepProgress = Math.min(1, (timestamp - sonar.sweepStart) / SONAR_SWEEP_DURATION);
    if (sonar.sweepProgress >= 1) {
      sonar.active = false;
      sonar.cooldownUntil = timestamp + SONAR_COOLDOWN;
    }
  }

  // Prune old pings
  sonar.pings = sonar.pings.filter((p) => timestamp - p.born < PING_LIFE);
}

export function triggerSonarSweep(state, timestamp) {
  const { sonar, modeConfig } = state;

  if (sonar.active) return false;
  if (timestamp < sonar.cooldownUntil) return false;
  if (!modeConfig.autoSonar && sonar.chargesLeft <= 0) return false;

  sonar.active = true;
  sonar.sweepStart = timestamp;
  sonar.sweepProgress = 0;

  if (!modeConfig.autoSonar) {
    sonar.chargesLeft--;
  }

  // Generate pings for sonar-visible enemies
  for (const enemy of state.enemies) {
    if (!enemy.sonarVisible) continue;
    sonar.pings.push({
      x: enemy.x + (Math.random() - 0.5) * PING_NOISE * 2,
      y: enemy.y + (Math.random() - 0.5) * PING_NOISE * 2,
      born: timestamp,
    });
  }
  return true;
}

export function startShoutCharge(state, timestamp) {
  if (state.shout.active) return;
  state.shout.charging = true;
  state.shout.chargeStart = timestamp;
}

export function releaseShout(state, timestamp) {
  if (!state.shout.charging) return;
  const held = timestamp - state.shout.chargeStart;
  state.shout.charging = false;

  if (held >= SHOUT_CHARGE_MS) {
    // Full shout reveal
    state.shout.active = true;
    state.shout.revealStart = timestamp;
    state.shout.boostUntil = timestamp + SHOUT_BOOST_DURATION;
    state.light = Math.max(0.1, state.light - 0.15);
  } else {
    // Quick tap = normal sonar
    triggerSonarSweep(state, timestamp);
  }
}

export function updateShout(state, timestamp) {
  if (state.shout.active && timestamp - state.shout.revealStart > SHOUT_DURATION) {
    state.shout.active = false;
  }
}

export function updateLight(state, isMoving) {
  if (!state.modeConfig.lightEnabled) return;

  if (isMoving) {
    state.light = Math.max(0.05, state.light - state.modeConfig.lightDrain);
  } else {
    state.light = Math.min(1.0, state.light + state.modeConfig.lightRegen);
  }

  // Safe room recharge
  if (isInSafeRoom(state.player.x, state.player.y, state.safeRooms)) {
    state.light = Math.min(1.0, state.light + 0.008);
  }
}

export function updateClosingCorridors(state, timestamp) {
  if (!state.modeConfig.closingCorridors) return;

  // Add visited tiles to closing queue with delay
  const key = `${state.player.x},${state.player.y}`;
  if (!state.closingQueue.some((q) => q.key === key)) {
    state.closingQueue.push({ key, x: state.player.x, y: state.player.y, time: timestamp });
  }

  // Close tiles after delay — max 1 per frame to avoid sudden traps
  const delay = state.modeConfig.closingDelay;
  for (let i = state.closingQueue.length - 1; i >= 0; i--) {
    const q = state.closingQueue[i];
    if (timestamp - q.time < delay) continue;

    // Never close tile player is on or adjacent to player
    const distToPlayer = Math.abs(q.x - state.player.x) + Math.abs(q.y - state.player.y);
    if (distToPlayer <= 1) continue;

    // Never close near exit or safe rooms
    if (Math.hypot(q.x - state.exit.x, q.y - state.exit.y) < 3) continue;
    if (isInSafeRoom(q.x, q.y, state.safeRooms)) continue;

    // Simulate closing: check if player can still reach exit after this wall is placed
    state.maze[q.y][q.x] = 1;
    const pathExists = bfsPath(state.maze, state.player.x, state.player.y, state.exit.x, state.exit.y);
    if (!pathExists) {
      // Would trap player — revert and discard from queue
      state.maze[q.y][q.x] = 0;
      state.closingQueue.splice(i, 1);
      continue;
    }

    // Safe to close
    state.closedTiles.add(q.key);
    state.closingQueue.splice(i, 1);
    break; // max 1 closure per frame
  }
}

export function movePlayer(state, dx, dy) {
  const nx = state.player.x + dx;
  const ny = state.player.y + dy;
  if (state.maze[ny]?.[nx] === 0) {
    state.player.x = nx;
    state.player.y = ny;
    if (state.modeConfig.breadcrumbs) {
      state.visited.add(`${nx},${ny}`);
    }
    return true;
  }
  return false;
}

export function hasReachedExit(state) {
  return state.player.x === state.exit.x && state.player.y === state.exit.y;
}

export function isPlayerCaught(state) {
  if (isInSafeRoom(state.player.x, state.player.y, state.safeRooms)) return false;
  return state.enemies.some(
    (e) => e.x === state.player.x && e.y === state.player.y
  );
}

/**
 * Get effective visibility radius considering light and mode.
 */
export function getEffectiveVisRadius(state) {
  const base = VIS_RADIUS * state.modeConfig.visRadiusMod;
  if (!state.modeConfig.lightEnabled) return base;
  return base * (0.4 + 0.6 * state.light);
}
