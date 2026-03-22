/**
 * Game mode configurations. Each mode defines which mechanics are active
 * and their parameters. Custom mode starts as Normal and lets users toggle.
 */

export const MODE_PRESETS = {
  normal: {
    id: "normal",
    name: "Normal",
    description: "Guided. Forgiving. Learn the darkness.",
    autoSonar: true,
    sonarCharges: Infinity,
    showExitHint: true,
    breadcrumbs: true,
    safeRooms: true,
    shiftingWalls: false,
    movingExit: false,
    closingCorridors: true,
    closingDelay: 12000,
    lightEnabled: true,
    lightStart: 1.0,
    lightDrain: 0.003,
    lightRegen: 0.001,
    visRadiusMod: 1.0,
    enemySpeedMod: 1.0,
    checkpoints: true,
    checkpointInterval: 5,
    unlocked: true,
  },
  hard: {
    id: "hard",
    name: "Hard",
    description: "Manual sonar. No hints. The maze fights back.",
    autoSonar: false,
    sonarCharges: 3,
    showExitHint: false,
    breadcrumbs: false,
    safeRooms: true,
    shiftingWalls: true,
    movingExit: true,
    movingExitChance: 0.3,
    closingCorridors: true,
    closingDelay: 8000,
    lightEnabled: true,
    lightStart: 0.8,
    lightDrain: 0.004,
    lightRegen: 0.0008,
    visRadiusMod: 0.8,
    enemySpeedMod: 1.15,
    checkpoints: false,
    unlocked: false,
    unlockRequirement: { mode: "normal", level: 10 },
  },
  helpless: {
    id: "helpless",
    name: "Helpless",
    description: "No sonar. No hints. Minimum light. Pure dread.",
    autoSonar: false,
    sonarCharges: 0,
    showExitHint: false,
    breadcrumbs: false,
    safeRooms: false,
    shiftingWalls: true,
    movingExit: true,
    movingExitChance: 0.5,
    closingCorridors: true,
    closingDelay: 5000,
    lightEnabled: true,
    lightStart: 0.6,
    lightDrain: 0.005,
    lightRegen: 0.0005,
    visRadiusMod: 0.6,
    enemySpeedMod: 1.3,
    checkpoints: false,
    unlocked: false,
    unlockRequirement: { mode: "hard", level: 10 },
  },
};

/**
 * Check if a mode is unlocked based on player records.
 */
export function isModeUnlocked(modeId, playerRecords) {
  const preset = MODE_PRESETS[modeId];
  if (!preset) return false;
  if (preset.unlocked) return true;

  const req = preset.unlockRequirement;
  if (!req) return true;

  const best = playerRecords[req.mode] || 0;
  return best >= req.level;
}

/**
 * Load player records from localStorage.
 */
export function loadPlayerRecords() {
  try {
    const raw = localStorage.getItem("gloom_records");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Save a level completion record.
 */
export function savePlayerRecord(modeId, level) {
  const records = loadPlayerRecords();
  const current = records[modeId] || 0;
  if (level > current) {
    records[modeId] = level;
    try {
      localStorage.setItem("gloom_records", JSON.stringify(records));
    } catch {
      // localStorage unavailable
    }
  }
  return records;
}
