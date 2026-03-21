import {
  PING_LIFE, DANGER_RADIUS, SHOUT_REVEAL_RADIUS, SHOUT_DURATION, SAFE_ROOM_RADIUS,
} from "./constants.js";
import { getEffectiveVisRadius, isInSafeRoom } from "./gameState.js";

/**
 * Render a single frame. T = tile size in pixels.
 */
export function renderFrame(ctx, state, timestamp, T) {
  const W = state.cols * T;
  const H = state.rows * T;
  const visR = getEffectiveVisRadius(state);

  ctx.fillStyle = "#0a0a14";
  ctx.fillRect(0, 0, W, H);

  renderVisibleTiles(ctx, state, visR, T);
  renderBreadcrumbs(ctx, state, visR, T);
  renderSafeRooms(ctx, state, visR, T);
  renderExit(ctx, state, timestamp, visR, T);
  renderSonarSweep(ctx, state, T);
  renderPings(ctx, state, timestamp, T);
  renderShoutReveal(ctx, state, timestamp, T, W, H);
  renderVisibleEnemies(ctx, state, visR, T);
  renderDangerVignette(ctx, state, W, H);
  renderPlayer(ctx, state, T, W, H);
  renderHUD(ctx, state, W, T);
}

function renderVisibleTiles(ctx, state, visR, T) {
  const { player, maze, cols, rows } = state;
  const shoutR = state.shout.active ? SHOUT_REVEAL_RADIUS : 0;
  const effectiveR = Math.max(visR, shoutR);

  const minX = Math.max(0, Math.floor(player.x - effectiveR - 1));
  const maxX = Math.min(cols - 1, Math.ceil(player.x + effectiveR + 1));
  const minY = Math.max(0, Math.floor(player.y - effectiveR - 1));
  const maxY = Math.min(rows - 1, Math.ceil(player.y + effectiveR + 1));

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const dist = Math.hypot(x - player.x, y - player.y);
      if (dist > effectiveR + 0.5) continue;

      const alpha = Math.max(0, 1 - dist / (effectiveR + 1));
      const isWall = maze[y][x] === 1;
      const isClosed = state.closedTiles.has(`${x},${y}`);

      if (isClosed) {
        ctx.fillStyle = `rgba(45,20,20,${alpha * 0.7})`;
      } else if (isWall) {
        ctx.fillStyle = `rgba(35,35,60,${alpha})`;
      } else {
        ctx.fillStyle = `rgba(50,50,80,${alpha * 0.9})`;
      }
      ctx.fillRect(x * T, y * T, T, T);

      if (!isWall && !isClosed && alpha > 0.15) {
        ctx.strokeStyle = `rgba(70,70,110,${alpha * 0.4})`;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x * T, y * T, T, T);
      }
    }
  }
}

function renderBreadcrumbs(ctx, state, visR, T) {
  if (!state.modeConfig.breadcrumbs) return;
  for (const key of state.visited) {
    const [vx, vy] = key.split(",").map(Number);
    const dist = Math.hypot(vx - state.player.x, vy - state.player.y);
    if (dist > visR + 0.5 || dist < 0.5) continue;
    const alpha = Math.max(0, 1 - dist / (visR + 1)) * 0.25;
    ctx.fillStyle = `rgba(80,120,255,${alpha})`;
    const pad = Math.max(1, T * 0.3);
    ctx.fillRect(vx * T + pad, vy * T + pad, T - pad * 2, T - pad * 2);
  }
}

function renderSafeRooms(ctx, state, visR, T) {
  for (const room of state.safeRooms) {
    const dist = Math.hypot(room.x - state.player.x, room.y - state.player.y);
    if (dist > visR + 2) continue;
    const alpha = Math.max(0, 1 - dist / (visR + 2));
    const cx = room.x * T + T / 2, cy = room.y * T + T / 2;
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, T * SAFE_ROOM_RADIUS);
    glow.addColorStop(0, `rgba(255,220,120,${alpha * 0.25})`);
    glow.addColorStop(0.6, `rgba(255,200,80,${alpha * 0.1})`);
    glow.addColorStop(1, `rgba(255,180,60,0)`);
    ctx.fillStyle = glow;
    ctx.fillRect((room.x - 2) * T, (room.y - 2) * T, 4 * T, 4 * T);
    ctx.fillStyle = `rgba(255,220,130,${alpha * 0.15})`;
    ctx.fillRect(room.x * T + 1, room.y * T + 1, T - 2, T - 2);
  }
}

