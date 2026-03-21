---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
inputDocuments:
  - game-brief.md
  - brainstorming-session-2026-03-21.md
documentCounts:
  briefs: 1
  research: 0
  brainstorming: 1
  projectDocs: 0
workflowType: 'gdd'
lastStep: 2
project_name: 'gloom-game'
user_name: 'Yarin'
date: '2026-03-21'
game_type: 'roguelike'
game_name: 'Gloom'
---

# Gloom - Game Design Document

**Author:** Yarin
**Game Type:** Roguelike
**Target Platform(s):** Web Browser (Mobile future)

---

## Executive Summary

### Game Name

Gloom

### Core Concept

Gloom is a sonar survival roguelike where players navigate procedurally generated labyrinths in near-total darkness. Visibility is limited to a few tiles — everything beyond is void. The only warning of approaching threats comes from a sweeping sonar line: a side-to-side red scan that briefly reveals approximate, single-point enemy positions before fading. You never know exactly where they are. You only know they're getting closer.

Enemies use pathfinding to actively hunt the player through a maze designed with multiple escape routes — guaranteeing that evasion is always possible, but never obvious. Distinct enemy types — stalkers that follow your trail, patrols on fixed routes, lurkers invisible to sonar until you're nearly on top of them, and swarms that spread to cut off exits — create varied threat signatures demanding different strategies. Players build a mental map aided by faint breadcrumb traces on visited tiles, reading imperfect sonar data to make split-second routing decisions. Rare safe rooms — brightly lit zones where enemies cannot enter — offer moments of relief in the darkness.

The maze itself is an antagonist: corridors seal behind you after a delay, preventing backtracking and forcing forward momentum. Visibility functions as a depletable resource — moving costs light, standing still regenerates it slightly, safe rooms fully recharge it. Between levels, single cryptic sentences build an ambient meta-narrative: *what is this maze?*

Four game modes define the experience: **Normal** (guided, forgiving), **Hard** (reduced visibility, faster enemies, manual sonar trigger, shifting walls, moving exit, no exit hint, no breadcrumbs), **Helpless** (no sonar, no hints, minimum visibility, no safe rooms, faster enemies, mid-run map changes), and **Custom** (mix any settings). Competitive seed sharing with an online leaderboard for completion times adds replayability. Larger, denser mazes scale with these mechanics to ensure space for evasion, exploration, and dread.

Gloom is browser-native — no install, no engine dependency, instant play. A lightweight, canvas-rendered experience built for the tension of navigating the unknown while hunted.

### Game Type

**Type:** Roguelike
**Framework:** This GDD uses the roguelike template with type-specific sections for procedural generation, permadeath, and run-based progression. Strong atmospheric horror elements (fog of war, sonar-only threat awareness, danger vignette) are woven throughout.

## Target Platform(s)

### Primary Platform

**Web Browser** — instant access, zero install, broad reach across desktop and mobile browsers. Canvas-based rendering ensures lightweight performance on any modern browser.

### Platform Considerations

- **Performance target:** 60fps on mid-range devices, graceful degradation on low-end
- **Browser compatibility:** Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- **Responsive design:** Scales from desktop monitors to mobile screens
- **No plugins or dependencies:** Pure canvas rendering, no WebGL requirement
- **Offline capability:** Consider PWA for offline play (future)

### Future Platforms

- **Mobile (iOS/Android):** Next target after web reaches stable state. Touch controls already prototyped. Potential for native wrapper (Capacitor/PWA) or native rewrite. One-time purchase model.
- **Steam:** Not excluded. A more polished version with potential additional features could be published on Steam in the future.
- Console: Not planned.

### Control Scheme

- **Desktop:** WASD / Arrow keys for movement. Space key for manual sonar (Hard mode). R for retry/next.
- **Mobile/Touch:** On-screen directional buttons (already prototyped). Tap for manual sonar trigger.

---

## Target Audience

### Demographics

**Age Range:** All ages (10+). Atmospheric tension through information scarcity, not violence or graphic horror. Spooky but approachable — more liminal space anxiety than jump scares.

### Gaming Experience

**Broad spectrum by design.** Normal mode welcomes casual players seeking a light puzzle-adventure with gentle tension. Hard and Helpless modes cater to core/hardcore players chasing mastery and leaderboard competition.

### Genre Familiarity

No roguelike knowledge required. The core mechanic (navigate maze, avoid threats) is universally intuitive. Genre depth (permadeath, meta-progression, seed competition) reveals itself naturally to players who go deeper.

### Session Length

**5-15 minutes per run** — ideal for browser-based play. Quick enough for a break, compelling enough for "one more run" chains. Leaderboard competition may drive longer sessions (30+ min) for hardcore players.

### Player Motivations

