const BTN_STYLE = {
  background: "rgba(255,255,255,0.12)",
  border: "1px solid rgba(255,255,255,0.30)",
  color: "#c0c8e0",
  width: 58,
  height: 58,
  fontSize: 22,
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
  background: "rgba(80,120,200,0.18)",
  border: "1px solid rgba(100,150,255,0.45)",
  color: "#a0c0ff",
  width: 72,
  height: 72,
  fontSize: 11,
  fontWeight: 600,
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
    <div
      data-touch-controls="true"
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 28, padding: "4px 0 8px", flexShrink: 0,
      }}
    >
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
