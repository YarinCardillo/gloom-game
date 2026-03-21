import {
  TILE, PING_LIFE, DANGER_RADIUS, SONAR_SWEEP_DURATION,
  SHOUT_REVEAL_RADIUS, SHOUT_DURATION, SAFE_ROOM_RADIUS,
} from "./constants.js";
import { getEffectiveVisRadius, isInSafeRoom } from "./gameState.js";

/**
 * Render a single frame of the game to the canvas context.
 */
export function renderFrame(ctx, state, timestamp) {
  const W = state.cols * TILE;
  const H = state.rows * TILE;
  const visR = getEffectiveVisRadius(state);

  ctx.fillStyle = "#07070c";
  ctx.fillRect(0, 0, W, H);

  renderVisibleTiles(ctx, state, visR);
  renderBreadcrumbs(ctx, state, visR);
  renderSafeRooms(ctx, state, visR);
  renderExit(ctx, state, timestamp, visR);
  renderSonarSweep(ctx, state, timestamp);
  renderPings(ctx, state, timestamp);
  renderShoutReveal(ctx, state, timestamp);
  renderVisibleEnemies(ctx, state, visR);
  renderDangerVignette(ctx, state, W, H);
  renderPlayer(ctx, state, W, H);
  renderHUD(ctx, state, W);
}

function renderVisibleTiles(ctx, state, visR) {
  const { player, maze, cols, rows } = state;
  const shoutActive = state.shout.active;
  const shoutR = shoutActive ? SHOUT_REVEAL_RADIUS : 0;
  const effectiveR = Math.max(visR, shoutR);

  // Only iterate tiles near player
  const minX = Math.max(0, Math.floor(player.x - effectiveR - 1));
  const maxX = Math.min(cols - 1, Math.ceil(player.x + effectiveR + 1));
  const minY = Math.max(0, Math.floor(player.y - effectiveR - 1));
  const maxY = Math.min(rows - 1, Math.ceil(player.y + effectiveR + 1));

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const dist = Math.hypot(x - player.x, y - player.y);
      const r = shoutActive ? Math.max(visR, shoutR) : visR;
      if (dist > r + 0.5) continue;

      const alpha = Math.max(0, 1 - dist / (r + 1));
      const isWall = maze[y][x] === 1;
      const isClosed = state.closedTiles.has(`${x},${y}`);

      if (isClosed) {
        ctx.fillStyle = `rgba(30,15,15,${alpha * 0.6})`;
      } else if (isWall) {
        ctx.fillStyle = `rgba(22,22,42,${alpha})`;
      } else {
        ctx.fillStyle = `rgba(38,38,65,${alpha * 0.85})`;
      }
      ctx.fillRect(x * TILE, y * TILE, TILE, TILE);

      if (!isWall && !isClosed && alpha > 0.15) {
        ctx.strokeStyle = `rgba(55,55,90,${alpha * 0.25})`;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x * TILE, y * TILE, TILE, TILE);
      }
    }
  }
}

function renderBreadcrumbs(ctx, state, visR) {
  if (!state.modeConfig.breadcrumbs) return;

  for (const key of state.visited) {
    const [vx, vy] = key.split(",").map(Number);
    const dist = Math.hypot(vx - state.player.x, vy - state.player.y);
    if (dist > visR + 0.5 || dist < 0.5) continue;

    const alpha = Math.max(0, 1 - dist / (visR + 1)) * 0.12;
    ctx.fillStyle = `rgba(80,120,255,${alpha})`;
    ctx.fillRect(vx * TILE + 6, vy * TILE + 6, TILE - 12, TILE - 12);
  }
}

function renderSafeRooms(ctx, state, visR) {
  for (const room of state.safeRooms) {
    const dist = Math.hypot(room.x - state.player.x, room.y - state.player.y);
    if (dist > visR + 2) continue;

    const alpha = Math.max(0, 1 - dist / (visR + 2));
    const glow = ctx.createRadialGradient(
      room.x * TILE + TILE / 2, room.y * TILE + TILE / 2, 0,
      room.x * TILE + TILE / 2, room.y * TILE + TILE / 2, TILE * SAFE_ROOM_RADIUS
    );
    glow.addColorStop(0, `rgba(255,220,120,${alpha * 0.25})`);
    glow.addColorStop(0.6, `rgba(255,200,80,${alpha * 0.1})`);
    glow.addColorStop(1, `rgba(255,180,60,0)`);
    ctx.fillStyle = glow;
    ctx.fillRect(
      (room.x - 2) * TILE, (room.y - 2) * TILE,
      4 * TILE, 4 * TILE
    );

    // Safe room core
    ctx.fillStyle = `rgba(255,220,130,${alpha * 0.15})`;
    ctx.fillRect(room.x * TILE + 1, room.y * TILE + 1, TILE - 2, TILE - 2);
  }
}

