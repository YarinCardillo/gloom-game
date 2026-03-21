export const BASE_COLS = 31;
export const BASE_ROWS = 21;
export const VIS_RADIUS = 3.5;
export const PING_NOISE = 2.5;
export const PING_LIFE = 1500;
export const MOVE_REPEAT_MS = 115;
export const ENEMY_BASE_SPEED = 700;
export const ENEMY_SPEED_STEP = 60;
export const ENEMY_MIN_SPEED = 280;
export const MAX_ENEMIES = 10;
export const ENEMY_START_COUNT = 2;
export const ENEMY_MIN_SPAWN_DIST = 7;
export const DANGER_RADIUS = 7;
export const EXTRA_WALLS_RATIO = 0.045;
export const SONAR_SWEEP_DURATION = 800;
export const SONAR_COOLDOWN = 2000;
export const SHOUT_CHARGE_MS = 500;
export const SHOUT_REVEAL_RADIUS = 8;
export const SHOUT_DURATION = 600;
export const SHOUT_ENEMY_SPEED_BOOST = 1.5;
export const SHOUT_BOOST_DURATION = 3000;
export const SAFE_ROOM_RADIUS = 1.5;

/**
 * Calculate maze dimensions for a given level.
 */
export function getMazeDimensions(level) {
  const scale = Math.min(1, (level - 1) / 9);
  const cols = BASE_COLS + Math.floor(scale * 20);
  const rows = BASE_ROWS + Math.floor(scale * 14);
  return {
    cols: cols % 2 === 0 ? cols + 1 : cols,
    rows: rows % 2 === 0 ? rows + 1 : rows,
  };
}

/**
 * Compute tile size to fill available space.
 * Returns pixel size per tile.
 */
export function computeTileSize(cols, rows, maxWidth, maxHeight) {
  const tileW = Math.floor(maxWidth / cols);
  const tileH = Math.floor(maxHeight / rows);
  return Math.max(8, Math.min(tileW, tileH));
}

/**
 * Determine level type.
 */
export function getLevelType(level) {
  if (level % 10 === 0 && level > 0) return "gauntlet";
  if (level % 5 === 0 && level > 0) return "milestone";
  return "standard";
}
