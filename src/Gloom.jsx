import { useState, useEffect, useRef, useCallback } from "react";
import { COLS, ROWS, TILE, MOVE_REPEAT_MS } from "./engine/constants.js";
import {
  createGameState, updateEnemies, updatePings,
  pruneExpiredPings, hasReachedExit, isPlayerCaught, movePlayer,
} from "./engine/gameState.js";
import { renderFrame } from "./engine/renderer.js";
import GameOverlay from "./components/GameOverlay.jsx";
import TouchControls from "./components/TouchControls.jsx";

const MOVE_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"];

const KEY_TO_DIR = {
  ArrowUp: [0, -1], w: [0, -1],
  ArrowDown: [0, 1], s: [0, 1],
  ArrowLeft: [-1, 0], a: [-1, 0],
  ArrowRight: [1, 0], d: [1, 0],
};

export default function Gloom() {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const statusRef = useRef("playing");
  const levelRef = useRef(1);
  const animRef = useRef(null);
  const keysRef = useRef(new Set());
  const lastMoveRef = useRef(0);
  const [ui, setUi] = useState({ status: "playing", level: 1 });

  const initGame = useCallback((level) => {
    stateRef.current = createGameState(level);
    statusRef.current = "playing";
    levelRef.current = level;
    lastMoveRef.current = 0;
    setUi({ status: "playing", level });
  }, []);

  const handleOverlayAction = useCallback(() => {
    if (statusRef.current === "won") {
      initGame(levelRef.current + 1);
    } else {
      initGame(1);
    }
  }, [initGame]);

  const handleTouchMove = useCallback((dx, dy) => {
    if (statusRef.current !== "playing" || !stateRef.current) return;
    movePlayer(stateRef.current, dx, dy);
  }, []);

  // Keyboard input
  useEffect(() => {
    initGame(1);

    function onKeyDown(e) {
      if (MOVE_KEYS.includes(e.key)) {
        e.preventDefault();
        keysRef.current.add(e.key);
      }
      if (e.key === "r" && statusRef.current !== "playing") {
        handleOverlayAction();
      }
    }

    function onKeyUp(e) {
      keysRef.current.delete(e.key);
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [initGame, handleOverlayAction]);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let running = true;

    function loop(timestamp) {
      if (!running || !stateRef.current) return;
      const state = stateRef.current;
      const isPlaying = statusRef.current === "playing";

      // Process keyboard input
      if (isPlaying && timestamp - lastMoveRef.current > MOVE_REPEAT_MS) {
        const dir = resolveKeyDirection(keysRef.current);
        if (dir) {
          movePlayer(state, dir[0], dir[1]);
          lastMoveRef.current = timestamp;
        }
      }

      // Update game state
      if (isPlaying) {
        updateEnemies(state, timestamp);
        updatePings(state, timestamp);
        pruneExpiredPings(state, timestamp);

        if (hasReachedExit(state)) {
          statusRef.current = "won";
          setUi((prev) => ({ ...prev, status: "won" }));
        } else if (isPlayerCaught(state)) {
          statusRef.current = "lost";
          setUi((prev) => ({ ...prev, status: "lost" }));
        }
      }

      // Render
      renderFrame(ctx, state, timestamp);
      animRef.current = requestAnimationFrame(loop);
    }

    animRef.current = requestAnimationFrame(loop);
    return () => {
      running = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100dvh", background: "#06060a",
      color: "#999", fontFamily: "'SF Mono',Monaco,Consolas,monospace",
      padding: "12px 16px", boxSizing: "border-box", overflow: "hidden",
      gap: 10,
    }}>
      <div style={{
        fontSize: 11, letterSpacing: 5, color: "#3a3a50",
        textTransform: "uppercase", flexShrink: 0,
      }}>
        Gloom{" "}
        <span style={{ color: "#555", letterSpacing: 2 }}>lvl {ui.level}</span>
      </div>

      <div style={{ position: "relative", lineHeight: 0, flexShrink: 0 }}>
        <canvas
          ref={canvasRef}
          width={COLS * TILE}
          height={ROWS * TILE}
          style={{
            border: "1px solid #14142a",
            borderRadius: 6,
            display: "block",
            maxWidth: "calc(100vw - 32px)",
            maxHeight: "calc(100dvh - 160px)",
            width: "auto",
            height: "auto",
            objectFit: "contain",
            imageRendering: "pixelated",
          }}
        />
        {ui.status !== "playing" && (
          <GameOverlay
            status={ui.status}
            level={ui.level}
            onAction={handleOverlayAction}
          />
        )}
      </div>

      <TouchControls onMove={handleTouchMove} />

      <div style={{
        fontSize: 10, color: "#2a2a3e", textAlign: "center",
        lineHeight: 1.7, flexShrink: 0,
      }}>
        WASD / arrows to move &middot; reach the{" "}
        <span style={{ color: "#00ff8866" }}>green exit</span> &middot; avoid{" "}
        <span style={{ color: "#ff404066" }}>red threats</span>
        <br />
        pings show approximate enemy positions
      </div>
    </div>
  );
}

function resolveKeyDirection(keys) {
  for (const key of keys) {
    const dir = KEY_TO_DIR[key];
    if (dir) return dir;
  }
  return null;
}