function renderExit(ctx, state, timestamp, visR, T) {
  const { exit, player, modeConfig } = state;
  const dist = Math.hypot(exit.x - player.x, exit.y - player.y);
  const pulse = 0.5 + 0.5 * Math.sin(timestamp / 400);

  if (dist <= visR + 1) {
    const alpha = Math.max(0, 1 - dist / (visR + 1));
    ctx.fillStyle = `rgba(0,255,120,${alpha * (0.35 + pulse * 0.4)})`;
    ctx.fillRect(exit.x * T + 2, exit.y * T + 2, T - 4, T - 4);
  } else if (modeConfig.showExitHint) {
    const hint = Math.max(0.02, 0.08 - dist * 0.002);
    ctx.fillStyle = `rgba(0,255,120,${hint * pulse})`;
    ctx.beginPath();
    ctx.arc(exit.x * T + T / 2, exit.y * T + T / 2, T * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderSonarSweep(ctx, state, T) {
  if (!state.sonar.active) return;
  const { cols, rows } = state;
  const progress = state.sonar.sweepProgress;
  const sweepX = progress * cols * T;
  const alpha = 0.35 * (1 - Math.abs(progress - 0.5) * 2);

  ctx.strokeStyle = `rgba(255,50,50,${alpha})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sweepX, 0);
  ctx.lineTo(sweepX, rows * T);
  ctx.stroke();

  for (let i = 1; i <= 3; i++) {
    const trailX = sweepX - i * T;
    if (trailX < 0) continue;
    ctx.strokeStyle = `rgba(255,30,30,${alpha * (1 - i / 4) * 0.4})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(trailX, 0);
    ctx.lineTo(trailX, rows * T);
    ctx.stroke();
  }
}

function renderPings(ctx, state, timestamp, T) {
  for (const ping of state.sonar.pings) {
    const age = (timestamp - ping.born) / PING_LIFE;
    const alpha = 1 - age;
    const px = ping.x * T + T / 2;
    const py = ping.y * T + T / 2;
    const dotSize = T * (0.15 - age * 0.05);
    if (dotSize > 0) {
      ctx.beginPath();
      ctx.arc(px, py, dotSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,60,60,${Math.min(1, alpha * 1.2)})`;
      ctx.fill();
    }
  }
}

function renderShoutReveal(ctx, state, timestamp, T, W, H) {
  if (!state.shout.active) return;
  const age = (timestamp - state.shout.revealStart) / SHOUT_DURATION;
  const alpha = Math.max(0, 0.15 * (1 - age));
  const radius = SHOUT_REVEAL_RADIUS * T * (0.3 + age * 0.7);
  const px = state.player.x * T + T / 2;
  const py = state.player.y * T + T / 2;
  const glow = ctx.createRadialGradient(px, py, 0, px, py, radius);
  glow.addColorStop(0, `rgba(120,160,255,${alpha})`);
  glow.addColorStop(0.7, `rgba(80,120,255,${alpha * 0.5})`);
  glow.addColorStop(1, `rgba(60,80,255,0)`);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
}

function renderVisibleEnemies(ctx, state, visR, T) {
  const shoutR = state.shout.active ? SHOUT_REVEAL_RADIUS : 0;
  const effectiveR = Math.max(visR, shoutR);

  for (const enemy of state.enemies) {
    const dist = Math.hypot(enemy.x - state.player.x, enemy.y - state.player.y);
    if (enemy.type === "lurker" && dist > 2 && !state.shout.active) continue;
    if (dist > effectiveR) continue;
    const alpha = Math.max(0.2, 1 - dist / effectiveR);
    const [r, g, b] = enemy.color;
    ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
    const pad = Math.max(2, T * 0.15);
    ctx.fillRect(enemy.x * T + pad, enemy.y * T + pad, T - pad * 2, T - pad * 2);
    if (enemy.type === "stalker" && alpha > 0.5) {
      ctx.strokeStyle = `rgba(${r},${g},${b},${alpha * 0.3})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(enemy.x * T + pad - 1, enemy.y * T + pad - 1, T - pad * 2 + 2, T - pad * 2 + 2);
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

function renderPlayer(ctx, state, T, W, H) {
  const px = state.player.x * T + T / 2;
  const py = state.player.y * T + T / 2;

  if (state.shout.charging) {
    const glow = ctx.createRadialGradient(px, py, 0, px, py, T * 2.5);
    glow.addColorStop(0, "rgba(120,160,255,0.15)");
    glow.addColorStop(1, "rgba(120,160,255,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
  }

  ctx.save();
  ctx.shadowColor = "#5588ff";
  ctx.shadowBlur = Math.max(12, T * 1.0);
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(px, py, T * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const lightR = T * 1.8 * (state.modeConfig.lightEnabled ? (0.5 + 0.5 * state.light) : 1);
  const glow = ctx.createRadialGradient(px, py, 0, px, py, lightR);
  glow.addColorStop(0, "rgba(80,120,255,0.12)");
  glow.addColorStop(1, "rgba(80,120,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
}

function renderHUD(ctx, state, W) {
  const { modeConfig, light, sonar, levelType } = state;

  if (modeConfig.lightEnabled) {
    const barW = 60, barH = 4, barX = 8, barY = 8;
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = light > 0.3 ? "rgba(80,120,255,0.7)" : "rgba(255,80,80,0.8)";
    ctx.fillRect(barX, barY, barW * light, barH);
  }

  if (!modeConfig.autoSonar && sonar.chargesLeft !== Infinity) {
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.font = "10px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`sonar: ${sonar.chargesLeft}`, 8, 24);
  }

  if (levelType !== "standard") {
    ctx.fillStyle = levelType === "gauntlet" ? "rgba(255,60,60,0.5)" : "rgba(255,200,60,0.5)";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "right";
    ctx.fillText(levelType.toUpperCase(), W - 8, 14);
    ctx.textAlign = "left";
  }
}
