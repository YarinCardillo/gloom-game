import { useState, useEffect, useRef, useCallback } from "react";
import { MOVE_REPEAT_MS, computeTileSize } from "./engine/constants.js";
import {
  createGameState, updateEnemies, updateSonar,
  updateShout, updateLight, updateClosingCorridors,
  hasReachedExit, isPlayerCaught, movePlayer,
  startShoutCharge, releaseShout,
} from "./engine/gameState.js";
import { savePlayerRecord } from "./engine/modes.js";
import { renderFrame } from "./engine/renderer.js";
import { getNarrativeLine } from "./engine/narrative.js";
import GameOverlay from "./components/GameOverlay.jsx";
import ModeSelect from "./components/ModeSelect.jsx";
import NarrativeOverlay from "./components/NarrativeOverlay.jsx";
import HelpOverlay from "./components/HelpOverlay.jsx";

const MOVE_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"];
const KEY_TO_DIR = {
  ArrowUp: [0, -1], w: [0, -1],
  ArrowDown: [0, 1], s: [0, 1],
  ArrowLeft: [-1, 0], a: [-1, 0],
  ArrowRight: [1, 0], d: [1, 0],
};
const SWIPE_THRESHOLD = 20;

export default function Gloom() {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const statusRef = useRef("menu");
  const levelRef = useRef(1);
  const modeRef = useRef(null);
  const animRef = useRef(null);
  const keysRef = useRef(new Set());
  const lastMoveRef = useRef(0);
  const movedRef = useRef(false);
  const spaceDownRef = useRef(false);
  const tileSizeRef = useRef(20);
  const touchStartRef = useRef(null);

  const [ui, setUi] = useState({ status: "menu", level: 1 });
  const [narrative, setNarrative] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const isTouchDevice =
    typeof window !== "undefined" &&
    ("ontouchstart" in window || navigator.maxTouchPoints > 0);
  const sonarChargingRef = useRef(false);

  const updateCanvasSize = useCallback(() => {
    const state = stateRef.current;
    const canvas = canvasRef.current;
    if (!state || !canvas) return;

    const pad = isTouchDevice ? 0 : 32;
    const headerH = isTouchDevice ? 0 : 36;
    const footerH = isTouchDevice ? 0 : 50;
    const maxW = window.innerWidth - pad;
    const maxH = window.innerHeight - headerH - footerH - pad;
    const T = computeTileSize(state.cols, state.rows, maxW, maxH);

    tileSizeRef.current = T;
    canvas.width = state.cols * T;
    canvas.height = state.rows * T;
  }, []);

  const initGame = useCallback((level, modeConfig) => {
    const mode = modeConfig || modeRef.current;
    modeRef.current = mode;
    stateRef.current = createGameState(level, mode);
    statusRef.current = "playing";
    levelRef.current = level;
    lastMoveRef.current = 0;
    movedRef.current = false;
    setUi({ status: "playing", level });
    setNarrative(null);
    requestAnimationFrame(() => updateCanvasSize());
  }, [updateCanvasSize]);

  const handleModeSelect = useCallback((mode) => {
    modeRef.current = mode;
    initGame(1, mode);
  }, [initGame]);

  const handleWin = useCallback(() => {
    const level = levelRef.current;
    savePlayerRecord(modeRef.current.id, level);
    statusRef.current = "narrative";
    setUi((prev) => ({ ...prev, status: "won" }));
    setNarrative({ line: getNarrativeLine(level), nextLevel: level + 1 });
  }, []);

  const handleNarrativeDone = useCallback(() => {
    if (narrative) initGame(narrative.nextLevel);
  }, [narrative, initGame]);

  const handleOverlayAction = useCallback(() => {
    if (ui.status === "won" && narrative) {
      handleNarrativeDone();
    } else if (ui.status === "won") {
      initGame(levelRef.current + 1);
    } else {
      initGame(1);
    }
  }, [initGame, narrative, handleNarrativeDone, ui.status]);

  const handleMove = useCallback((dx, dy) => {
    if (statusRef.current !== "playing" || !stateRef.current) return;
    movePlayer(stateRef.current, dx, dy);
    movedRef.current = true;
  }, []);

  const handleBackToMenu = useCallback(() => {
    statusRef.current = "menu";
    stateRef.current = null;
    setUi({ status: "menu", level: 1 });
    setNarrative(null);
  }, []);

  // Window resize
  useEffect(() => {
    const onResize = () => updateCanvasSize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [updateCanvasSize]);

  // Keyboard input
  useEffect(() => {
    function onKeyDown(e) {
      if (MOVE_KEYS.includes(e.key)) {
        e.preventDefault();
        keysRef.current.add(e.key);
      }
      if (e.key === " " && statusRef.current === "playing") {
        e.preventDefault();
        if (!spaceDownRef.current && stateRef.current) {
          spaceDownRef.current = true;
          startShoutCharge(stateRef.current, performance.now());
        }
      }
      if (e.key === "r" && statusRef.current !== "playing" && statusRef.current !== "menu") {
        handleOverlayAction();
      }
      if (e.key === "Escape") handleBackToMenu();
      if (e.key === "?") setShowHelp((v) => !v);
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

  // Touch: swipe to move, hold to charge sonar
  useEffect(() => {
    function onTouchStart(e) {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      touchStartRef.current = { x: t.clientX, y: t.clientY, time: Date.now(), swiped: false };

      if (stateRef.current && statusRef.current === "playing") {
        startShoutCharge(stateRef.current, performance.now());
        sonarChargingRef.current = true;
      }
    }

    function onTouchMove(e) {
      if (statusRef.current === "playing") e.preventDefault();
      if (!touchStartRef.current || touchStartRef.current.swiped) return;

      const t = e.touches[0];
      const dx = t.clientX - touchStartRef.current.x;
      const dy = t.clientY - touchStartRef.current.y;

      if (Math.abs(dx) > SWIPE_THRESHOLD || Math.abs(dy) > SWIPE_THRESHOLD) {
        touchStartRef.current.swiped = true;
        if (sonarChargingRef.current && stateRef.current) {
          stateRef.current.shoutChargeStart = null;
          sonarChargingRef.current = false;
        }
      }
    }

    function onTouchEnd(e) {
      if (!touchStartRef.current) return;
      const info = touchStartRef.current;
      touchStartRef.current = null;

      if (statusRef.current !== "playing" || !stateRef.current) {
        sonarChargingRef.current = false;
        return;
      }

      if (info.swiped) {
        const t = e.changedTouches[0];
        const dx = t.clientX - info.x;
        const dy = t.clientY - info.y;
        if (Math.abs(dx) > Math.abs(dy)) {
          handleMove(dx > 0 ? 1 : -1, 0);
        } else {
          handleMove(0, dy > 0 ? 1 : -1);
        }
      } else if (sonarChargingRef.current) {
        releaseShout(stateRef.current, performance.now());
      }
      sonarChargingRef.current = false;
    }

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [handleMove]);

  // Game loop
  useEffect(() => {
    let running = true;

    function loop(timestamp) {
      if (!running) return;

      const canvas = canvasRef.current;
      const state = stateRef.current;

      if (!canvas || !state || statusRef.current !== "playing") {
        animRef.current = requestAnimationFrame(loop);
        return;
      }

      const ctx = canvas.getContext("2d");
      const T = tileSizeRef.current;
      let moved = movedRef.current;
      movedRef.current = false;

      // Keyboard movement
      if (timestamp - lastMoveRef.current > MOVE_REPEAT_MS) {
        const dir = resolveKeyDirection(keysRef.current);
        if (dir) {
          movePlayer(state, dir[0], dir[1]);
          lastMoveRef.current = timestamp;
          moved = true;
        }
      }

      updateEnemies(state, timestamp);
      updateSonar(state, timestamp);
      updateShout(state, timestamp);
      updateLight(state, moved);
      updateClosingCorridors(state, timestamp);

      if (hasReachedExit(state)) {
        handleWin();
      } else if (isPlayerCaught(state)) {
        statusRef.current = "lost";
        setUi((prev) => ({ ...prev, status: "lost" }));
      }

      const expectedW = state.cols * T;
      const expectedH = state.rows * T;
      if (canvas.width !== expectedW || canvas.height !== expectedH) {
        canvas.width = expectedW;
        canvas.height = expectedH;
      }

      renderFrame(ctx, state, timestamp, T);
      animRef.current = requestAnimationFrame(loop);
    }

    animRef.current = requestAnimationFrame(loop);
    return () => {
      running = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [handleWin]);

  // --- RENDER ---

  if (showHelp) {
    return <HelpOverlay onClose={() => setShowHelp(false)} />;
  }

  if (ui.status === "menu") {
    return <ModeSelect onSelect={handleModeSelect} />;
  }

  if (narrative && statusRef.current === "narrative") {
    return <NarrativeOverlay line={narrative.line} onDone={handleNarrativeDone} />;
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", height: "100dvh", background: "#06060a",
      color: "#ccc", fontFamily: "'SF Mono',Monaco,Consolas,monospace",
      padding: isTouchDevice ? 0 : "8px 16px", boxSizing: "border-box",
      overflow: "hidden", gap: isTouchDevice ? 0 : 6, touchAction: "none",
    }}>
      {!isTouchDevice && (
        <div style={{
          display: "flex", alignItems: "center", gap: 12, flexShrink: 0, height: 28,
        }}>
          <span style={{ fontSize: 12, letterSpacing: 5, color: "#a0a0d0", textTransform: "uppercase", fontWeight: 600 }}>
            Gloom
          </span>
          <span style={{ fontSize: 11, color: "#b0b0d0", letterSpacing: 2 }}>
            lvl {ui.level}
          </span>
          {modeRef.current && modeRef.current.id !== "normal" && (
            <span style={{ fontSize: 10, color: "#cc9966", letterSpacing: 1, textTransform: "uppercase", fontWeight: 600 }}>
              {modeRef.current.name}
            </span>
          )}
        </div>
      )}

      <div style={{ position: "relative", lineHeight: 0, flexShrink: 1, flexGrow: 1, display: "flex", alignItems: "center" }}>
        <canvas
          ref={canvasRef}
          width={100}
          height={100}
          style={{
            border: isTouchDevice ? "none" : "1px solid #2a2a50",
            borderRadius: isTouchDevice ? 0 : 6,
            display: "block",
            imageRendering: "pixelated",
            touchAction: "none",
          }}
        />
        {ui.status !== "playing" && ui.status !== "menu" && (
          <GameOverlay status={ui.status} level={ui.level} onAction={handleOverlayAction} />
        )}
      </div>

      {!isTouchDevice && (
        <div style={{
          fontSize: 10, color: "#8888b0", textAlign: "center",
          lineHeight: 1.6, flexShrink: 0, height: 28,
        }}>
          WASD to move &middot; space for sonar &middot; ? for help &middot; esc for menu
        </div>
      )}
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