| Segment | Mode | Motivation |
|-|-|-|
| Casual | Normal | Atmospheric exploration, satisfying escape moments, accessible tension |
| Core | Hard | Mastery, leaderboard climbing, seed competition, strategic sonar management |
| Hardcore | Helpless/Custom | Pure survival challenge, bragging rights, community-shared impossible runs |

### Unique Selling Points (USPs)

1. **Information Economy as THE Mechanic** — Most maze/horror games limit what you *see*. Gloom limits what you *know*. Every decision is based on approximated, unreliable sonar data. The uncertainty isn't a feature — it's the entire game identity.

2. **Mode-Driven Emotional Range** — Same mechanics, radically different experiences. Normal mode is a cute, approachable puzzle-adventure. Helpless mode is genuine survival horror. Few games span that emotional range without changing their core systems.

3. **Zero-Friction Access** — Browser-native, instant play, no install. In a genre dominated by Steam/PC, this is unusually accessible. Anyone with a browser is one click from playing.

4. **The Crossover Aesthetic** — Maze + horror + roguelike, wrapped in an indie-internet aesthetic that's spooky but cute. Each genre exists separately; the intersection with this tone is underexplored.

### Competitive Positioning

Gloom occupies a unique space: lighter than dedicated horror games (no gore, no jump scares), deeper than casual maze games (enemy AI, sonar mechanics, mode complexity), and more accessible than traditional roguelikes (browser-native, intuitive controls). The closest comparisons are games like *Darkwood* (top-down limited visibility) and *Pac-Man* (maze evasion), but Gloom's sonar-only information system and mode-driven difficulty spectrum set it apart.

---

## Design Decisions Log

### Implement Now

| Decision | GDD Section |
|-|-|
| Sonar sweep mechanic (side-to-side line scan) | Mechanics |
| Hard mode: manual sonar trigger (space key), limited uses | Modes/Mechanics |
| Breadcrumb system on visited tiles (disabled in hard mode) | Mechanics |
| Enemy types: Stalker, Patrol, Lurker, Swarm | Mechanics |
| Safe rooms: enemies can't enter, can't camp outside, not sonar-visible | Level Design |
| Maze closes behind player (anti-camping, mode-configurable) | Level Design |
| Visibility as depletable resource (light meter) | Mechanics |
| Moving exit (30% chance on Hard) | Level Design |
| Shifting walls mid-run (hard mode only) | Level Design |
| One-line narrative between levels (meta-mystery) | Content/Narrative |
| Game modes: Normal, Hard, Helpless, Custom | Progression |
| Online leaderboard with seed sharing | Technical/Social |
| Larger maze sizes to accommodate new mechanics | Technical |
| Active "shout" to reveal more but attract/speed enemies | Mechanics (mode TBD) |

### Postponed

| Decision | Reason |
|-|-|
| Audio/sound design (directional cues, environmental) | Post-MVP |
| Co-op shared blindness multiplayer | Post-MVP |
| Asymmetric multiplayer (1 hunter vs 4 escapees) | Post-MVP |
| Key-before-escape mode | Separate mode, later |

---

## Goals and Context

### Project Goals

1. **Indie Gem Status** — Build Gloom into a recognized indie game featured on showcases, picked up by streamers, and backed by a dedicated community. Growth over vanity metrics — more players, more engagement, organic word-of-mouth.

2. **Cross-Platform Reach** — Ship a polished web experience first, then expand to mobile (iOS/Android) as a premium one-time-purchase version. Web stays free forever. Steam not excluded for a polished future release.

3. **Competitive Community** — Establish a leaderboard-driven competitive scene through seed sharing, completion times, and mode-specific rankings. Give hardcore players a reason to keep coming back.

4. **Have Fun Building It** — This started from wanting to have fun with something as simple as possible. Keep that spirit alive — the game should be as fun to make as it is to play.

### Background and Rationale

Gloom was born from a simple vision: a blind maze where you can only see a few tiles around you, with sonar pings hinting at approaching threats. The goal was simplicity — something fun, immediate, and atmospheric without the overhead of complex engines or frameworks.

The timing is right: browser-based indie games are having a moment. Instant-play, zero-install experiences lower the barrier to entry dramatically. Roguelikes continue to dominate indie charts, and the horror-adjacent aesthetic has broad appeal across casual and hardcore audiences. Gloom sits at an underexplored crossover of maze, horror, and roguelike — familiar enough to be immediately understood, novel enough to feel fresh.

---

## Core Gameplay

### Game Pillars

1. **Uncertainty** — Every decision is a gamble on incomplete data. The sonar gives approximations, not truth. The darkness hides threats and paths alike. The player never has full information — and that's the point.

2. **Tension/Release** — The oscillation between being hunted and finding safety. Corridors closing behind you, then a safe room. Sonar blips converging, then slipping past to the exit. The game breathes.

