import { CANVAS_H, CANVAS_W, LANE_H, ROAD_H, ROAD_Y } from "../game/constants";
import { SIGNS } from "../game/texts";
import type { GameData } from "../game/types";
import { drawBubble, noise, wrap } from "./primitives";
import { FONTS, MOUNTAINS, OLD_MAN, ROAD, ROADSIDE, rgba, SKY } from "./theme";

const ROAD_BOTTOM = ROAD_Y + ROAD_H;

/** Calls `draw` for every slot of `size` px visible on a layer scrolled by `offset`. */
function eachSlot(offset: number, size: number, margin: number, draw: (slot: number, x: number) => void) {
  const first = Math.floor((offset - margin) / size);
  const last = Math.floor((offset + CANVAS_W + margin) / size);
  for (let slot = first; slot <= last; slot++) draw(slot, slot * size - offset);
}

function drawSky(ctx: CanvasRenderingContext2D, g: GameData) {
  const sky = ctx.createLinearGradient(0, 0, 0, ROAD_Y);
  sky.addColorStop(0, SKY.top);
  sky.addColorStop(1, SKY.bottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, CANVAS_W, ROAD_Y);

  const glow = ctx.createRadialGradient(840, 72, 10, 840, 72, 90);
  glow.addColorStop(0, rgba(SKY.sunGlow, 0.9));
  glow.addColorStop(1, rgba(SKY.sunGlow, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(740, 0, 200, 170);
  ctx.fillStyle = SKY.sun;
  ctx.beginPath();
  ctx.arc(840, 72, 20, 0, Math.PI * 2);
  ctx.fill();

  eachSlot(g.scroll * 0.03, 260, 120, (slot, x) => {
    if (noise(slot) < 0.3) return;
    const cx = x + noise(slot + 11) * 120;
    const cy = 50 + noise(slot + 23) * 55;
    const s = 0.7 + noise(slot + 37) * 0.6;
    ctx.fillStyle = SKY.cloudShade;
    for (const [dx, dy, r] of CLOUD_PUFFS) {
      ctx.beginPath();
      ctx.arc(cx + dx * s, cy + dy * s + 3, r * s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = SKY.cloud;
    for (const [dx, dy, r] of CLOUD_PUFFS) {
      ctx.beginPath();
      ctx.arc(cx + dx * s, cy + dy * s, r * s, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

const CLOUD_PUFFS = [
  [0, 0, 14],
  [16, -7, 17],
  [34, -2, 15],
  [50, 3, 11],
  [18, 6, 13],
] as const;

/** Far range: one 480 px silhouette repeated, snow on the tallest peaks. */
const FAR_PEAKS = [
  [0, 0],
  [60, 55],
  [110, 35],
  [180, 100],
  [240, 50],
  [300, 88],
  [360, 40],
  [420, 70],
  [480, 0],
] as const;

function drawFarMountains(ctx: CanvasRenderingContext2D, g: GameData) {
  const base = ROAD_Y - 18;
  const off = wrap(g.scroll * 0.04, 480);
  ctx.fillStyle = MOUNTAINS.far;
  ctx.beginPath();
  ctx.moveTo(-off, base);
  for (let rep = 0; rep < 4; rep++) {
    for (const [px, h] of FAR_PEAKS) ctx.lineTo(rep * 480 + px - off, base - h);
  }
  ctx.lineTo(CANVAS_W + 480, base + 20);
  ctx.lineTo(-off, base + 20);
  ctx.fill();

  ctx.fillStyle = MOUNTAINS.farSnow;
  for (let rep = 0; rep < 4; rep++) {
    for (const [px, h] of FAR_PEAKS) {
      if (h < 80) continue;
      const x = rep * 480 + px - off;
      ctx.beginPath();
      ctx.moveTo(x - 14, base - h + 16);
      ctx.lineTo(x, base - h);
      ctx.lineTo(x + 12, base - h + 14);
      ctx.lineTo(x + 3, base - h + 11);
      ctx.fill();
    }
  }
}

/** Near range: two peaks per half screen, repeating every `CANVAS_W` so the parallax wraps seamlessly. */
const peaks = (i: number, offset: number) => ({
  bx: (i * CANVAS_W) / 2 - offset,
  h1: 80 + Math.sin((i % 2) * 2) * 30,
  h2: 100 + Math.cos(i % 2) * 20,
});

function drawNearMountains(ctx: CanvasRenderingContext2D, g: GameData) {
  const off = wrap(g.scroll * 0.15, CANVAS_W);
  ctx.fillStyle = MOUNTAINS.near;
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const { bx, h1, h2 } = peaks(i, off);
    ctx.moveTo(bx, ROAD_Y);
    ctx.lineTo(bx + 80, ROAD_Y - h1);
    ctx.lineTo(bx + 160, ROAD_Y - 40);
    ctx.lineTo(bx + 240, ROAD_Y - h2);
    ctx.lineTo(bx + 320, ROAD_Y - 30);
    ctx.lineTo(bx + CANVAS_W / 2, ROAD_Y);
  }
  ctx.fill();

  ctx.fillStyle = MOUNTAINS.snow;
  for (let i = 0; i < 4; i++) {
    const { bx, h1, h2 } = peaks(i, off);
    for (const [px, h] of [
      [80, h1],
      [240, h2],
    ]) {
      ctx.beginPath();
      ctx.moveTo(bx + px - 12, ROAD_Y - h + 13);
      ctx.lineTo(bx + px, ROAD_Y - h);
      ctx.lineTo(bx + px + 11, ROAD_Y - h + 12);
      ctx.lineTo(bx + px + 3, ROAD_Y - h + 9);
      ctx.lineTo(bx + px - 3, ROAD_Y - h + 12);
      ctx.fill();
    }
  }
}

/** Pine forest at the foot of the mountains, between the far layers and the road. */
function drawPines(ctx: CanvasRenderingContext2D, g: GameData) {
  const base = ROAD_Y - 13;
  eachSlot(g.scroll * 0.45, 34, 40, (slot, x) => {
    if (noise(slot) < 0.3) return;
    const h = 16 + noise(slot + 7) * 18;
    const px = x + noise(slot + 3) * 18;
    const w = h * 0.55;
    ctx.fillStyle = MOUNTAINS.pine;
    ctx.beginPath();
    ctx.moveTo(px, base - h);
    ctx.lineTo(px - w / 2, base);
    ctx.lineTo(px + w / 2, base);
    ctx.fill();
    ctx.fillStyle = MOUNTAINS.pineDark;
    ctx.beginPath();
    ctx.moveTo(px, base - h);
    ctx.lineTo(px, base);
    ctx.lineTo(px + w / 2, base);
    ctx.fill();
  });
}

/** Blue road signs on the top verge, passing at road speed. */
function drawSigns(ctx: CanvasRenderingContext2D, g: GameData) {
  eachSlot(g.scroll, 1100, 80, (slot, x) => {
    if (slot < 1) return;
    const text = SIGNS[slot % SIGNS.length];
    const sx = x + 500;
    ctx.font = FONTS.sign;
    const w = ctx.measureText(text).width + 12;
    ctx.fillStyle = ROADSIDE.signPost;
    ctx.fillRect(sx - 1, ROAD_Y - 30, 2, 28);
    ctx.fillStyle = ROADSIDE.signBorder;
    ctx.fillRect(sx - w / 2 - 1, ROAD_Y - 45, w + 2, 17);
    ctx.fillStyle = ROADSIDE.signBoard;
    ctx.fillRect(sx - w / 2, ROAD_Y - 44, w, 15);
    ctx.fillStyle = ROADSIDE.signText;
    ctx.textAlign = "center";
    ctx.fillText(text, sx, ROAD_Y - 33);
  });
}

/** Reflector posts along both edges of the road. */
function drawPosts(ctx: CanvasRenderingContext2D, g: GameData) {
  eachSlot(g.scroll, 150, 10, (_slot, x) => {
    for (const y of [ROAD_Y - 11, ROAD_BOTTOM + 2]) {
      ctx.fillStyle = ROADSIDE.post;
      ctx.fillRect(x, y, 3, 9);
      ctx.fillStyle = ROADSIDE.reflector;
      ctx.fillRect(x, y + 1, 3, 2);
    }
  });
}

/** Road dashes use a positive offset so they scroll left with the road. */
function drawRoad(ctx: CanvasRenderingContext2D, g: GameData) {
  ctx.fillStyle = ROAD.asphalt;
  ctx.fillRect(0, ROAD_Y, CANVAS_W, ROAD_H);

  eachSlot(g.scroll, 26, 4, (slot, x) => {
    for (let k = 0; k < 3; k++) {
      const n = slot * 3 + k;
      ctx.fillStyle = k === 0 ? ROAD.speckLight : ROAD.speckDark;
      ctx.fillRect(x + noise(n) * 26, ROAD_Y + 6 + noise(n + 1000) * (ROAD_H - 12), 2, 2);
    }
  });

  ctx.strokeStyle = ROAD.laneLine;
  ctx.lineWidth = 2;
  ctx.setLineDash([20, 20]);
  ctx.lineDashOffset = wrap(g.scroll, 40);
  for (let i = 1; i < 4; i++) {
    const ly = ROAD_Y + i * LANE_H;
    ctx.beginPath();
    ctx.moveTo(0, ly);
    ctx.lineTo(CANVAS_W, ly);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  ctx.fillStyle = ROAD.edge;
  ctx.fillRect(0, ROAD_Y + 2, CANVAS_W, 3);
  ctx.fillRect(0, ROAD_BOTTOM - 5, CANVAS_W, 3);
}

/** Top verge and the meadow below the road, with mowing stripes, bushes and rocks. */
function drawGrass(ctx: CanvasRenderingContext2D, g: GameData) {
  ctx.fillStyle = ROADSIDE.verge;
  ctx.fillRect(0, ROAD_Y - 15, CANVAS_W, 15);
  ctx.fillStyle = ROADSIDE.vergeEdge;
  ctx.fillRect(0, ROAD_Y - 15, CANVAS_W, 2);

  ctx.fillStyle = ROADSIDE.grass;
  ctx.fillRect(0, ROAD_BOTTOM, CANVAS_W, CANVAS_H - ROAD_BOTTOM);
  ctx.fillStyle = ROADSIDE.grassStripe;
  eachSlot(g.scroll, 80, 40, (_slot, x) => {
    ctx.beginPath();
    ctx.moveTo(x, ROAD_BOTTOM);
    ctx.lineTo(x + 40, ROAD_BOTTOM);
    ctx.lineTo(x + 20, CANVAS_H);
    ctx.lineTo(x - 20, CANVAS_H);
    ctx.fill();
  });

  eachSlot(g.scroll, 120, 40, (slot, x) => {
    const n = noise(slot + 500);
    const bx = x + noise(slot + 600) * 60;
    const by = ROAD_BOTTOM + 28 + noise(slot + 700) * 40;
    if (n > 0.5) {
      const r = 10 + noise(slot + 800) * 10;
      ctx.fillStyle = ROADSIDE.bush;
      ctx.beginPath();
      ctx.ellipse(bx, by, r * 1.4, r * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = ROADSIDE.bushLight;
      ctx.beginPath();
      ctx.ellipse(bx - r * 0.3, by - r * 0.25, r * 0.8, r * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (n > 0.3) {
      ctx.fillStyle = ROADSIDE.rock;
      ctx.beginPath();
      ctx.ellipse(bx, by, 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

/** Sky, mountains, forest, roadside and road. */
export function drawBackground(ctx: CanvasRenderingContext2D, g: GameData) {
  drawSky(ctx, g);
  drawFarMountains(ctx, g);
  drawNearMountains(ctx, g);
  drawPines(ctx, g);
  drawGrass(ctx, g);
  drawSigns(ctx, g);
  drawRoad(ctx, g);
  drawPosts(ctx, g);
}

/** Old men watching from both roadsides, with their quote while it lasts. */
export function drawOldMen(ctx: CanvasRenderingContext2D, g: GameData) {
  for (const m of g.oldMen) {
    const my = m.side === "top" ? ROAD_Y - 12 : ROAD_BOTTOM + 5;
    ctx.fillStyle = OLD_MAN.legs;
    ctx.fillRect(m.x + 3, my - 3, 2, 7);
    ctx.fillRect(m.x + 7, my - 3, 2, 7);
    ctx.fillStyle = OLD_MAN.coat;
    ctx.fillRect(m.x + 2, my - 12, 8, 10);
    ctx.strokeStyle = OLD_MAN.cane;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(m.x + 12, my - 7);
    ctx.lineTo(m.x + 13, my + 4);
    ctx.stroke();
    ctx.fillStyle = OLD_MAN.skin;
    ctx.beginPath();
    ctx.arc(m.x + 6, my - 16, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = OLD_MAN.beret;
    ctx.beginPath();
    ctx.ellipse(m.x + 6, my - 19, 5, 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Quote bubbles, drawn after the vehicles so nothing covers them. */
export function drawQuotes(ctx: CanvasRenderingContext2D, g: GameData) {
  for (const m of g.oldMen) {
    if (m.quoteTimer <= 0) continue;
    const my = m.side === "top" ? ROAD_Y - 12 : ROAD_BOTTOM + 5;
    drawBubble(ctx, m.quote, m.x + 6, my - 44, Math.min(1, m.quoteTimer / 20));
  }
}
