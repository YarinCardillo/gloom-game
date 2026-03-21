import { useState } from "react";
import { MODE_PRESETS, isModeUnlocked, loadPlayerRecords } from "../engine/modes.js";
import HelpOverlay from "./HelpOverlay.jsx";

const MODES = ["normal", "hard", "helpless"];

export default function ModeSelect({ onSelect }) {
  const records = loadPlayerRecords();
  const [showHelp, setShowHelp] = useState(false);

  if (showHelp) {
    return <HelpOverlay onClose={() => setShowHelp(false)} />;
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100dvh", background: "#06060a",
      color: "#ccc", fontFamily: "'SF Mono',Monaco,Consolas,monospace",
      padding: 24, boxSizing: "border-box", gap: 20,
    }}>
      <div style={{
        fontSize: 28, fontWeight: 700, letterSpacing: 8,
        color: "#a0a0d0", textTransform: "uppercase", marginBottom: 8,
      }}>
        Gloom
      </div>
      <div style={{
        fontSize: 12, color: "#8888b8", letterSpacing: 2, marginBottom: 16,
      }}>
        sonar survival roguelike
      </div>

      <div style={{
        display: "flex", flexDirection: "column", gap: 10,
        width: "100%", maxWidth: 320,
      }}>
        {MODES.map((modeId) => {
          const mode = MODE_PRESETS[modeId];
          const unlocked = isModeUnlocked(modeId, records);
          const best = records[modeId];

          return (
            <button
              key={modeId}
              onClick={() => unlocked && onSelect(mode)}
              disabled={!unlocked}
              style={{
                background: unlocked ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${unlocked ? "#444470" : "#252540"}`,
                borderRadius: 8,
                padding: "14px 18px",
                cursor: unlocked ? "pointer" : "default",
                textAlign: "left",
                fontFamily: "inherit",
                opacity: unlocked ? 1 : 0.4,
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => {
                if (unlocked) e.currentTarget.style.borderColor = "#6060a0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = unlocked ? "#444470" : "#252540";
              }}
            >
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{
                  fontSize: 15, fontWeight: 600, letterSpacing: 3,
                  color: unlocked ? getModeColor(modeId) : "#666680",
                  textTransform: "uppercase",
                }}>
                  {mode.name}
                </span>
                {best > 0 && (
                  <span style={{ fontSize: 11, color: "#99aac0" }}>
                    best: lvl {best}
                  </span>
                )}
                {!unlocked && (
                  <span style={{ fontSize: 10, color: "#666680" }}>
                    locked
                  </span>
                )}
              </div>
              <div style={{
                fontSize: 11, color: unlocked ? "#99aac0" : "#555570",
                marginTop: 6, lineHeight: 1.5,
              }}>
                {unlocked ? mode.description : getUnlockHint(mode)}
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => setShowHelp(true)}
        style={{
          background: "rgba(255,255,255,0.04)", border: "1px solid #444470", borderRadius: 6,
          color: "#aab0d0", padding: "10px 28px", cursor: "pointer",
          fontFamily: "inherit", fontSize: 12, letterSpacing: 2,
          marginTop: 4,
        }}
      >
        HOW TO PLAY
      </button>

      <div style={{
        fontSize: 10, color: "#7070a0", marginTop: 4, textAlign: "center",
        lineHeight: 1.7, letterSpacing: 1,
      }}>
        press ? anytime for help
      </div>
    </div>
  );
}

function getModeColor(modeId) {
  switch (modeId) {
    case "normal": return "#b0b8d8";
    case "hard": return "#dd9966";
    case "helpless": return "#dd7777";
    default: return "#b0b8d8";
  }
}

function getUnlockHint(mode) {
  if (!mode.unlockRequirement) return "";
  const { mode: reqMode, level } = mode.unlockRequirement;
  return `reach level ${level} in ${reqMode} to unlock`;
}