3. **Accessibility** — Anyone can pick it up in seconds. Depth reveals itself through modes, not complexity. Zero install, intuitive controls, no genre knowledge required. Normal mode is cute; Helpless mode is brutal. Same game.

**Pillar Prioritization:** When pillars conflict, prioritize in this order:
Uncertainty > Tension/Release > Accessibility. The information economy is sacred — never give the player full knowledge, even at the cost of approachability. Tension/Release shapes the emotional arc. Accessibility ensures the widest door in, but never at the cost of the core experience.

### Core Gameplay Loop

**Micro Loop (moment-to-moment, ~5-15 seconds):**
Move through darkness → Read sonar sweep → Assess threat positions → Choose direction → Encounter (evade, find safe room, or get caught)

**Macro Loop (per level, ~1-3 minutes):**
Spawn in maze → Explore with limited visibility → Build mental map → Navigate toward exit beacon → Manage light resource → Evade enemies using sonar data → Reach exit or get caught

**Meta Loop (across levels):**
Complete level → Read cryptic narrative line → Enter harder maze (more enemies, faster pursuit) → Push deeper → Die → Retry from level 1 (or next level on win) → Chase leaderboard time

**Loop Diagram:**
```
[Spawn] → [Explore/Map] → [Sonar Sweep] → [Assess Threats]
                ↑                                    ↓
          [Next Level]                    [Choose Path]
                ↑                                    ↓
          [Reach Exit] ← [Evade/Route] ← [Move/Spend Light]
                                                     ↓
                                              [Safe Room?] → [Recharge/Relief]
                                                     ↓
                                              [Caught?] → [Game Over → Retry]
```

**Loop Timing:** Micro loop cycles every 5-15 seconds. One level takes 1-3 minutes. A full session (multiple levels until death) runs 5-15 minutes.

**Loop Variation:** Each iteration feels different because:
- Procedurally generated maze layout
- Randomized enemy types and placement
- Sonar noise means threat assessment varies each sweep
- Light resource creates different pacing per run
- Corridors closing behind force new routes even in familiar-feeling spaces

### Win/Loss Conditions

#### Victory Conditions

- **Per Level:** Reach the green exit beacon alive
- **Per Session:** Survive as many levels as possible, chasing personal bests and leaderboard times
- **No "final" victory state** — endless escalation. The question isn't "can you win?" but "how far can you go?"

#### Failure Conditions

- **Caught:** Any enemy occupies the same tile as the player. Instant death.
- **No health, no lives, no second chances.** One touch = game over. This reinforces the Uncertainty pillar — every encounter is all-or-nothing.

#### Failure Recovery

- **Normal mode:** Retry from level 1 (or consider checkpoints at milestone levels — every 5?)
- **Hard/Helpless mode:** Always restart from level 1. No mercy.
- **Custom mode:** Configurable restart behavior
- **Failure teaches:** Each death reveals more about enemy behavior, sonar reading, and maze navigation. The player's mental model improves even when the run doesn't.
- **Quick restart:** Press R immediately. Zero friction between death and "one more run."

---

## Game Mechanics

### Primary Mechanics

**1. Navigate**
- **Verb:** Move through darkness tile by tile
- **Pillar:** Uncertainty, Tension
- **Frequency:** Constant — this is 90% of gameplay
- **Skill tested:** Spatial awareness, route planning under pressure
- **Feel:** Responsive, snappy. One input = one tile. No acceleration, no slide.
- **Progression:** Movement itself doesn't change, but the environment does (closing corridors, shifting walls, reduced visibility)

**2. Read Sonar**
- **Verb:** Interpret the sweeping sonar line for approximate threat positions
- **Pillar:** Uncertainty
- **Frequency:** Automatic in Normal mode (periodic sweep), manual in Hard mode
- **Skill tested:** Pattern recognition, spatial estimation under noise
- **Feel:** Like a heartbeat — rhythmic, reliable in timing, unreliable in data. Brief flash of enemy dots with positional noise, then gone.
- **Progression:** Hard mode limits sweeps and adds manual trigger. Helpless mode removes sonar entirely.

**3. Trigger Sonar / Shout Reveal (Tap/Hold)**
- **Verb:** Tap space for a standard sonar sweep. Hold space (~0.5s+) to charge a louder reveal — wider visibility burst that attracts and temporarily speeds up enemies.
- **Pillar:** Uncertainty, Tension/Release
- **Frequency:** Situational — limited uses in Hard mode, unlimited but costly in Normal
- **Skill tested:** Risk/reward assessment, timing
- **Feel:** Tap = quick pulse, immediate feedback. Hold = charge animation builds (glow intensifies around player), release = burst of visibility followed by enemy aggro spike. Charge threshold ~0.5s before transition from tap to hold behavior.
- **Interaction:** Shout reveal costs extra light resource. Enemies within range temporarily speed up for ~3 seconds.

