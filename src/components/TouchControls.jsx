const BTN_STYLE = {
  background: "rgba(255,255,255,0.10)",
  border: "1px solid rgba(255,255,255,0.25)",
  color: "#b0b8d0",
  width: 56,
  height: 56,
  fontSize: 20,
  borderRadius: 10,
  cursor: "pointer",
  fontFamily: "monospace",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  userSelect: "none",
  WebkitTapHighlightColor: "transparent",
  touchAction: "manipulation",
};

const SONAR_STYLE = {
  background: "rgba(80,120,200,0.14)",
  border: "1px solid rgba(100,150,255,0.35)",
  color: "#90b0e0",
  width: 68,
  height: 68,
  fontSize: 10,
  letterSpacing: 1,
  borderRadius: "50%",
  cursor: "pointer",
  fontFamily: "monospace",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  userSelect: "none",
  WebkitTapHighlightColor: "transparent",
  touchAction: "manipulation",
  textTransform: "uppercase",
};

/**
 * On-screen D-pad + sonar button for mobile/touch input.
 */
export default function TouchControls({ onMove, onSonarStart, onSonarRelease }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: 28, padding: "4px 0 8px", flexShrink: 0,
    }}>
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: 4,
      }}>
        <button
          style={BTN_STYLE}
          onPointerDown={(e) => { e.preventDefault(); onMove(0, -1); }}
        >
          &#9650;
        </button>
        <div style={{ display: "flex", gap: 4 }}>
          <button
            style={BTN_STYLE}
            onPointerDown={(e) => { e.preventDefault(); onMove(-1, 0); }}
          >
            &#9664;
          </button>
          <button
            style={BTN_STYLE}
            onPointerDown={(e) => { e.preventDefault(); onMove(0, 1); }}
          >
            &#9660;
          </button>
          <button
            style={BTN_STYLE}
            onPointerDown={(e) => { e.preventDefault(); onMove(1, 0); }}
          >
            &#9654;
          </button>
        </div>
      </div>

      <button
        style={SONAR_STYLE}
        onPointerDown={(e) => { e.preventDefault(); onSonarStart(); }}
        onPointerUp={(e) => { e.preventDefault(); onSonarRelease(); }}
        onPointerLeave={(e) => { e.preventDefault(); onSonarRelease(); }}
      >
        SONAR
      </button>
    </div>
  );
}
