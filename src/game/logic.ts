import {
  BASE_SPEED,
  CANVAS_W,
  CARTON_SIZE,
  CONE_SIZE,
  CRASH_FRAMES,
  DROP_OFF_EVERY,
  DROP_OFF_REACH,
  DROP_OFF_W,
  EXHAUST_EVERY,
  HITBOX_INSET_X,
  HITBOX_INSET_Y,
  LANES,
  LEVEL_BANNER_FRAMES,
  LEVEL_METERS,
  MAX_LEVEL,
  MAX_TOBACCO,
  METERS_PER_CARTON,
  MIN_SPEED,
  PLAYER_FRICTION,
  PLAYER_H,
  PLAYER_MAX_X,
  PLAYER_MAX_Y,
  PLAYER_MIN_X,
  PLAYER_MIN_Y,
  PLAYER_SPEED,
  PLAYER_W,
  POLICE_CHANCE,
  POLICE_CHASE_FRAMES,
  POLICE_DODGE_MARGIN,
  POLICE_DODGE_SPEED,
  POLICE_H,
  POLICE_LOOKAHEAD,
  POLICE_MISS_CHANCE,
  POLICE_W,
  POPUP_FRAMES,
  QUOTE_FRAMES,
  ROAD_H,
  ROAD_Y,
  SLOW_THRESHOLD,
  SLOWDOWN_PER_CARTON,
  SPEED_PER_LEVEL,
  TOUCH_FOLLOW,
  TOUCH_MAX_SPEED,
  TRUCK_CHANCE,
  TRUCK_H,
  TRUCK_W,
} from "./constants";
import type { Texts } from "./texts";
import type { Controls, EndReason, GameData, GameEvents, Obstacle, ParticleKind } from "./types";

export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const pick = <T>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)];

export const isSlow = (g: GameData) => g.tobacco > SLOW_THRESHOLD;
export const trunkFull = (g: GameData) => g.tobacco >= MAX_TOBACCO;

export function endGame(g: GameData, reason: EndReason, ev: GameEvents) {
  if (g.ended) return;
  g.ended = true;
  ev.end(reason);
}

/** Police cars that can chase at once: one more every two levels. */
export const maxPolice = (level: number) => 1 + Math.floor((level - 1) / 2);

const livePolice = (g: GameData) => g.obstacles.filter((o) => o.type === "police" && !o.wreck);

/** Goes up a level every `LEVEL_METERS`, delivery bonuses included. */
function updateLevel(g: GameData, ev: GameEvents) {
  if (g.levelBanner > 0) g.levelBanner--;
  const level = Math.min(MAX_LEVEL, 1 + Math.floor(g.distance / LEVEL_METERS));
  if (level <= g.level) return;
  g.level = level;
  g.levelBanner = LEVEL_BANNER_FRAMES;
  ev.sound("levelUp");
}

function updateSpeed(g: GameData) {
  const slowdown = isSlow(g) ? (g.tobacco - SLOW_THRESHOLD) * SLOWDOWN_PER_CARTON : 0;
  g.speed = Math.max(MIN_SPEED, BASE_SPEED + (g.level - 1) * SPEED_PER_LEVEL - slowdown);
  g.distance += g.speed;
  g.scroll += g.speed * 2;
}

/** Held keys set a fixed speed and friction slows the car down; a touch drag overrides both. */
function steer(g: GameData, controls: Controls) {
  const p = g.player;
  if (controls.up) p.vy = -PLAYER_SPEED;
  else if (controls.down) p.vy = PLAYER_SPEED;
  else p.vy *= PLAYER_FRICTION;

  if (controls.right) p.vx = PLAYER_SPEED;
  else if (controls.left) p.vx = -PLAYER_SPEED;
  else p.vx *= PLAYER_FRICTION;

  if (controls.target) {
    p.vx = clamp((controls.target.x - p.x) * TOUCH_FOLLOW, -TOUCH_MAX_SPEED, TOUCH_MAX_SPEED);
    p.vy = clamp((controls.target.y - p.y) * TOUCH_FOLLOW, -TOUCH_MAX_SPEED, TOUCH_MAX_SPEED);
  }

  p.x = clamp(p.x + p.vx, PLAYER_MIN_X, PLAYER_MAX_X);
  p.y = clamp(p.y + p.vy, PLAYER_MIN_Y, PLAYER_MAX_Y);
}