**4. Manage Light**
- **Verb:** Spend and conserve visibility resource through movement choices
- **Pillar:** Uncertainty
- **Frequency:** Passive — always present as a constraint
- **Skill tested:** Pacing, resource management
- **Feel:** Gradual — visibility radius shrinks slowly as light depletes. Not a hard cutoff. Standing still regenerates slowly. Safe rooms fully recharge.
- **Progression:** Light depletes faster in later levels. Hard mode starts with less light.

**5. Evade**
- **Verb:** Route around enemies using incomplete sonar data and mental map
- **Pillar:** Tension/Release
- **Frequency:** Whenever threats are near — the core tension moments
- **Skill tested:** Snap decision-making, spatial memory, threat assessment
- **Feel:** Heart-pounding. The vignette intensifies. Every direction is a gamble.
- **Interaction:** Informed by sonar data quality, breadcrumb trails, and remaining light.

**6. Seek Shelter**
- **Verb:** Find and enter safe rooms to recharge light and breathe
- **Pillar:** Tension/Release
- **Frequency:** Rare — safe rooms are scarce. Finding one is a relief event.
- **Skill tested:** Exploration, risk assessment (detour to safety vs. push toward exit)
- **Feel:** Bright, warm, contrasting. Dramatic visual shift from darkness to light.
- **Rules:** Enemies cannot enter. Enemies cannot camp outside (disperse after ~3s). Not visible on sonar — must be discovered through exploration.

**7. Mental Mapping**
- **Verb:** Build spatial memory aided by faint breadcrumb traces on visited tiles
- **Pillar:** Uncertainty, Accessibility
- **Frequency:** Passive — always building
- **Skill tested:** Spatial memory, pattern recognition
- **Feel:** Subtle — slight color shift on visited tiles, not a trail of dots.
- **Progression:** Disabled in Hard mode. Breadcrumbs work against you when Stalker enemies follow your trail.

### Mechanic Interactions

| Mechanic A | + Mechanic B | Interaction |
|-|-|-|
| Sonar | + Mental Map | Sonar shows where enemies are; mental map shows where you've been. Together they inform route planning. |
| Light | + Sonar Trigger | Manual sonar costs no light, but Shout Reveal costs extra light. Risk/reward tradeoff. |
| Evade | + Shelter | Evasion toward a safe room is the optimal play — but safe rooms aren't on sonar, so you need exploration first. |
| Light | + Navigate | Moving costs light. Aggressive exploration depletes faster. Conservative play preserves resources but risks getting trapped by closing corridors. |
| Breadcrumbs | + Stalker Enemy | In Normal mode breadcrumbs help you. With Stalkers, your trail becomes a liability. |
| Shout Reveal | + Evade | Reveal shows everything briefly but enemies speed up. You trade information for danger. |

### Mechanic Progression

Mechanics don't unlock — they're all available from level 1. Progression comes from the environment changing around them:
- More enemies per level
- Faster enemy movement
- Faster light depletion
- More aggressive maze closure
- Mode selection changes which mechanics are available (manual sonar, no breadcrumbs, no safe rooms)

---

### Controls and Input

#### Control Scheme (Web Browser)

**Desktop:**

| Input | Action |
|-|-|
| WASD / Arrow Keys | Move (4-directional, tile-based) |
| Space (tap) | Trigger sonar sweep |
| Space (hold ~0.5s+) | Charge and release Shout Reveal |
| R | Retry / Next level |
| Esc | Pause / Menu |

**Mobile/Touch:**

| Input | Action |
|-|-|
| D-pad buttons | Move (4-directional) |
| Sonar button (tap) | Trigger sonar sweep |
| Sonar button (hold) | Charge and release Shout Reveal |
| Retry button | Retry / Next level |

#### Input Feel

- **Movement:** Instant response, no momentum. Tile-snapping. Repeat rate ~115ms for held keys — fast enough to feel fluid, slow enough for precision.
- **Sonar tap:** Immediate visual feedback — sweep begins on key-down.
- **Shout charge:** Visual charge indicator (player glow intensifies). Clear threshold at ~0.5s. Releasing before = normal sonar. Releasing after = shout reveal.
- **Zero input lag:** requestAnimationFrame rendering, no input buffering.

#### Accessibility Controls

- **Rebindable keys:** Future consideration for desktop
- **Touch target sizing:** D-pad buttons 44px+ tap targets
- **Mode system IS the accessibility system:** Normal mode is the accessible version. No separate "easy mode" stigma.
- **Color considerations:** Sonar (red), exit (green), player (white/blue), safe rooms (bright). Consider alternative ping shapes/patterns for colorblind players.

---

## Roguelike Specific Design

