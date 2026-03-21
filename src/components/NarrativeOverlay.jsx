import { useState, useEffect } from "react";

/**
 * Shows a single cryptic narrative line between levels.
 * Fades in, holds, then calls onDone.
 */
export default function NarrativeOverlay({ line, onDone }) {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const fadeIn = setTimeout(() => setOpacity(1), 100);
    const fadeOut = setTimeout(() => setOpacity(0), 2800);
    const done = setTimeout(onDone, 3500);
    return () => {
      clearTimeout(fadeIn);
      clearTimeout(fadeOut);
      clearTimeout(done);
    };
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", inset: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "#06060a", zIndex: 10,
    }}>
      <div style={{
        fontSize: 13, color: "#8888a0",
        fontStyle: "italic", letterSpacing: 1,
        fontFamily: "'SF Mono',Monaco,Consolas,monospace",
        textAlign: "center", padding: 32,
        opacity, transition: "opacity 0.8s ease",
        maxWidth: 400, lineHeight: 1.8,
      }}>
        {line}
      </div>
    </div>
  );
}
