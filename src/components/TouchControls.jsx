const BTN_STYLE = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#667",
  width: 48,
  height: 48,
  fontSize: 14,
  borderRadius: 8,
  cursor: "pointer",
  fontFamily: "monospace",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  userSelect: "none",
  WebkitTapHighlightColor: "transparent",
  touchAction: "manipulation",
};

/**
 * On-screen D-pad for mobile/touch input.
 */
export default function TouchControls({ onMove }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", gap: 4,
    }}>
      <button
        style={BTN_STYLE}
        onPointerDown={(e) => { e.preventDefault(); onMove(0, -1); }}
      >
        W
      </button>
      <div style={{ display: "flex", gap: 4 }}>
        <button
          style={BTN_STYLE}
          onPointerDown={(e) => { e.preventDefault(); onMove(-1, 0); }}
        >
          A
        </button>
        <button
          style={BTN_STYLE}
          onPointerDown={(e) => { e.preventDefault(); onMove(0, 1); }}
        >
          S
        </button>
        <button
          style={BTN_STYLE}
          onPointerDown={(e) => { e.preventDefault(); onMove(1, 0); }}
        >
          D
        </button>
      </div>
    </div>
  );
}