function renderExit(ctx, state, timestamp, visR) {
  const { exit, player, modeConfig } = state;
  const dist = Math.hypot(exit.x - player.x, exit.y - player.y);
  const pulse = 0.5 + 0.5 * Math.sin(timestamp / 400);

  if (dist <= visR + 1) {
    const alpha = Math.max(0, 1 - dist / (visR + 1));
    ctx.fillStyle = `rgba(0,255,120,${alpha * (0.35 + pulse * 0.4)})`;
    ctx.fillRect(exit.x * TILE + 2, exit.y * TILE + 2, TILE - 4, TILE - 4);
  } else if (modeConfig.showExitHint) {
    const hint = Math.max(0.02, 0.08 - dist * 0.002);
    ctx.fillStyle = `rgba(0,255,120,${hint * pulse})`;
    ctx.beginPath();
    ctx.arc(exit.x * TILE + TILE / 2, exit.y * TILE + TILE / 2, TILE * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderSonarSweep(ctx, state, timestamp) {
  if (!state.sonar.active) return;

  const { player, cols, rows } = state;
  const progress = state.sonar.sweepProgress;

  // Side-to-side sweep line
  const sweepX = Math.floor(progress * cols);
  const alpha = 0.3 * (1 - Math.abs(progress - 0.5) * 2);

  ctx.strokeStyle = `rgba(255,50,50,${alpha})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sweepX * TILE, 0);
  ctx.lineTo(sweepX * TILE, rows * TILE);
  ctx.stroke();

  // Fading trail
  const trailWidth = 3;
  for (let i = 1; i <= trailWidth; i++) {
    const trailX = sweepX - i;
    if (trailX < 0) continue;
    ctx.strokeStyle = `rgba(255,30,30,${alpha * (1 - i / (trailWidth + 1)) * 0.4})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(trailX * TILE, 0);
    ctx.lineTo(trailX * TILE, rows * TILE);
    ctx.stroke();
  }
}

function renderPings(ctx, state, timestamp) {
  for (const ping of state.sonar.pings) {
    const age = (timestamp - ping.born) / PING_LIFE;
    const alpha = 1 - age;
    const px = ping.x * TILE + TILE / 2;
    const py = ping.y * TILE + TILE / 2;

    // Single point dot that fades
    const dotSize = TILE * (0.15 - age * 0.05);
    if (dotSize > 0) {
      ctx.beginPath();
      ctx.arc(px, py, dotSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,60,60,${Math.min(1, alpha * 1.2)})`;
      ctx.fill();
    }
  }
}

function renderShoutReveal(ctx, state, timestamp) {
  if (!state.shout.active) return;

  const age = (timestamp - state.shout.revealStart) / SHOUT_DURATION;
  const alpha = Math.max(0, 0.15 * (1 - age));
  const radius = SHOUT_REVEAL_RADIUS * TILE * (0.3 + age * 0.7);

  const px = state.player.x * TILE + TILE / 2;
  const py = state.player.y * TILE + TILE / 2;

  const glow = ctx.createRadialGradient(px, py, 0, px, py, radius);
  glow.addColorStop(0, `rgba(120,160,255,${alpha})`);
  glow.addColorStop(0.7, `rgba(80,120,255,${alpha * 0.5})`);
  glow.addColorStop(1, `rgba(60,80,255,0)`);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, state.cols * TILE, state.rows * TILE);
}

function renderVisibleEnemies(ctx, state, visR) {
  const shoutR = state.shout.active ? SHOUT_REVEAL_RADIUS : 0;
  const effectiveR = Math.max(visR, shoutR);

  for (const enemy of state.enemies) {
    const dist = Math.hypot(enemy.x - state.player.x, enemy.y - state.player.y);

    // Lurkers only visible at very close range
    if (enemy.type === "lurker" && dist > 2 && !state.shout.active) continue;

    if (dist > effectiveR) continue;

    const alpha = Math.max(0.2, 1 - dist / effectiveR);
    const [r, g, b] = enemy.color;
    ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
    ctx.fillRect(enemy.x * TILE + 3, enemy.y * TILE + 3, TILE - 6, TILE - 6);

    // Stalker has a subtle trail indicator
    if (enemy.type === "stalker" && alpha > 0.5) {
      ctx.strokeStyle = `rgba(${r},${g},${b},${alpha * 0.3})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(enemy.x * TILE + 2, enemy.y * TILE + 2, TILE - 4, TILE - 4);
    }
  }
}

function renderDangerVignette(ctx, state, W, H) {
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

function renderPlayer(ctx, state, W, H) {
  const px = state.player.x * TILE + TILE / 2;
  const py = state.player.y * TILE + TILE / 2;

  // Charge indicator when holding space
  if (state.shout.charging) {
    const glow = ctx.createRadialGradient(px, py, 0, px, py, TILE * 2.5);
    glow.addColorStop(0, "rgba(120,160,255,0.15)");
    glow.addColorStop(1, "rgba(120,160,255,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
  }

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
  const lightR = TILE * 1.8 * (state.modeConfig.lightEnabled ? (0.5 + 0.5 * state.light) : 1);
  const glow = ctx.createRadialGradient(px, py, 0, px, py, lightR);
  glow.addColorStop(0, "rgba(80,120,255,0.06)");
  glow.addColorStop(1, "rgba(80,120,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
}

function renderHUD(ctx, state, W) {
  const { modeConfig, light, sonar, level, levelType } = state;

  // Light meter (top left)
  if (modeConfig.lightEnabled) {
    const barW = 60, barH = 4, barX = 8, barY = 8;
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(barX, barY, barW, barH);
    const lightColor = light > 0.3 ? "rgba(80,120,255,0.5)" : "rgba(255,80,80,0.6)";
    ctx.fillStyle = lightColor;
    ctx.fillRect(barX, barY, barW * light, barH);
  }

  // Sonar charges (top left, below light)
  if (!modeConfig.autoSonar && sonar.chargesLeft !== Infinity) {
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.font = "9px monospace";
    ctx.fillText(`sonar: ${sonar.chargesLeft}`, 8, 24);
  }

  // Level type indicator (top right)
  if (levelType !== "standard") {
    ctx.fillStyle = levelType === "gauntlet" ? "rgba(255,60,60,0.3)" : "rgba(255,200,60,0.3)";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "right";
    ctx.fillText(levelType.toUpperCase(), W - 8, 14);
    ctx.textAlign = "left";
  }
}
