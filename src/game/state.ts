import { BASE_SPEED, LANES, PLAYER_START_X } from "./constants";
import type { GameData } from "./types";

export function createGame(): GameData {
  return {
    frame: 0,
    ended: false,

    player: { x: PLAYER_START_X, y: LANES[1], vx: 0, vy: 0 },
    speed: BASE_SPEED,
    distance: 0,
    level: 1,
    levelBanner: 0,
    scroll: 0,
    shake: 0,
    crash: null,

    tobacco: 0,
    delivered: 0,
    dropOff: null,

    obstacles: [],
    spawnTimer: 60,
    sirenActive: false,

    cartons: [],
    cartonSpawnTimer: 90,

    oldMen: [],
    oldManSpawnTimer: 200,

    particles: [],
    popups: [],
  };
}

/** Puts `g` back at the start of a run. Keeps the scroll so the backdrop doesn't jump. */
export function resetGame(g: GameData) {
  const { scroll } = g;
  Object.assign(g, createGame(), { scroll });
}
