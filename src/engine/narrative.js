const LINES = [
  "You've been here before.",
  "The walls remember.",
  "Something is watching.",
  "The darkness breathes.",
  "You can feel it getting closer.",
  "There is no way out. Only deeper.",
  "The maze shifts when you're not looking.",
  "How long have you been running?",
  "The light is fading.",
  "They know your scent now.",
  "Level %d. No one has reached level %d.",
  "The exit is a lie. But you run anyway.",
  "Your footsteps echo wrong.",
  "Something moved behind the wall.",
  "The pings are louder now.",
  "You forgot what silence sounds like.",
  "The safe rooms are getting harder to find.",
  "Even the maze is afraid.",
  "Keep moving. Don't look back.",
  "The darkness has a name. You just can't remember it.",
];

/**
 * Get a narrative line for the given level.
 * Deterministic per level so replays show the same line.
 */
export function getNarrativeLine(level) {
  const index = (level - 1) % LINES.length;
  let line = LINES[index];
  if (line.includes("%d")) {
    line = line.replace(/%d/g, String(level));
  }
  return line;
}
