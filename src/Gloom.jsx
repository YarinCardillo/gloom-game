import { useState, useEffect, useRef, useCallback } from "react";
import { TILE, MOVE_REPEAT_MS } from "./engine/constants.js";
import {
  createGameState, updateEnemies, updateSonar,
  updateShout, updateLight, updateClosingCorridors,
  hasReachedExit, isPlayerCaught, movePlayer,
  triggerSonarSweep, startShoutCharge, releaseShout,
} from "./engine/gameState.js";
import { savePlayerRecord } from "./engine/modes.js";
import { renderFrame } from "./engine/renderer.js";
import { getNarrativeLine } from "./engine/narrative.js";
import GameOverlay from "./components/GameOverlay.jsx";
import TouchControls from "./components/TouchControls.jsx";
import ModeSelect from "./components/ModeSelect.jsx";
import NarrativeOverlay from "./components/NarrativeOverlay.jsx";

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
  const statusRef = useRef("menu");
  const levelRef = useRef(1);
  const modeRef = useRef(null);
  const animRef = useRef(null);
  const keysRef = useRef(new Set());
  const lastMoveRef = useRef(0);
  const movedThisFrame = useRef(false);
  const spaceDownRef = useRef(false);

  const [ui, setUi] = useState({ status: "menu", level: 1 });
  const [narrative, setNarrative] = useState(null);

  const initGame = useCallback((level, modeConfig) => {
    const mode = modeConfig || modeRef.current;
    modeRef.current = mode;
    stateRef.current = createGameState(level, mode);
    statusRef.current = "playing";
    levelRef.current = level;
    lastMoveRef.current = 0;
    movedThisFrame.current = false;
    setUi({ status: "playing", level });
    setNarrative(null);
  }, []);

  const handleModeSelect = useCallback((mode) => {
    modeRef.current = mode;
    initGame(1, mode);
  }, [initGame]);

  const handleWin = useCallback(() => {
    const level = levelRef.current;
    const mode = modeRef.current;
    savePlayerRecord(mode.id, level);

    // Show narrative between levels
    const line = getNarrativeLine(level);
    statusRef.current = "narrative";
    setUi((prev) => ({ ...prev, status: "won" }));
    setNarrative({ line, nextLevel: level + 1 });
  }, []);

  const handleNarrativeDone = useCallback(() => {
    if (narrative) {
      initGame(narrative.nextLevel);
    }
  }, [narrative, initGame]);

  const handleOverlayAction = useCallback(() => {
    if (statusRef.current === "narrative" || ui.status === "won") {
      if (narrative) {
        handleNarrativeDone();
      } else {
        initGame(levelRef.current + 1);
      }
    } else {
      initGame(1);
    }
  }, [initGame, narrative, handleNarrativeDone, ui.status]);

  const handleTouchMove = useCallback((dx, dy) => {
    if (statusRef.current !== "playing" || !stateRef.current) return;
    movePlayer(stateRef.current, dx, dy);
    movedThisFrame.current = true;
  }, []);

  const handleBackToMenu = useCallback(() => {
    statusRef.current = "menu";
    stateRef.current = null;
    setUi({ status: "menu", level: 1 });
    setNarrative(null);
  }, []);

  // Keyboard input
  useEffect(() => {
    function onKeyDown(e) {
      if (MOVE_KEYS.includes(e.key)) {
        e.preventDefault();
        keysRef.current.add(e.key);
      }
      if (e.key === " " && statusRef.current === "playing") {
        e.preventDefault();
        if (!spaceDownRef.current) {
          spaceDownRef.current = true;
          if (stateRef.current) {
            startShoutCharge(stateRef.current, performance.now());
          }
        }
      }
      if (e.key === "r" && statusRef.current !== "playing" && statusRef.current !== "menu") {
        handleOverlayAction();
      }
      if (e.key === "Escape") {
        handleBackToMenu();
      }
    }

    function onKeyUp(e) {
      keysRef.current.delete(e.key);
      if (e.key === " " && spaceDownRef.current) {
        spaceDownRef.current = false;
        if (stateRef.current && statusRef.current === "playing") {
          releaseShout(stateRef.current, performance.now());
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [handleOverlayAction, handleBackToMenu]);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let running = true;

    function loop(timestamp) {
      if (!running) return;

      if (!stateRef.current || statusRef.current !== "playing") {
        animRef.current = requestAnimationFrame(loop);
        return;
      }

      const state = stateRef.current;
      movedThisFrame.current = false;

      // Process keyboard input
      if (timestamp - lastMoveRef.current > MOVE_REPEAT_MS) {
        const dir = resolveKeyDirection(keysRef.current);
        if (dir) {
          movePlayer(state, dir[0], dir[1]);
          lastMoveRef.current = timestamp;
          movedThisFrame.current = true;
        }
      }

      // Update all systems
      updateEnemies(state, timestamp);
      updateSonar(state, timestamp);
      updateShout(state, timestamp);
      updateLight(state, movedThisFrame.current);
      updateClosingCorridors(state, timestamp);

      // Check win/lose
      if (hasReachedExit(state)) {
        handleWin();
      } else if (isPlayerCaught(state)) {
        statusRef.current = "lost";
        setUi((prev) => ({ ...prev, status: "lost" }));
      }

      // Resize canvas if needed (level scaling)
      if (canvas.width !== state.cols * TILE || canvas.height !== state.rows * TILE) {
        canvas.width = state.cols * TILE;
        canvas.height = state.rows * TILE;
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
  }, [handleWin]);

  // Menu screen
  if (ui.status === "menu") {
    return <ModeSelect onSelect={handleModeSelect} />;
  }

  // Narrative between levels
  if (narrative && statusRef.current === "narrative") {
    return (
      <NarrativeOverlay
        line={narrative.line}
        onDone={handleNarrativeDone}
      />
    );
  }

  const state = stateRef.current;
  const canvasW = state ? state.cols * TILE : 620;
  const canvasH = state ? state.rows * TILE : 420;

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100dvh", background: "#06060a",
      color: "#999", fontFamily: "'SF Mono',Monaco,Consolas,monospace",
      padding: "12px 16px", boxSizing: "border-box", overflow: "hidden",
      gap: 8,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
      }}>
        <div style={{
          fontSize: 11, letterSpacing: 5, color: "#3a3a50",
          textTransform: "uppercase",
        }}>
          Gloom
        </div>
        <div style={{ fontSize: 10, color: "#555", letterSpacing: 2 }}>
          lvl {ui.level}
        </div>
        {modeRef.current && modeRef.current.id !== "normal" && (
          <div style={{
            fontSize: 9, color: "#553322", letterSpacing: 1,
            textTransform: "uppercase",
          }}>
            {modeRef.current.name}
          </div>
        )}
      </div>

      <div style={{ position: "relative", lineHeight: 0, flexShrink: 0 }}>
        <canvas
          ref={canvasRef}
          width={canvasW}
          height={canvasH}
          style={{
            border: "1px solid #14142a",
            borderRadius: 6,
            display: "block",
            maxWidth: "calc(100vw - 32px)",
            maxHeight: "calc(100dvh - 150px)",
            width: "auto",
            height: "auto",
            objectFit: "contain",
            imageRendering: "pixelated",
          }}
        />
        {ui.status !== "playing" && ui.status !== "menu" && (
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
        WASD / arrows to move &middot; space for sonar
        {modeRef.current && !modeRef.current.autoSonar && " (hold for reveal)"}
        &middot; esc for menu
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
