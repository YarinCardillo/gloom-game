export default function HelpOverlay({ onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 20,
        overflowY: "auto", WebkitOverflowScrolling: "touch",
        background: "rgba(6,6,10,0.97)",
      }}
    >
      <div style={{
        minHeight: "100%",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px 0",
      }}>
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: 380, width: "90%", padding: "28px 24px",
            fontFamily: "'SF Mono',Monaco,Consolas,monospace",
            color: "#c8d0e0", fontSize: 12, lineHeight: 1.8,
            position: "relative",
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 0, right: 0,
              background: "none", border: "1px solid #555580",
              color: "#aab0cc", width: 36, height: 36,
              fontSize: 18, borderRadius: 6, cursor: "pointer",
              fontFamily: "inherit",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            &times;
          </button>

          <div style={{
            fontSize: 16, fontWeight: 700, letterSpacing: 4,
            color: "#a0a0d0", textTransform: "uppercase", marginBottom: 20,
          }}>
            How to Play
          </div>

          <Section title="Goal">
            Reach the <C c="#00ff88">green exit</C> before the <C c="#ff5050">red threats</C> catch you.
            One touch and you're done.
          </Section>

          <Section title="Controls &mdash; Desktop">
            <Row k="WASD / Arrows" v="Move" />
            <Row k="Space (tap)" v="Sonar sweep" />
            <Row k="Space (hold)" v="Shout &mdash; see more, attract enemies" />
            <Row k="R" v="Retry / next level" />
            <Row k="Esc" v="Back to menu" />
            <Row k="?" v="This help screen" />
          </Section>

          <Section title="Controls &mdash; Mobile">
            <Row k="Swipe" v="Move" />
            <Row k="Tap (quick)" v="Sonar sweep" />
            <Row k="Hold" v="Shout &mdash; see more, attract enemies" />
          </Section>

          <Section title="Mechanics">
            <Li>A <C c="#ff4040">red sonar line</C> sweeps across, briefly revealing enemy positions (approximately).</Li>
            <Li>Your <C c="#6699ff">light</C> drains as you move. Stand still to regenerate. Find <C c="#ffdd88">safe rooms</C> to recharge.</Li>
            <Li>The maze closes behind you &mdash; no backtracking forever.</Li>
            <Li>Each level adds more enemies and gets harder.</Li>
          </Section>

          <Section title="Enemy Types">
            <Li><C c="#ff3030">Basic</C> &mdash; hunts you directly</Li>
            <Li><C c="#ff9030">Patrol</C> &mdash; fixed route until you're near</Li>
            <Li><C c="#cc40ff">Stalker</C> &mdash; follows your trail</Li>
            <Li><C c="#ff3030">Lurker</C> &mdash; invisible to sonar, appears at close range</Li>
          </Section>

          <button
            onClick={onClose}
            style={{
              display: "block", margin: "24px auto 0", background: "rgba(255,255,255,0.06)",
              border: "1px solid #555588", color: "#c0c0e0",
              padding: "14px 48px", borderRadius: 6, cursor: "pointer",
              fontFamily: "inherit", fontSize: 14, fontWeight: 600, letterSpacing: 2,
            }}
          >
            GOT IT
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, color: "#9090c0", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6, fontWeight: 600 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "2px 0" }}>
      <span style={{ color: "#b0b8d0" }}>{k}</span>
      <span style={{ color: "#9098b0", textAlign: "right" }}>{v}</span>
    </div>
  );
}

function Li({ children }) {
  return <div style={{ paddingLeft: 12, position: "relative" }}><span style={{ position: "absolute", left: 0, color: "#8888aa" }}>&middot;</span>{children}</div>;
}

function C({ c, children }) {
  return <span style={{ color: c }}>{children}</span>;
}