/** Police while there's room for one more for the level. It comes from behind, everything else from the front. */
function spawnObstacle(g: GameData) {
  const roomForPolice = livePolice(g).length < maxPolice(g.level);
  const r = Math.random();
  const type: Obstacle["type"] = roomForPolice && r < POLICE_CHANCE ? "police" : r < TRUCK_CHANCE ? "truck" : "cone";
  const lane = Math.floor(Math.random() * LANES.length);
  const police = type === "police";
  g.obstacles.push({
    x: police ? -60 : CANVAS_W + 50,
    y: LANES[lane],
    lane,
    type,
    w: police ? POLICE_W : type === "truck" ? TRUCK_W : CONE_SIZE,
    h: police ? POLICE_H : type === "truck" ? TRUCK_H : CONE_SIZE,
    speed: police ? g.speed * 0.6 : g.speed * 1.5 + Math.random(),
    life: 0,
  });
  if (police) g.sirenActive = true;
  g.spawnTimer = Math.max(30, 80 - (g.level - 1) * 7);
}

function spawnPieces(g: GameData, t: Texts) {
  g.spawnTimer--;
  if (g.spawnTimer <= 0) spawnObstacle(g);

  g.cartonSpawnTimer--;
  if (g.cartonSpawnTimer <= 0) {
    g.cartons.push({ x: CANVAS_W + 20, lane: Math.floor(Math.random() * LANES.length), collected: false });
    g.cartonSpawnTimer = 120 + Math.floor(Math.random() * 80);
  }

  g.oldManSpawnTimer--;
  if (g.oldManSpawnTimer <= 0) {
    g.oldMen.push({
      x: CANVAS_W + 20,
      side: Math.random() > 0.5 ? "top" : "bottom",
      quoteTimer: 0,
      quote: pick(t.quotes),
    });
    g.oldManSpawnTimer = 300 + Math.floor(Math.random() * 200);
  }
}

const overlaps = (a: Obstacle, b: Obstacle) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

/** Closest truck, cone or wreck in front of the police and in its way. */
function obstacleAhead(g: GameData, police: Obstacle) {
  let closest: Obstacle | null = null;
  for (const o of g.obstacles) {
    if (o === police) continue;
    const inFront = o.x + o.w > police.x && o.x < police.x + police.w + POLICE_LOOKAHEAD;
    const inWay = o.y < police.y + police.h + POLICE_DODGE_MARGIN && o.y + o.h + POLICE_DODGE_MARGIN > police.y;
    if (inFront && inWay && (!closest || o.x < closest.x)) closest = o;
  }
  return closest;
}

/** Target y to get around `o`: above or below, whichever fits on the road and is nearer the player. */
function dodgeY(g: GameData, police: Obstacle, o: Obstacle) {
  const above = o.y - police.h - POLICE_DODGE_MARGIN;
  const below = o.y + o.h + POLICE_DODGE_MARGIN;
  const options = [above, below].filter((y) => y >= ROAD_Y + 5 && y <= ROAD_Y + ROAD_H - police.h - 5);
  if (options.length === 0) return police.y;
  return options.reduce((a, b) => (Math.abs(a - g.player.y) <= Math.abs(b - g.player.y) ? a : b));
}

/**
 * Police chases the car for `POLICE_CHASE_FRAMES`, then drives off to the left. It swerves around
 * whatever it finds in its way, but now and then it doesn't see it in time.
 */
function movePolice(g: GameData, ob: Obstacle) {
  g.sirenActive = true;
  ob.life++;
  if (ob.life < POLICE_CHASE_FRAMES) {
    ob.x += (g.player.x - ob.x) * 0.004;
    if (ob.x < g.player.x - 300) ob.x += 0.8;
  } else {
    ob.x -= 2.5;
  }

  const ahead = obstacleAhead(g, ob);
  if (ahead) ahead.missedByPolice ??= Math.random() < POLICE_MISS_CHANCE;
  if (ahead && !ahead.missedByPolice) {
    ob.y += clamp(dodgeY(g, ob, ahead) - ob.y, -POLICE_DODGE_SPEED, POLICE_DODGE_SPEED);
  } else if (ob.life < POLICE_CHASE_FRAMES) {
    ob.y += (g.player.y - ob.y) * 0.008;
  }
  ob.y = clamp(ob.y, ROAD_Y + 5, ROAD_Y + ROAD_H - ob.h - 5);
}

