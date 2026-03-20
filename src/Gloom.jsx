import { useState, useEffect, useRef, useCallback } from "react";

const COLS = 31;
const ROWS = 21;
const T = 20;
const VIS_R = 3.5;
const PING_NOISE = 2.5;
const PING_INTERVAL = 2000;
const PING_LIFE = 1500;

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function genMaze(cols, rows) {
  const g = Array.from({ length: rows }, () => Array(cols).fill(1));
  function carve(x, y) {
    g[y][x] = 0;
    for (const [dx, dy] of shuffle([[0, 2], [0, -2], [2, 0], [-2, 0]])) {
      const nx = x + dx, ny = y + dy;
      if (nx > 0 && nx < cols - 1 && ny > 0 && ny < rows - 1 && g[ny][nx] === 1) {
        g[y + dy / 2][x + dx / 2] = 0;
        carve(nx, ny);
      }
    }
  }
  carve(1, 1);
  let added = 0;
  const target = Math.floor(cols * rows * 0.045);
  for (let i = 0; i < cols * rows * 3 && added < target; i++) {
    const x = 1 + Math.floor(Math.random() * (cols - 2));
    const y = 1 + Math.floor(Math.random() * (rows - 2));
    if (g[y][x] === 1) {
      const adj = [[0, 1], [0, -1], [1, 0], [-1, 0]].filter(
        ([dy, dx]) => g[y + dy]?.[x + dx] === 0
      );
      if (adj.length >= 2) { g[y][x] = 0; added++; }
    }
  }
  return g;
}

function bfsPath(maze, sx, sy, tx, ty) {
  if (sx === tx && sy === ty) return [];
  const q = [[sx, sy]], vis = new Set([`${sx},${sy}`]), par = {};
  while (q.length) {
    const [x, y] = q.shift();
    for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const nx = x + dx, ny = y + dy, k = `${nx},${ny}`;
      if (!vis.has(k) && maze[ny]?.[nx] === 0) {
        vis.add(k);
        par[k] = [x, y];
        if (nx === tx && ny === ty) {
          const path = [];
          let cx = tx, cy = ty;
          while (cx !== sx || cy !== sy) {
            path.unshift([cx, cy]);
            [cx, cy] = par[`${cx},${cy}`];
          }
          return path;
        }
        q.push([nx, ny]);
      }
    }
  }
  return null;
}

function farthestFrom(maze, sx, sy) {
  const q = [[sx, sy, 0]], vis = new Set([`${sx},${sy}`]);
  let best = [sx, sy], maxD = 0;
  while (q.length) {
    const [x, y, d] = q.shift();
    if (d > maxD) { maxD = d; best = [x, y]; }
    for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const nx = x + dx, ny = y + dy, k = `${nx},${ny}`;
      if (!vis.has(k) && maze[ny]?.[nx] === 0) { vis.add(k); q.push([nx, ny, d + 1]); }
    }
  }
  return best;
}

function randEmpty(maze, avoid, minDist) {
  const cells = [];
  for (let y = 1; y < maze.length - 1; y++)
    for (let x = 1; x < maze[0].length - 1; x++)
      if (maze[y][x] === 0 && !avoid.some(([ax, ay]) => Math.abs(x - ax) + Math.abs(y - ay) < minDist))
        cells.push([x, y]);
  return cells.length ? cells[Math.floor(Math.random() * cells.length)] : [1, 1];
}

