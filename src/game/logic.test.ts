import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  BASE_SPEED,
  CANVAS_W,
  CRASH_FRAMES,
  LANES,
  LEVEL_METERS,
  MAX_LEVEL,
  MAX_TOBACCO,
  METERS_PER_CARTON,
  MIN_SPEED,
  PLAYER_MAX_Y,
  PLAYER_MIN_Y,
  PLAYER_SPEED,
  POLICE_CHASE_FRAMES,
  ROAD_Y,
  SPEED_PER_LEVEL,
  TOUCH_MAX_SPEED,
} from "./constants";
import { maxPolice, update } from "./logic";
import { createGame, resetGame } from "./state";
import { TEXT } from "./texts";
import type { Controls, GameData, GameEvents, Obstacle } from "./types";

const t = TEXT.es;
const idle: Controls = { up: false, down: false, left: false, right: false, target: null };

function setup() {
  const g = createGame();
  // Nothing spawns unless a test asks for it
  g.spawnTimer = g.cartonSpawnTimer = g.oldManSpawnTimer = Number.POSITIVE_INFINITY;
  const ev = { sound: vi.fn(), vibrate: vi.fn(), end: vi.fn() } satisfies GameEvents;
  return { g, ev };
}

function run(g: GameData, ev: GameEvents, ticks: number, controls: Controls = idle) {
  for (let i = 0; i < ticks && !g.ended; i++) update(g, t, controls, ev);
}

function obstacle(type: Obstacle["type"], x: number, y: number): Obstacle {
  return { type, x, y, lane: 0, w: 70, h: 32, speed: 2, life: 0 };
}

