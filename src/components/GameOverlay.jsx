/**
 * Win/lose overlay shown on top of the canvas.
 */
export default function GameOverlay({ status, level, onAction }) {
  const isWon = status === "won";

  return (
    <div style={{
      position: "absolute", inset: 0,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "rgba(6,6,10,0.90)", borderRadius: 6, gap: 14,
    }}>
      <div style={{
        fontSize: 24, fontWeight: 700, letterSpacing: 3,
        color: isWon ? "#00ff88" : "#ff4040",
      }}>
        {isWon ? "ESCAPED" : "CAUGHT"}
      </div>
      <div style={{ fontSize: 12, color: "#b0b0cc", marginBottom: 4 }}>
        {isWon ? `level ${level} cleared` : "the darkness got you"}
      </div>
      <button
        onClick={onAction}
        style={{
          background: "rgba(255,255,255,0.05)",
          border: `1px solid ${isWon ? "#00ff8888" : "#ff404088"}`,
          color: isWon ? "#00ff88" : "#ff6060",
          padding: "12px 36px", cursor: "pointer", borderRadius: 6,
          fontFamily: "inherit", fontSize: 14, fontWeight: 600, letterSpacing: 2,
        }}
      >
        {isWon ? "NEXT" : "RETRY"}{" "}
        <span style={{ fontSize: 11, opacity: 0.6 }}>[R]</span>
      </button>
    </div>
  );
}