### Run Structure

Gloom uses an **endless escalation** model. There is no final level — runs continue until the player dies. The question is never "can you beat it?" but "how deep can you go?"

**Level Duration:** Each level targets 1-3 minutes of play, keeping runs fast and restarts painless.

**Milestone Levels:** Every 5th level is a milestone — a larger maze with a guaranteed safe room and the introduction of a new enemy type. Milestones serve as both reward (the safe room) and escalation (the new threat).

**Starting Conditions by Mode:**

| Mode | Start Level | Sonar | Light | Breadcrumbs |
|-|-|-|-|-|
| Normal | Level 1 (or last checkpoint) | Auto-sweep | Full | Enabled |
| Hard | Level 1 (always) | Manual, limited uses | Reduced | Disabled |
| Helpless | Level 1 (always) | None | Minimum | Disabled |
| Custom | Level 1 (configurable) | Configurable | Configurable | Configurable |

### Procedural Generation

Mazes are generated using **depth-first search (DFS)** with post-generation wall removal to create multiple viable paths. Pure DFS produces single-solution mazes; removing additional walls ensures the player always has escape routes when enemies approach.

**Generation Rules:**
- Base maze uses DFS with backtracking for guaranteed connectivity
- 10-15% of remaining walls are removed post-generation to create loops and alternate routes
- Exit placement ensures minimum path length from spawn (never trivially close)
- Enemy spawn points maintain minimum distance from both player spawn and exit
- Safe rooms are placed 1 per 3-5 levels in Normal mode, always on a side corridor (never on the critical path to the exit)

**Seed System:** Every maze is generated from a numeric seed. Seeds produce deterministic layouts — same seed, same maze, same enemy placement. This enables leaderboard competition on identical runs and lets players share specific challenges.

### Permadeath and Recovery

Death is instant and permanent within a run. One-touch contact with any enemy ends the run immediately.

**Recovery by Mode:**
- **Normal:** Checkpoints every 5 levels (at milestone boundaries). Death sends the player back to the last checkpoint, not level 1. This softens the roguelike loop for casual players.
- **Hard:** Always restart from level 1. No checkpoints. Full commitment.
- **Helpless:** Always restart from level 1. No mercy mechanics of any kind.
- **Custom:** Checkpoint frequency is configurable (off, every 5, every 3, every level).

**Meta-Progression:** There are no persistent unlocks or upgrades between runs. Progression is expressed through the player's skill growth, leaderboard times, and highest level reached. The leaderboard is the meta-game.

### Item and Upgrade System

**MVP: None.** Gloom is a pure skill-based game. There are no pickups, power-ups, or upgrade trees. The player's only resources are light (regenerated through stillness and safe rooms) and information (gathered through sonar and exploration).

**Future Consideration:** Temporary, single-use pickups could add variety without undermining the skill-first philosophy — for example, a sonar boost (one extra sweep), a light refill, or a brief speed burst. These would be rare drops, not reliable tools. Not planned for MVP.

### Character Selection

**MVP: None.** The player is represented by a single white circle with a blue glow. No character classes, no stat differences, no ability loadouts.

**Future Consideration:** Cosmetic skins could provide visual variety and serve as achievement rewards (reach level 20, complete a run in Hard mode, etc.). Skins would be purely visual with no gameplay impact.

### Difficulty Modifiers

The four game modes **are** the difficulty system. There is no separate difficulty slider — mode selection determines the full set of rules.

**Mode as Difficulty:**
- **Normal** is the accessible entry point with guidance systems (auto sonar, breadcrumbs, exit hint, safe rooms, checkpoints)
- **Hard** strips away guidance and adds environmental threats (manual sonar, no breadcrumbs, no exit hint, shifting walls, moving exit, faster enemies, reduced visibility)
- **Helpless** removes sonar entirely and adds mid-run map mutations (no sonar, no hints, minimum visibility, no safe rooms, fastest enemies, map changes during play)
- **Custom** lets the player mix individual settings from any mode, creating personalized challenge profiles

This approach avoids the "easy/medium/hard" stigma — each mode is a distinct experience, not a lesser version of another.

---

## Progression and Balance

### Player Progression

Gloom has no persistent upgrades, unlock trees, or currency. Player progression is skill-based and expressed through three systems:

**Mode Unlocks:** Modes gate behind demonstrated competence.
- **Normal:** Available from first launch
- **Hard:** Unlocked by completing level 10 in Normal mode
- **Helpless:** Unlocked by completing level 10 in Hard mode
- **Custom:** Unlocked alongside Hard mode

This gating ensures players learn core mechanics before encountering stripped-down modes. Completing level 10 demonstrates sufficient maze navigation and sonar literacy to handle increased challenge.

