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
      background: "rgba(6,6,10,0.88)", borderRadius: 6, gap: 14,
    }}>
      <div style={{
        fontSize: 22, fontWeight: 700, letterSpacing: 3,
        color: isWon ? "#00ff88" : "#ff4040",
      }}>
        {isWon ? "ESCAPED" : "CAUGHT"}
      </div>
      <div style={{ fontSize: 11, color: "#445", marginBottom: 4 }}>
        {isWon ? `level ${level} cleared` : "the darkness got you"}
      </div>
      <button
        onClick={onAction}
        style={{
          background: "none",
          border: `1px solid ${isWon ? "#00ff8844" : "#ff404044"}`,
          color: isWon ? "#00ff88" : "#ff6060",
          padding: "8px 28px", cursor: "pointer", borderRadius: 4,
          fontFamily: "inherit", fontSize: 12, letterSpacing: 2,
        }}
      >
        {isWon ? "NEXT" : "RETRY"}{" "}
        <span style={{ fontSize: 10, opacity: 0.5 }}>[R]</span>
      </button>
    </div>
  );
}