beforeEach(() => {
  vi.spyOn(Math, "random").mockReturnValue(0.5);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("speed", () => {
  it("goes up with each level", () => {
    const { g, ev } = setup();
    run(g, ev, 1);
    expect(g.speed).toBe(BASE_SPEED);
    g.distance = LEVEL_METERS * 2;
    run(g, ev, 1);
    expect(g.level).toBe(3);
    expect(g.speed).toBeCloseTo(BASE_SPEED + 2 * SPEED_PER_LEVEL);
  });

  it("drops with more than 4 cartons, never below the minimum", () => {
    const { g, ev } = setup();
    g.tobacco = 4;
    run(g, ev, 1);
    expect(g.speed).toBe(BASE_SPEED);
    g.tobacco = 6;
    run(g, ev, 1);
    expect(g.speed).toBe(MIN_SPEED);
  });
});

describe("steering", () => {
  it("moves with the keys and stays on the road", () => {
    const { g, ev } = setup();
    const y = g.player.y;
    run(g, ev, 1, { ...idle, down: true });
    expect(g.player.y).toBe(y + PLAYER_SPEED);
    run(g, ev, 200, { ...idle, down: true });
    expect(g.player.y).toBe(PLAYER_MAX_Y);
    run(g, ev, 200, { ...idle, up: true });
    expect(g.player.y).toBe(PLAYER_MIN_Y);
  });

  it("follows a touch drag at a capped speed", () => {
    const { g, ev } = setup();
    const x = g.player.x;
    run(g, ev, 1, { ...idle, target: { x: x + 300, y: g.player.y } });
    expect(g.player.x).toBe(x + TOUCH_MAX_SPEED);
  });

  it("slows down with friction when no key is held", () => {
    const { g, ev } = setup();
    run(g, ev, 1, { ...idle, right: true });
    const x = g.player.x;
    run(g, ev, 1);
    expect(g.player.x - x).toBeCloseTo(PLAYER_SPEED * 0.85);
  });
});

describe("collisions", () => {
  it("crashing into a truck stops the car, then ends the run", () => {
    const { g, ev } = setup();
    g.obstacles.push(obstacle("truck", g.player.x + 20, g.player.y));
    run(g, ev, 1);
    expect(ev.sound).toHaveBeenCalledWith("crash");
    expect(ev.vibrate).toHaveBeenCalled();
    expect(g.crash?.reason).toBe("crash");
    expect(g.particles.length).toBeGreaterThan(0);
    expect(ev.end).not.toHaveBeenCalled();

    const distance = g.distance;
    run(g, ev, CRASH_FRAMES);
    expect(g.distance).toBe(distance);
    expect(ev.end).toHaveBeenCalledWith("crash");
    expect(ev.end).toHaveBeenCalledTimes(1);
    expect(g.ended).toBe(true);
  });

  it("being caught by the police ends it with its own reason", () => {
    const { g, ev } = setup();
    g.obstacles.push(obstacle("police", g.player.x + 20, g.player.y));
    run(g, ev, CRASH_FRAMES + 1);
    expect(ev.end).toHaveBeenCalledWith("police");
  });

  it("grazes don't count", () => {
    const { g, ev } = setup();
    g.obstacles.push(obstacle("truck", g.player.x + 58, g.player.y));
    g.obstacles[0].speed = 0;
    run(g, ev, 1);
    expect(ev.end).not.toHaveBeenCalled();
  });
});

describe("levels", () => {
  it("level up every LEVEL_METERS with a sound and a banner", () => {
    const { g, ev } = setup();
    g.distance = LEVEL_METERS - 1;
    run(g, ev, 1);
    expect(g.level).toBe(1);
    run(g, ev, 1);
    expect(g.level).toBe(2);
    expect(g.levelBanner).toBeGreaterThan(0);
    expect(ev.sound).toHaveBeenCalledWith("levelUp");
  });

  it("stop at MAX_LEVEL", () => {
    const { g, ev } = setup();
    g.distance = LEVEL_METERS * 100;
    run(g, ev, 1);
    expect(g.level).toBe(MAX_LEVEL);
  });

  it("bring one more police car every two levels", () => {
    expect([1, 2, 3, 4, 5].map(maxPolice)).toEqual([1, 1, 2, 2, 3]);
  });

  it("from level 3, a second police car joins the chase", () => {
    const { g, ev } = setup();
    vi.spyOn(Math, "random").mockReturnValue(0);
    g.distance = LEVEL_METERS * 2;
    g.obstacles.push(obstacle("police", -60, LANES[3]));
    g.spawnTimer = 1;
    run(g, ev, 1);
    expect(g.obstacles.filter((o) => o.type === "police")).toHaveLength(2);
  });
});

describe("police", () => {
  it("chases, then drives away", () => {
    const { g, ev } = setup();
    g.player.x = 600;
    const police = obstacle("police", 200, LANES[3]);
    g.obstacles.push(police);
    run(g, ev, 10);
    expect(police.x).toBeGreaterThan(200);
    expect(g.sirenActive).toBe(true);
    police.life = POLICE_CHASE_FRAMES;
    const x = police.x;
    run(g, ev, 1);
    expect(police.x).toBeLessThan(x);
  });

  it("only one chases at a time", () => {
    const { g, ev } = setup();
    vi.spyOn(Math, "random").mockReturnValue(0);
    g.obstacles.push(obstacle("police", -60, LANES[3]));
    g.spawnTimer = 1;
    run(g, ev, 1);
    expect(g.obstacles.filter((o) => o.type === "police")).toHaveLength(1);
  });

  it("swerves around a truck in its way", () => {
    const { g, ev } = setup();
    g.player.y = LANES[1];
    const police = obstacle("police", 300, LANES[1]);
    const truck = obstacle("truck", 420, LANES[1]);
    g.obstacles.push(police, truck);
    run(g, ev, 60);
    expect(police.wreck).toBeUndefined();
    expect(truck.missedByPolice).toBe(false);
    expect(ev.sound).not.toHaveBeenCalledWith("policeCrash");
  });

  it("sometimes doesn't see it and is left wrecked on the road", () => {
    const { g, ev } = setup();
    vi.spyOn(Math, "random").mockReturnValue(0.1);
    g.player.y = LANES[1];
    const police = obstacle("police", 300, LANES[1]);
    g.obstacles.push(police, obstacle("truck", 420, LANES[1]));
    run(g, ev, 60);
    expect(police.wreck).toBeDefined();
    expect(ev.sound).toHaveBeenCalledWith("policeCrash");
    const x = police.x;
    run(g, ev, 1);
    expect(police.x).toBeCloseTo(x - g.speed * 2);
    expect(g.sirenActive).toBe(false);
  });

  it("a wreck lets another police car come", () => {
    const { g, ev } = setup();
    vi.spyOn(Math, "random").mockReturnValue(0);
    g.obstacles.push({ ...obstacle("police", 500, LANES[0]), wreck: { tilt: 0.3 } });
    g.spawnTimer = 1;
    run(g, ev, 1);
    expect(g.obstacles.filter((o) => o.type === "police" && !o.wreck)).toHaveLength(1);
  });

  it("hitting a wreck is a crash, not being caught", () => {
    const { g, ev } = setup();
    g.obstacles.push({ ...obstacle("police", g.player.x + 20, g.player.y), wreck: { tilt: 0.3 } });
    run(g, ev, CRASH_FRAMES + 2);
    expect(ev.end).toHaveBeenCalledWith("crash");
  });
});

describe("tobacco", () => {
  function cartonAhead(g: GameData) {
    g.cartons.push({ x: g.player.x + 10, lane: 1, collected: false });
  }

  it("picking up a carton loads it", () => {
    const { g, ev } = setup();
    cartonAhead(g);
    run(g, ev, 1);
    expect(g.tobacco).toBe(1);
    expect(ev.sound).toHaveBeenCalledWith("pickup");
    expect(g.popups[0]).toMatchObject({ kind: "pickup", text: "+1" });
  });

  it("a full trunk can't take more", () => {
    const { g, ev } = setup();
    g.tobacco = MAX_TOBACCO;
    cartonAhead(g);
    run(g, ev, 1);
    expect(g.tobacco).toBe(MAX_TOBACCO);
  });

  it("a full trunk brings the drop-off van", () => {
    const { g, ev } = setup();
    g.tobacco = MAX_TOBACCO;
    run(g, ev, 1);
    expect(g.dropOff).not.toBeNull();
  });

  it("delivering adds distance per carton and empties the trunk", () => {
    const { g, ev } = setup();
    g.tobacco = 3;
    g.player.y = ROAD_Y + 5;
    g.dropOff = { x: g.player.x + 20 };
    const distance = g.distance;
    run(g, ev, 1);
    expect(g.delivered).toBe(3);
    expect(g.tobacco).toBe(0);
    expect(g.dropOff).toBeNull();
    expect(g.distance).toBeCloseTo(distance + BASE_SPEED + 3 * METERS_PER_CARTON);
    expect(ev.sound).toHaveBeenCalledWith("deliver");
    expect(g.popups[0]).toMatchObject({ kind: "deliver", text: `+${3 * METERS_PER_CARTON} m` });
  });

  it("missing the van makes it go away", () => {
    const { g, ev } = setup();
    g.tobacco = 1;
    g.dropOff = { x: -59 };
    run(g, ev, 1);
    expect(g.dropOff).toBeNull();
  });
});

describe("roadside", () => {
  it("old men get a quote from the texts", () => {
    const { g, ev } = setup();
    g.oldManSpawnTimer = 1;
    run(g, ev, 1);
    expect(g.oldMen).toHaveLength(1);
    expect(t.quotes).toContain(g.oldMen[0].quote);
    expect(g.oldMen[0].x).toBeLessThan(CANVAS_W + 20);
  });
});

describe("resetGame", () => {
  it("starts a new run but keeps the scenery where it was", () => {
    const { g, ev } = setup();
    run(g, ev, 50);
    const scroll = g.scroll;
    g.tobacco = 5;
    resetGame(g);
    expect(g.tobacco).toBe(0);
    expect(g.frame).toBe(0);
    expect(g.particles).toHaveLength(0);
    expect(g.scroll).toBe(scroll);
  });
});

describe("effects", () => {
  it("the exhaust puffs and fades", () => {
    const { g, ev } = setup();
    run(g, ev, 10);
    const puffs = g.particles.filter((p) => p.kind === "exhaust");
    expect(puffs.length).toBeGreaterThan(0);
    run(g, ev, 40);
    expect(g.particles.every((p) => p.life > 0)).toBe(true);
  });
});
