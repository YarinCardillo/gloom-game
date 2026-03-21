import { MODE_PRESETS, isModeUnlocked, loadPlayerRecords } from "../engine/modes.js";

const MODES = ["normal", "hard", "helpless"];

export default function ModeSelect({ onSelect }) {
  const records = loadPlayerRecords();

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100dvh", background: "#06060a",
      color: "#999", fontFamily: "'SF Mono',Monaco,Consolas,monospace",
      padding: 24, boxSizing: "border-box", gap: 20,
    }}>
      <div style={{
        fontSize: 28, fontWeight: 700, letterSpacing: 8,
        color: "#3a3a50", textTransform: "uppercase", marginBottom: 8,
      }}>
        Gloom
      </div>
      <div style={{
        fontSize: 11, color: "#2a2a3e", letterSpacing: 2, marginBottom: 16,
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
                background: unlocked ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.01)",
                border: `1px solid ${unlocked ? "#1a1a30" : "#0f0f1a"}`,
                borderRadius: 8,
                padding: "14px 18px",
                cursor: unlocked ? "pointer" : "default",
                textAlign: "left",
                fontFamily: "inherit",
                opacity: unlocked ? 1 : 0.4,
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => {
                if (unlocked) e.currentTarget.style.borderColor = "#2a2a50";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = unlocked ? "#1a1a30" : "#0f0f1a";
              }}
            >
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{
                  fontSize: 14, fontWeight: 600, letterSpacing: 3,
                  color: unlocked ? getModeColor(modeId) : "#333",
                  textTransform: "uppercase",
                }}>
                  {mode.name}
                </span>
                {best > 0 && (
                  <span style={{ fontSize: 10, color: "#445" }}>
                    best: lvl {best}
                  </span>
                )}
                {!unlocked && (
                  <span style={{ fontSize: 9, color: "#333" }}>
                    locked
                  </span>
                )}
              </div>
              <div style={{
                fontSize: 10, color: unlocked ? "#445" : "#222",
                marginTop: 6, lineHeight: 1.5,
              }}>
                {unlocked ? mode.description : getUnlockHint(mode)}
              </div>
            </button>
          );
        })}
      </div>

      <div style={{
        fontSize: 9, color: "#1a1a2e", marginTop: 12, textAlign: "center",
        lineHeight: 1.7, letterSpacing: 1,
      }}>
        WASD / arrows to move &middot; space for sonar
        <br />
        reach the exit &middot; avoid the darkness
      </div>
    </div>
  );
}

function getModeColor(modeId) {
  switch (modeId) {
    case "normal": return "#667";
    case "hard": return "#884433";
    case "helpless": return "#883333";
    default: return "#667";
  }
}

function getUnlockHint(mode) {
  if (!mode.unlockRequirement) return "";
  const { mode: reqMode, level } = mode.unlockRequirement;
  return `reach level ${level} in ${reqMode} to unlock`;
}