export default function Gloom() {
  const canvasRef = useRef(null);
  const gs = useRef(null);
  const statusRef = useRef("playing");
  const levelRef = useRef(1);
  const animRef = useRef(null);
  const keysRef = useRef(new Set());
  const lastMoveRef = useRef(0);
  const [ui, setUi] = useState({ status: "playing", level: 1 });

  const initGame = useCallback((lvl) => {
    const maze = genMaze(COLS, ROWS);
    const [ex, ey] = farthestFrom(maze, 1, 1);
    const numE = Math.min(2 + lvl, 8);
    const enemies = [];
    for (let i = 0; i < numE; i++) {
      const [px, py] = randEmpty(maze, [[1, 1], [ex, ey], ...enemies.map((e) => [e.x, e.y])], 7);
      enemies.push({ x: px, y: py });
    }
    gs.current = {
      maze, player: { x: 1, y: 1 }, exit: { x: ex, y: ey },
      enemies, pings: [],
      eSpeed: Math.max(280, 700 - lvl * 60),
      lastE: 0, lastP: 0,
    };
    statusRef.current = "playing";
    levelRef.current = lvl;
    setUi({ status: "playing", level: lvl });
  }, []);

  useEffect(() => {
    initGame(1);
    const kd = (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(e.key)) {
        e.preventDefault();
        keysRef.current.add(e.key);
      }
      if (e.key === "r" && statusRef.current !== "playing") {
        if (statusRef.current === "won") { initGame(levelRef.current + 1); }
        else { initGame(1); }
      }
    };
    const ku = (e) => keysRef.current.delete(e.key);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => { window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); };
  }, [initGame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let running = true;

    function loop(ts) {
      if (!running || !gs.current) return;
      const s = gs.current;
      const playing = statusRef.current === "playing";

      if (playing && ts - lastMoveRef.current > 115) {
        const k = keysRef.current;
        let dx = 0, dy = 0;
        if (k.has("ArrowUp") || k.has("w")) dy = -1;
        else if (k.has("ArrowDown") || k.has("s")) dy = 1;
        else if (k.has("ArrowLeft") || k.has("a")) dx = -1;
        else if (k.has("ArrowRight") || k.has("d")) dx = 1;
        if (dx || dy) {
          const nx = s.player.x + dx, ny = s.player.y + dy;
          if (s.maze[ny]?.[nx] === 0) { s.player.x = nx; s.player.y = ny; lastMoveRef.current = ts; }
        }
      }

      if (playing) {
        if (ts - s.lastE > s.eSpeed) {
          for (const e of s.enemies) {
            const path = bfsPath(s.maze, e.x, e.y, s.player.x, s.player.y);
            if (path && path.length > 0) { [e.x, e.y] = path[0]; }
          }
          s.lastE = ts;
        }
        if (ts - s.lastP > PING_INTERVAL) {
          for (const e of s.enemies) {
            s.pings.push({
              x: e.x + (Math.random() - 0.5) * PING_NOISE * 2,
              y: e.y + (Math.random() - 0.5) * PING_NOISE * 2,
              born: ts,
            });
          }
          s.lastP = ts;
        }
        s.pings = s.pings.filter((p) => ts - p.born < PING_LIFE);
        if (s.player.x === s.exit.x && s.player.y === s.exit.y) {
          statusRef.current = "won"; setUi((u) => ({ ...u, status: "won" }));
        }
        for (const e of s.enemies) {
          if (e.x === s.player.x && e.y === s.player.y) {
            statusRef.current = "lost"; setUi((u) => ({ ...u, status: "lost" }));
          }
        }
      }

      // --- RENDER ---
      const W = COLS * T, H = ROWS * T;
      ctx.fillStyle = "#07070c";
      ctx.fillRect(0, 0, W, H);

      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const dist = Math.sqrt((x - s.player.x) ** 2 + (y - s.player.y) ** 2);
          if (dist <= VIS_R + 0.5) {
            const a = Math.max(0, 1 - dist / (VIS_R + 1));
            ctx.fillStyle = s.maze[y][x] === 1
              ? `rgba(22,22,42,${a})`
              : `rgba(38,38,65,${a * 0.85})`;
            ctx.fillRect(x * T, y * T, T, T);
            if (s.maze[y][x] === 0 && a > 0.15) {
              ctx.strokeStyle = `rgba(55,55,90,${a * 0.25})`;
              ctx.lineWidth = 0.5;
              ctx.strokeRect(x * T, y * T, T, T);
            }
          }
        }
      }

      // Exit
      const eDist = Math.sqrt((s.exit.x - s.player.x) ** 2 + (s.exit.y - s.player.y) ** 2);
      const pulse = 0.5 + 0.5 * Math.sin(ts / 400);
      if (eDist <= VIS_R + 1) {
        const a = Math.max(0, 1 - eDist / (VIS_R + 1));
        ctx.fillStyle = `rgba(0,255,120,${a * (0.35 + pulse * 0.4)})`;
        ctx.fillRect(s.exit.x * T + 2, s.exit.y * T + 2, T - 4, T - 4);
      } else {
        const hint = Math.max(0.02, 0.08 - eDist * 0.002);
        ctx.fillStyle = `rgba(0,255,120,${hint * pulse})`;
        ctx.beginPath();
        ctx.arc(s.exit.x * T + T / 2, s.exit.y * T + T / 2, T * 0.25, 0, Math.PI * 2);
        ctx.fill();
      }

      // Pings
      for (const p of s.pings) {
        const age = (ts - p.born) / PING_LIFE;
        const a = (1 - age);
        const r = T * (0.2 + age * 1.3);
        const px = p.x * T + T / 2, py = p.y * T + T / 2;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,35,35,${a * 0.55})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(px, py, T * 0.1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,60,60,${Math.min(1, a * 1.2)})`;
        ctx.fill();
      }

      // Enemies if visible
      for (const e of s.enemies) {
        const d = Math.sqrt((e.x - s.player.x) ** 2 + (e.y - s.player.y) ** 2);
        if (d <= VIS_R) {
          const a = Math.max(0.2, 1 - d / VIS_R);
          ctx.fillStyle = `rgba(255,25,25,${a})`;
          ctx.fillRect(e.x * T + 3, e.y * T + 3, T - 6, T - 6);
        }
      }

      // Danger vignette
      let closest = Infinity;
      for (const e of s.enemies) {
        const d = Math.sqrt((e.x - s.player.x) ** 2 + (e.y - s.player.y) ** 2);
        if (d < closest) closest = d;
      }
      if (closest < 7) {
        const intensity = Math.max(0, 1 - closest / 7) * 0.25;
        const grd = ctx.createRadialGradient(W / 2, H / 2, W * 0.25, W / 2, H / 2, W * 0.55);
        grd.addColorStop(0, "rgba(255,0,0,0)");
        grd.addColorStop(1, `rgba(255,0,0,${intensity})`);
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);
      }

      // Player
      ctx.save();
      ctx.shadowColor = "#5588ff";
      ctx.shadowBlur = 14;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(s.player.x * T + T / 2, s.player.y * T + T / 2, T * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Player ambient light ring
      const lg = ctx.createRadialGradient(
        s.player.x * T + T / 2, s.player.y * T + T / 2, 0,
        s.player.x * T + T / 2, s.player.y * T + T / 2, T * 1.8
      );
      lg.addColorStop(0, "rgba(80,120,255,0.06)");
      lg.addColorStop(1, "rgba(80,120,255,0)");
      ctx.fillStyle = lg;
      ctx.fillRect(0, 0, W, H);

      animRef.current = requestAnimationFrame(loop);
    }

    animRef.current = requestAnimationFrame(loop);
    return () => { running = false; if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  const move = (dx, dy) => {
    if (statusRef.current !== "playing" || !gs.current) return;
    const s = gs.current;
    const nx = s.player.x + dx, ny = s.player.y + dy;
    if (s.maze[ny]?.[nx] === 0) { s.player.x = nx; s.player.y = ny; }
  };

  const btn = {
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
    color: "#667", width: 44, height: 44, fontSize: 14, borderRadius: 6,
    cursor: "pointer", fontFamily: "monospace", display: "flex",
    alignItems: "center", justifyContent: "center", userSelect: "none",
    WebkitTapHighlightColor: "transparent",
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh", background: "#06060a",
      color: "#999", fontFamily: "'SF Mono',Monaco,Consolas,monospace",
      padding: 16, boxSizing: "border-box", overflow: "hidden",
    }}>
      <div style={{
        fontSize: 11, letterSpacing: 5, color: "#3a3a50", marginBottom: 12,
        textTransform: "uppercase",
      }}>
        Gloom <span style={{ color: "#555", letterSpacing: 2 }}>lvl {ui.level}</span>
      </div>

      <div style={{ position: "relative", lineHeight: 0 }}>
        <canvas
          ref={canvasRef}
          width={COLS * T}
          height={ROWS * T}
          style={{
            border: "1px solid #14142a",
            borderRadius: 6,
            display: "block",
            maxWidth: "calc(100vw - 32px)",
            height: "auto",
            imageRendering: "pixelated",
          }}
        />

        {ui.status !== "playing" && (
          <div style={{
            position: "absolute", inset: 0, display: "flex",
            flexDirection: "column", alignItems: "center", justifyContent: "center",
            background: "rgba(6,6,10,0.88)", borderRadius: 6, gap: 14,
          }}>
            <div style={{
              fontSize: 22, fontWeight: 700, letterSpacing: 3,
              color: ui.status === "won" ? "#00ff88" : "#ff4040",
            }}>
              {ui.status === "won" ? "ESCAPED" : "CAUGHT"}
            </div>
            <div style={{ fontSize: 11, color: "#445", marginBottom: 4 }}>
              {ui.status === "won"
                ? `level ${ui.level} cleared`
                : "the darkness got you"}
            </div>
            <button
              onClick={() => ui.status === "won" ? initGame(levelRef.current + 1) : initGame(1)}
              style={{
                background: "none",
                border: `1px solid ${ui.status === "won" ? "#00ff8844" : "#ff404044"}`,
                color: ui.status === "won" ? "#00ff88" : "#ff6060",
                padding: "8px 28px", cursor: "pointer", borderRadius: 4,
                fontFamily: "inherit", fontSize: 12, letterSpacing: 2,
              }}
            >
              {ui.status === "won" ? "NEXT" : "RETRY"} <span style={{ fontSize: 10, opacity: 0.5 }}>[R]</span>
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
        <button style={btn} onPointerDown={() => move(0, -1)}>W</button>
        <div style={{ display: "flex", gap: 3 }}>
          <button style={btn} onPointerDown={() => move(-1, 0)}>A</button>
          <button style={btn} onPointerDown={() => move(0, 1)}>S</button>
          <button style={btn} onPointerDown={() => move(1, 0)}>D</button>
        </div>
      </div>

      <div style={{ marginTop: 14, fontSize: 10, color: "#2a2a3e", textAlign: "center", lineHeight: 1.7 }}>
        WASD / arrows to move &middot; reach the <span style={{ color: "#00ff8866" }}>green exit</span> &middot; avoid <span style={{ color: "#ff404066" }}>red threats</span>
        <br />pings show approximate enemy positions
      </div>
    </div>
  );
}