/** The police car is left wrecked on the road. A cone goes flying, a truck carries on. */
function wreckPolice(g: GameData, police: Obstacle, hit: Obstacle, ev: GameEvents) {
  const x = (police.x + police.w + hit.x) / 2;
  const y = police.y + police.h / 2;
  police.wreck = { tilt: police.y + police.h / 2 < hit.y + hit.h / 2 ? -0.35 : 0.35 };
  if (hit.type === "cone") g.obstacles = g.obstacles.filter((o) => o !== hit);
  g.shake = Math.max(g.shake, 5);
  burst(g, "spark", x, y, 18, 6, 22, 3);
  burst(g, "debris", x, y, 8, 4, 36, 4);
  burst(g, "smoke", x, y, 6, 1.2, 50, 7);
  for (const m of g.oldMen) m.quoteTimer = QUOTE_FRAMES;
  ev.sound("policeCrash");
  ev.vibrate(40);
}

/** Police cars chasing together push apart instead of piling up on the same spot. */
function keepApart(police: Obstacle[]) {
  for (const a of police) {
    for (const b of police) {
      if (a === b || Math.abs(a.x - b.x) > a.w + 10 || Math.abs(a.y - b.y) > a.h + 8) continue;
      const dir = a.y < b.y || (a.y === b.y && a.x < b.x) ? -1 : 1;
      a.y = clamp(a.y + dir * 1.5, ROAD_Y + 5, ROAD_Y + ROAD_H - a.h - 5);
    }
  }
}

function moveObstacles(g: GameData, ev: GameEvents) {
  g.sirenActive = false;
  for (const ob of g.obstacles) {
    if (ob.wreck || ob.type === "cone") {
      ob.x -= g.speed * 2;
    } else if (ob.type === "police") {
      movePolice(g, ob);
    } else {
      ob.x -= ob.speed;
    }
  }

  const chasing = livePolice(g);
  keepApart(chasing);
  for (const police of chasing) {
    const hit = g.obstacles.find((o) => !chasing.includes(o) && overlaps(police, o));
    if (hit) wreckPolice(g, police, hit, ev);
  }

  for (const ob of g.obstacles) {
    if (ob.wreck && g.frame % 10 === 0) addParticle(g, "smoke", ob.x + ob.w / 2, ob.y + 6, 0.2, -0.5, 45, 5);
  }
  g.obstacles = g.obstacles.filter((o) => o.x > -100 && (o.type === "police" || o.x < CANVAS_W + 200));
}

/** Cartons and old men sit still on the road, so they move at road speed. */
function moveRoadside(g: GameData) {
  for (const c of g.cartons) if (!c.collected) c.x -= g.speed * 2;
  g.cartons = g.cartons.filter((c) => !c.collected && c.x > -30);

  for (const m of g.oldMen) {
    m.x -= g.speed * 2;
    if (m.quoteTimer > 0) m.quoteTimer--;
  }
  g.oldMen = g.oldMen.filter((m) => m.x > -100);
}

function hitsObstacle(g: GameData) {
  const { x, y } = g.player;
  return g.obstacles.find(
    (ob) =>
      x + PLAYER_W - HITBOX_INSET_X > ob.x &&
      x + HITBOX_INSET_X < ob.x + ob.w &&
      y + PLAYER_H - HITBOX_INSET_Y > ob.y &&
      y + HITBOX_INSET_Y < ob.y + ob.h,
  );
}

function addParticle(
  g: GameData,
  kind: ParticleKind,
  x: number,
  y: number,
  vx: number,
  vy: number,
  life: number,
  size: number,
) {
  g.particles.push({ kind, x, y, vx, vy, life, maxLife: life, size });
}

/** Particles flying out of `(x, y)` in every direction. */
function burst(
  g: GameData,
  kind: ParticleKind,
  x: number,
  y: number,
  count: number,
  speed: number,
  life: number,
  size: number,
) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const v = speed * (0.4 + Math.random() * 0.6);
    addParticle(g, kind, x, y, Math.cos(angle) * v, Math.sin(angle) * v, life * (0.6 + Math.random() * 0.4), size);
  }
}

function popup(g: GameData, kind: "pickup" | "deliver", text: string, x: number, y: number) {
  g.popups.push({ kind, text, x, y, life: POPUP_FRAMES });
}

function puffExhaust(g: GameData) {
  if (g.frame % EXHAUST_EVERY !== 0) return;
  const { x, y } = g.player;
  addParticle(
    g,
    "exhaust",
    x - 3,
    y + PLAYER_H - 7,
    -g.speed * 1.5 - Math.random() * 0.5,
    (Math.random() - 0.5) * 0.4,
    24,
    2,
  );
}