**Leaderboard Records:** Each mode has a separate leaderboard tracking highest level reached and fastest completion time per seed. Players compete against their own history and the global community.

**Narrative Drip:** Between levels, a single cryptic sentence builds an ambient meta-narrative about the nature of the maze. This provides a non-mechanical reason to push deeper — curiosity about what the next line reveals.

### Difficulty Curve

Difficulty escalates through environmental pressure, not player weakness. The player's capabilities remain constant; the maze gets harder.

**Enemy Scaling:**

| Level | Enemy Count | Types Available |
|-|-|-|
| 1-2 | 3 | Patrol only |
| 3-4 | 4 | Patrol, Stalker |
| 5-6 | 5 | Patrol, Stalker, introduced at 5 |
| 7-9 | 6-7 | All types, Lurker introduced at 7 |
| 10+ | 8-10 (capped) | All types, Swarm introduced at 10 |

**Environmental Scaling:**
- **Enemy speed:** Increases ~5% per level, capping at ~1.5x base speed by level 15
- **Light depletion:** Movement cost increases ~10% per level. By level 10, aggressive exploration drains light noticeably faster.
- **Maze size:** Grows from 31x21 at level 1 to 51x35 by level 10+, with corridor density increasing
- **Corridor closure speed:** Corridors seal faster at higher levels, reducing safe backtracking windows
- **Safe room frequency:** Decreases at higher levels (every 3 levels early, every 5 levels later)

**Hard Mode Additions (on top of base scaling):**
- Shifting walls: random wall segments move every 15-20 seconds starting at level 3
- Moving exit: 30% chance the exit relocates once mid-level, starting at level 5
- Enemy speed starts at 1.2x base and scales from there

**Pacing Philosophy:** Levels 1-4 are the tutorial zone — low enemy count, generous light, simple maze. Levels 5-9 are the core challenge where all enemy types appear. Level 10+ is the endurance zone where capped enemy counts and maximum maze complexity test mastery.

### Economy and Resources

**Light is the only resource.** There is no currency, no shop, no upgrade economy. This is a deliberate design choice — Gloom is a pure skill game where resource management means managing one thing well, not juggling inventories.

**Light Mechanics:**
- **Depletion:** Every tile of movement costs light. The cost increases with level progression.
- **Regeneration:** Standing still regenerates light slowly (~1% per second). This creates a risk/reward tension — stopping to recharge means enemies keep moving.
- **Safe rooms:** Entering a safe room fully restores light to maximum.
- **Shout Reveal cost:** Using the hold-space Shout Reveal drains a significant chunk of light (~15-20%), making it a costly emergency tool.
- **Minimum visibility:** Light never reaches absolute zero. At minimum, the player can see their immediate tile and adjacent walls. This prevents total blindness, which would feel unfair rather than tense.

**Why No Economy:** Adding currency, shops, or upgrade paths would shift the game from "master the mechanics" to "accumulate advantages." The sonar-and-darkness loop works because the player's tools never improve — only their skill at reading incomplete information does. Items and upgrades are noted as future possibilities but are not part of the core vision.

---

## Level Design Framework

### Level Types

**Standard Level** — The default maze. DFS-generated with extra wall removal for multiple paths. Enemy count and types scale with level number. Safe rooms may or may not be present depending on mode and frequency rules.

