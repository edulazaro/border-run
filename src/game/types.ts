import type { SoundName } from "../sounds";

export type EndReason = "police" | "crash";

/** Side effects the game logic asks the shell to perform. */
export interface GameEvents {
  sound: (name: SoundName) => void;
  vibrate: (pattern: number | number[]) => void;
  end: (reason: EndReason) => void;
}

/** Player input for one tick: held directions, or the point a touch drag steers towards. */
export interface Controls {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  target: { x: number; y: number } | null;
}

export type ObstacleType = "police" | "truck" | "cone";

export interface Obstacle {
  x: number;
  y: number;
  lane: number;
  type: ObstacleType;
  w: number;
  h: number;
  speed: number;
  /** Frames alive. Police chases while it's below `POLICE_CHASE_FRAMES`. */
  life: number;
  /** Rolled the first time the police finds it in its way: true if it won't see it in time. */
  missedByPolice?: boolean;
  /** Police car that crashed: it stays on the road as one more obstacle, tilted by `tilt` radians. */
  wreck?: { tilt: number };
}

export interface Carton {
  x: number;
  lane: number;
  collected: boolean;
}

export type ParticleKind = "exhaust" | "spark" | "smoke" | "debris" | "glint";

export interface Particle {
  kind: ParticleKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

/** Floating text over a pickup or a delivery. */
export interface Popup {
  kind: "pickup" | "deliver";
  text: string;
  x: number;
  y: number;
  life: number;
}

/** Crash in progress: the world stops and the game ends when `timer` runs out. */
export interface Crash {
  reason: EndReason;
  timer: number;
  x: number;
  y: number;
}

export interface OldMan {
  x: number;
  side: "top" | "bottom";
  quoteTimer: number;
  quote: string;
}

/** Whole mutable game state, in canvas coordinates. */
export interface GameData {
  frame: number;
  ended: boolean;

  player: { x: number; y: number; vx: number; vy: number };
  speed: number;
  distance: number;
  level: number;
  /** Frames left of the "LEVEL n" banner. */
  levelBanner: number;
  /** Pixels the road has scrolled since the start. Every parallax layer derives from it. */
  scroll: number;
  shake: number;
  crash: Crash | null;

  tobacco: number;
  delivered: number;
  dropOff: { x: number } | null;

  obstacles: Obstacle[];
  spawnTimer: number;
  sirenActive: boolean;

  cartons: Carton[];
  cartonSpawnTimer: number;

  oldMen: OldMan[];
  oldManSpawnTimer: number;

  particles: Particle[];
  popups: Popup[];
}