/** Moves and fades particles and popups, and settles the screen shake. */
function updateEffects(g: GameData) {
  for (const p of g.particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    if (p.kind === "exhaust" || p.kind === "smoke") {
      p.size += p.kind === "smoke" ? 0.25 : 0.12;
    } else {
      p.vx *= 0.9;
      p.vy *= 0.9;
    }
  }
  g.particles = g.particles.filter((p) => p.life > 0);
  for (const p of g.popups) {
    p.y -= 0.7;
    p.life--;
  }
  g.popups = g.popups.filter((p) => p.life > 0);
  g.shake = g.shake > 0.3 ? g.shake * 0.9 : 0;
}

/** Stops the car where it hit: sparks, smoke and shake, then game over after `CRASH_FRAMES`. */
function crash(g: GameData, ob: Obstacle, ev: GameEvents) {
  const x = (g.player.x + PLAYER_W / 2 + ob.x + ob.w / 2) / 2;
  const y = (g.player.y + PLAYER_H / 2 + ob.y + ob.h / 2) / 2;
  g.crash = { reason: ob.type === "police" && !ob.wreck ? "police" : "crash", timer: CRASH_FRAMES, x, y };
  g.shake = 12;
  burst(g, "spark", x, y, 34, 9, 28, 4);
  burst(g, "debris", x, y, 14, 6, 44, 5);
  burst(g, "smoke", x, y, 12, 1.6, 60, 8);
  ev.sound("crash");
  ev.vibrate([80, 40, 250]);
}

/** The van shows up now and then while carrying tobacco, always when the trunk is full. */
function updateDropOff(g: GameData, ev: GameEvents) {
  if (g.tobacco > 0 && !g.dropOff && g.frame % DROP_OFF_EVERY < 5) g.dropOff = { x: CANVAS_W + 50 };
  if (trunkFull(g) && !g.dropOff) g.dropOff = { x: CANVAS_W + 50 };
  if (!g.dropOff) return;

  g.dropOff.x -= g.speed * 2;
  const { x, y } = g.player;
  const d = g.dropOff;
  if (y < ROAD_Y + DROP_OFF_REACH && x < d.x + DROP_OFF_W && x + PLAYER_W > d.x && d.x < CANVAS_W) {
    const bonus = g.tobacco * METERS_PER_CARTON;
    g.distance += bonus;
    g.delivered += g.tobacco;
    g.tobacco = 0;
    g.dropOff = null;
    ev.sound("deliver");
    popup(g, "deliver", `+${bonus} m`, d.x + 25, ROAD_Y - 36);
    burst(g, "glint", d.x + 25, ROAD_Y - 10, 14, 3, 30, 3);
    for (const m of g.oldMen) m.quoteTimer = QUOTE_FRAMES;
    return;
  }
  if (d.x < -60) g.dropOff = null;
}

function pickUpCartons(g: GameData, ev: GameEvents) {
  const { x, y } = g.player;
  for (const c of g.cartons) {
    if (c.collected) continue;
    const cy = LANES[c.lane];
    if (x + PLAYER_W > c.x && x < c.x + CARTON_SIZE && y + PLAYER_H > cy && y < cy + CARTON_SIZE && !trunkFull(g)) {
      c.collected = true;
      g.tobacco++;
      ev.sound("pickup");
      popup(g, "pickup", "+1", c.x + 9, cy - 4);
      burst(g, "glint", c.x + 9, cy + 7, 8, 2.5, 22, 2);
      const nearMan = g.oldMen.find((m) => Math.abs(m.x - c.x) < 200);
      if (nearMan) nearMan.quoteTimer = QUOTE_FRAMES;
    }
  }
}

/** One 60 Hz tick. A collision starts the crash animation; the game ends when it's over. */
export function update(g: GameData, t: Texts, controls: Controls, ev: GameEvents) {
  g.frame++;
  if (g.crash) {
    g.crash.timer--;
    if (g.crash.timer % 8 === 0) addParticle(g, "smoke", g.crash.x, g.crash.y, 0.2, -0.4, 50, 6);
    updateEffects(g);
    if (g.crash.timer <= 0) endGame(g, g.crash.reason, ev);
    return;
  }

  updateLevel(g, ev);
  updateSpeed(g);
  steer(g, controls);
  spawnPieces(g, t);
  moveObstacles(g, ev);
  moveRoadside(g);

  const hit = hitsObstacle(g);
  if (hit) {
    crash(g, hit, ev);
    return;
  }

  updateDropOff(g, ev);
  pickUpCartons(g, ev);
  puffExhaust(g);
  updateEffects(g);

  if (g.sirenActive && g.frame % 15 === 0) ev.sound(g.frame % 60 < 30 ? "sirenHigh" : "sirenLow");
}
