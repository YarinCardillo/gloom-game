import { COLS, ROWS, TILE, VIS_RADIUS, PING_LIFE, DANGER_RADIUS } from "./constants.js";

const W = COLS * TILE;
const H = ROWS * TILE;

/**
 * Render a single frame of the game to the canvas context.
 */
export function renderFrame(ctx, state, timestamp) {
  clearCanvas(ctx);
  renderVisibleTiles(ctx, state);
  renderExit(ctx, state, timestamp);
  renderPings(ctx, state, timestamp);
  renderVisibleEnemies(ctx, state);
  renderDangerVignette(ctx, state);
  renderPlayer(ctx, state);
}

function clearCanvas(ctx) {
  ctx.fillStyle = "#07070c";
  ctx.fillRect(0, 0, W, H);
}

function renderVisibleTiles(ctx, state) {
  const { player, maze } = state;

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const dist = Math.hypot(x - player.x, y - player.y);
      if (dist > VIS_RADIUS + 0.5) continue;

      const alpha = Math.max(0, 1 - dist / (VIS_RADIUS + 1));
      const isWall = maze[y][x] === 1;

      ctx.fillStyle = isWall
        ? `rgba(22,22,42,${alpha})`
        : `rgba(38,38,65,${alpha * 0.85})`;
      ctx.fillRect(x * TILE, y * TILE, TILE, TILE);

      if (!isWall && alpha > 0.15) {
        ctx.strokeStyle = `rgba(55,55,90,${alpha * 0.25})`;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x * TILE, y * TILE, TILE, TILE);
      }
    }
  }
}

function renderExit(ctx, state, timestamp) {
  const { exit, player } = state;
  const dist = Math.hypot(exit.x - player.x, exit.y - player.y);
  const pulse = 0.5 + 0.5 * Math.sin(timestamp / 400);

  if (dist <= VIS_RADIUS + 1) {
    const alpha = Math.max(0, 1 - dist / (VIS_RADIUS + 1));
    ctx.fillStyle = `rgba(0,255,120,${alpha * (0.35 + pulse * 0.4)})`;
    ctx.fillRect(exit.x * TILE + 2, exit.y * TILE + 2, TILE - 4, TILE - 4);
  } else {
    const hint = Math.max(0.02, 0.08 - dist * 0.002);
    ctx.fillStyle = `rgba(0,255,120,${hint * pulse})`;
    ctx.beginPath();
    ctx.arc(exit.x * TILE + TILE / 2, exit.y * TILE + TILE / 2, TILE * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderPings(ctx, state, timestamp) {
  for (const ping of state.pings) {
    const age = (timestamp - ping.born) / PING_LIFE;
    const alpha = 1 - age;
    const radius = TILE * (0.2 + age * 1.3);
    const px = ping.x * TILE + TILE / 2;
    const py = ping.y * TILE + TILE / 2;

    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,35,35,${alpha * 0.55})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(px, py, TILE * 0.1, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,60,60,${Math.min(1, alpha * 1.2)})`;
    ctx.fill();
  }
}

function renderVisibleEnemies(ctx, state) {
  for (const enemy of state.enemies) {
    const dist = Math.hypot(enemy.x - state.player.x, enemy.y - state.player.y);
    if (dist > VIS_RADIUS) continue;

    const alpha = Math.max(0.2, 1 - dist / VIS_RADIUS);
    ctx.fillStyle = `rgba(255,25,25,${alpha})`;
    ctx.fillRect(enemy.x * TILE + 3, enemy.y * TILE + 3, TILE - 6, TILE - 6);
  }
}

function renderDangerVignette(ctx, state) {
  let closest = Infinity;
  for (const enemy of state.enemies) {
    const dist = Math.hypot(enemy.x - state.player.x, enemy.y - state.player.y);
    if (dist < closest) closest = dist;
  }

  if (closest >= DANGER_RADIUS) return;

  const intensity = Math.max(0, 1 - closest / DANGER_RADIUS) * 0.25;
  const gradient = ctx.createRadialGradient(W / 2, H / 2, W * 0.25, W / 2, H / 2, W * 0.55);
  gradient.addColorStop(0, "rgba(255,0,0,0)");
  gradient.addColorStop(1, `rgba(255,0,0,${intensity})`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);
}

function renderPlayer(ctx, state) {
  const px = state.player.x * TILE + TILE / 2;
  const py = state.player.y * TILE + TILE / 2;

  // Player dot with glow
  ctx.save();
  ctx.shadowColor = "#5588ff";
  ctx.shadowBlur = 14;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(px, py, TILE * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Ambient light ring
  const glow = ctx.createRadialGradient(px, py, 0, px, py, TILE * 1.8);
  glow.addColorStop(0, "rgba(80,120,255,0.06)");
  glow.addColorStop(1, "rgba(80,120,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
}