**Milestone Level (every 5th level)** — A larger maze with increased corridor complexity. Guarantees one safe room regardless of mode settings. Introduces a new enemy type to the pool (if one hasn't been introduced yet). Serves as both a reward checkpoint (Normal mode saves progress here) and a difficulty gate.

**Gauntlet Level (every 10th level)** — Maximum enemy count for the current difficulty tier. Narrower corridors with fewer branching paths — the maze constrains evasion options. No safe rooms (even in Normal mode). These are designed as skill checks that test whether the player can handle the current difficulty ceiling before escalation continues.

### Level Progression

**Maze Size Scaling:**

| Level Range | Maze Dimensions | Character |
|-|-|-|
| 1-3 | 31x21 | Small, learnable, forgiving |
| 4-6 | 37x25 | Medium, requires mental mapping |
| 7-9 | 43x29 | Large, disorienting, Lurkers are dangerous here |
| 10+ | 51x35 | Maximum size, sustained for all subsequent levels |

**Corridor Density:** Wall removal percentage increases with level, creating more branching paths. Early levels have cleaner layouts (easier to navigate, fewer hiding spots for enemies). Later levels are denser — more escape routes but also more ambush angles.

**Safe Room Frequency:**
- Levels 1-10 (Normal): One safe room every 3 levels, plus guaranteed at milestones
- Levels 11+ (Normal): One safe room every 5 levels, plus guaranteed at milestones
- Hard mode: Safe rooms present but rarer (every 5 levels, no extra guarantee)
- Helpless mode: No safe rooms at all

**Closure Behavior:** Corridors the player has passed through begin sealing after a mode-dependent delay (10 seconds in Normal, 6 seconds in Hard, 4 seconds in Helpless). Sealed corridors become walls — no backtracking through them. This pushes constant forward momentum and prevents camping strategies.

---

## Art and Audio Direction

### Art Style

**Minimalist dark palette with geometric shapes.** No sprites, no textures, no imported art assets. Everything is rendered procedurally through canvas 2D drawing calls.

**Color Palette:**

| Element | Color | Purpose |
|-|-|-|
| Background / void | `#07070c` | Near-black. The dominant color — most of the screen is darkness. |
| Walls | Dark gray, slightly lighter than void | Visible only within light radius. Subtle enough to blend into darkness at edges. |
| Floor (visited) | Faint breadcrumb tint | Barely perceptible shift from void. Aids mental mapping without cluttering. |
| Player | White circle with soft blue glow | High contrast against darkness. The glow represents the light radius. |
| Enemies | Red squares | Distinct from player shape. Only visible within light radius or during sonar sweep. |
| Sonar sweep line | Red, semi-transparent | Side-to-side scan line that briefly illuminates enemy positions as single dots. |
| Exit beacon | Green pulse | Rhythmic glow visible through fog of war (Normal mode) or only when nearby (Hard/Helpless). |
| Safe rooms | Warm bright glow (amber/yellow) | Dramatic contrast against the dark palette. Relief should feel visual. |
| Danger vignette | Red edge darkening | Screen edges tint red when enemies are within a threatening radius. |

**Aesthetic Identity:** Indie-internet minimalism. The game looks like it belongs on itch.io or a curated indie showcase — clean, atmospheric, unapologetically simple. The darkness does most of the visual work. What you don't show matters more than what you do.

**Visual Effects (code-rendered):**
- Player glow radius shrinks/grows with light level
- Sonar sweep animates as a line scanning left-to-right across the visible area
- Shout Reveal produces a brief visibility burst with a radial expansion
- Death plays a brief red flash and player dissolve
- Exit beacon pulses with a sine-wave glow cycle
- Safe room light spills into adjacent corridors

### Audio and Music

**Postponed for MVP.** The game ships silent initially. Audio is a significant production effort and is deferred to a dedicated post-MVP epic.

**Planned Audio Direction (future):**

| Element | Description |
|-|-|
| Ambient drone | Low, persistent hum that shifts pitch with proximity to enemies. The baseline of the soundscape. |
| Sonar sweep SFX | Subtle electronic ping/sweep sound synchronized with the visual scan line. |
| Heartbeat proximity | Player heartbeat sound that increases in tempo as enemies get closer. Replaces visual-only danger cues with visceral audio feedback. |
| Safe room chime | Relief tone on entering a safe room — warm, musical, contrasting the tension. |
| Death sound | Sharp, abrupt. A single-hit impact. No drawn-out death animation audio. |
| Escape sound | Satisfying completion tone on reaching the exit. Brief, rewarding. |
| Corridor closure | Faint rumble or stone-shifting sound when corridors seal behind the player. |
| Narrative text | No voice acting. Text appears silently between levels. |

**No Music:** Gloom is designed without a soundtrack. The silence is part of the atmosphere — ambient sound effects carry the emotional weight. Background music would undermine the feeling of isolation and the impact of sudden audio cues like enemy proximity.

---

## Technical Specifications

### Performance Requirements

- **Frame rate:** 60fps target on mid-range devices (2020-era phone, budget laptop). The game loop runs on `requestAnimationFrame` with delta-time-based updates to handle frame drops gracefully.
- **Rendering:** Canvas 2D context only. No WebGL dependency. All drawing is procedural — rectangles, circles, lines, gradients. No sprite sheets, no image assets to load.
- **Pathfinding:** BFS per enemy per tick. With a maximum of 10 enemies on a 51x35 grid (1,785 cells), worst-case BFS is ~17,850 cell visits per frame. This is well within budget for 60fps on modern hardware.
- **Load time:** Target <2 seconds from URL to gameplay on a 3G connection. Achievable because there are zero external assets — the entire game is code.
- **Bundle size:** Target <500KB total (JS + CSS + HTML). No heavy dependencies. React 19 + Vite 8 with tree-shaking should keep the bundle lean.
- **Memory:** No significant memory concerns. Maze state is a 2D array of integers. No asset caching, no texture memory, no audio buffers (MVP).

### Platform-Specific Details

- **Browser compatibility:** Chrome 90+, Firefox 90+, Safari 15+, Edge 90+. Modern evergreen browsers only — no IE11, no legacy polyfills.
- **Responsive canvas:** The game canvas scales to fit the viewport while maintaining aspect ratio. On desktop, the maze occupies the center of the screen with dark letterboxing. On mobile, it fills the screen.
- **Input handling:** Keyboard events for desktop, touch events for mobile. Both input paths feed into the same action system. No simultaneous input conflicts — the game is turn-paced (tile-based movement), not real-time continuous.
- **Touch controls:** On-screen D-pad and sonar button rendered as canvas overlays or DOM elements. Positioned for thumb reach on portrait-oriented phones. Tap targets minimum 44px.
- **State persistence:** Game state (current level, mode, checkpoint) stored in `localStorage`. Leaderboard data requires a backend (deferred).
- **URL sharing:** Seeds are encodable in URL parameters, enabling direct sharing of specific runs (`gloom.game/?seed=12345&mode=hard`).

### Asset Requirements

**Zero external assets.** Every visual element is rendered procedurally through canvas 2D drawing calls. This is a core architectural decision, not a shortcut — it eliminates asset loading, simplifies deployment, reduces bundle size, and ensures the game works offline without caching strategies.

**What is code-rendered:**
- Maze walls and floors (rectangles)
- Player avatar (circle with radial gradient glow)
- Enemies (squares with color fill)
- Sonar sweep line (animated line with alpha)
- Exit beacon (pulsing circle with glow)
- Safe room lighting (gradient fill)
- UI elements (text rendering, HUD overlays)
- Danger vignette (radial gradient overlay)
- Death and escape visual effects (color flashes, dissolves)

**Fonts:** System font stack only. No custom web fonts to load.

---

## Development Epics

### Epic Structure

**Epic 1: Core Refactor**
Split the existing monolithic prototype into a properly architected codebase. Separate game logic (maze generation, enemy AI, player state) from rendering (canvas drawing) from UI (React components). Establish the service layer, game loop structure, and event system that all subsequent epics build on.

**Epic 2: Sonar Redesign**
Replace the current sonar mechanic with the sweep-line system (side-to-side red scan). Implement the tap/hold dual behavior — tap for standard sonar sweep, hold 0.5s+ for Shout Reveal with wider visibility burst and enemy aggro consequence. Wire sonar to the light resource system for Shout Reveal cost.

**Epic 3: Game Modes and Settings**
Implement the four-mode system (Normal, Hard, Helpless, Custom). Build the mode selection screen UI. Create the settings configuration layer that toggles mechanics per mode (auto vs. manual sonar, breadcrumbs on/off, safe rooms on/off, corridor closure speed, exit hint visibility). Implement mode unlock progression (level 10 gates).

**Epic 4: Enemy Types**
Implement the four distinct enemy behaviors. Patrol: fixed-route movement along predetermined paths. Stalker: follows the player's breadcrumb trail, prioritizing recent tiles. Lurker: invisible to sonar, only revealed within 1-2 tile proximity. Swarm: group behavior that spreads to cut off corridors. Each type uses BFS pathfinding with behavior-specific targeting logic.

**Epic 5: Light System and Safe Rooms**
Build the light-as-resource system — movement cost, standing regeneration, level-based depletion scaling. Implement safe rooms with full light recharge, enemy exclusion zone, anti-camping dispersal timer, and visual warmth contrast. Connect light level to player glow radius for visual feedback.

**Epic 6: Maze Evolution**
Implement corridor closure (delayed wall sealing behind the player). Add shifting walls for Hard mode (random wall segments reposition periodically). Implement moving exit (30% chance relocation in Hard mode). Scale maze dimensions with level progression (31x21 to 51x35). Tune wall removal percentage for corridor density scaling.

**Epic 7: Meta Features**
Build the online leaderboard backend and UI. Implement the seed system for deterministic generation and URL-based seed sharing. Add the inter-level narrative system (single cryptic text lines between levels). Track and display personal bests (highest level, fastest time per seed).

**Epic 8: UI Polish and Mobile**
Responsive canvas scaling for all viewport sizes. Touch control overlay (D-pad, sonar button) with proper sizing and positioning. Mode selection screen with unlock state visualization. HUD design (light meter, level indicator, sonar status). Death and escape screens with retry flow. Menu and pause screen.

**Epic 9: CI/CD and Deployment**
Automated build pipeline with Vite. Hosting setup (static site deployment). Bundle size monitoring. Performance regression testing. Automated lighthouse audits for load time targets.

**Epic 10: Mobile App (Future)**
Native wrapper via Capacitor or PWA manifest for app store distribution. Touch control refinement for native feel. One-time purchase payment integration. App store listing and metadata. Deferred until web version is stable and validated.

---

## Success Metrics

### Technical Metrics

{{technical_metrics}}

### Gameplay Metrics

{{gameplay_metrics}}

---

## Out of Scope

{{out_of_scope}}

---

## Assumptions and Dependencies

{{assumptions_and_dependencies}}
