export default function HelpOverlay({ onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 20,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(6,6,10,0.95)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 380, width: "90%", padding: "28px 24px",
          fontFamily: "'SF Mono',Monaco,Consolas,monospace",
          color: "#99aabb", fontSize: 11, lineHeight: 1.8,
        }}
      >
        <div style={{
          fontSize: 14, fontWeight: 700, letterSpacing: 4,
          color: "#7070a0", textTransform: "uppercase", marginBottom: 20,
        }}>
          How to Play
        </div>

        <Section title="Goal">
          Reach the <C c="#00ff8888">green exit</C> before the <C c="#ff404088">red threats</C> catch you.
          One touch and you're done.
        </Section>

        <Section title="Controls — Desktop">
          <Row k="WASD / Arrows" v="Move" />
          <Row k="Space (tap)" v="Sonar sweep" />
          <Row k="Space (hold)" v="Shout reveal — see more, attract enemies" />
          <Row k="R" v="Retry / next level" />
          <Row k="Esc" v="Back to menu" />
          <Row k="?" v="This help screen" />
        </Section>

        <Section title="Controls — Mobile">
          <Row k="Swipe on maze" v="Move in that direction" />
          <Row k="Tap on maze" v="Sonar sweep" />
        </Section>

        <Section title="Mechanics">
          <Li>A <C c="#ff303088">red sonar line</C> sweeps across, briefly revealing enemy positions (approximately).</Li>
          <Li>Your <C c="#5588ff88">light</C> drains as you move. Stand still to regenerate. Find <C c="#ffdd8888">safe rooms</C> to recharge.</Li>
          <Li>The maze closes behind you — no backtracking forever.</Li>
          <Li>Each level adds more enemies and gets harder.</Li>
        </Section>

        <Section title="Enemy Types">
          <Li><C c="#ff191988">Basic</C> — hunts you directly</Li>
          <Li><C c="#ff8c1988">Patrol</C> — fixed route until you're near</Li>
          <Li><C c="#c819ff88">Stalker</C> — follows your trail</Li>
          <Li><C c="#ff191988">Lurker</C> — invisible to sonar, appears at close range</Li>
        </Section>

        <button
          onClick={onClose}
          style={{
            display: "block", margin: "24px auto 0", background: "none",
            border: "1px solid #2a2a50", color: "#7778a0",
            padding: "8px 32px", borderRadius: 4, cursor: "pointer",
            fontFamily: "inherit", fontSize: 11, letterSpacing: 2,
          }}
        >
          GOT IT
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 10, color: "#7070a0", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "2px 0" }}>
      <span style={{ color: "#8890a0" }}>{k}</span>
      <span style={{ color: "#7080a0", textAlign: "right" }}>{v}</span>
    </div>
  );
}

function Li({ children }) {
  return <div style={{ paddingLeft: 8, position: "relative" }}><span style={{ position: "absolute", left: 0, color: "#667" }}>&middot;</span>{children}</div>;
}

function C({ c, children }) {
  return <span style={{ color: c }}>{children}</span>;
}
