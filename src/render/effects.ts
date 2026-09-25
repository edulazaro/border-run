import { CANVAS_H, CANVAS_W, CRASH_FRAMES, POPUP_FRAMES } from "../game/constants";
import type { GameData, Particle } from "../game/types";
import { EFFECTS, FONTS, POLICE, rgba } from "./theme";

const COLORS = {
  exhaust: EFFECTS.exhaust,
  smoke: EFFECTS.smoke,
  spark: EFFECTS.spark,
  debris: EFFECTS.debris,
  glint: EFFECTS.glint,
};

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
  const fade = p.life / p.maxLife;
  if (p.kind === "exhaust" || p.kind === "smoke") {
    ctx.fillStyle = rgba(COLORS[p.kind], fade * (p.kind === "smoke" ? 0.55 : 0.28));
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.fillStyle = rgba(COLORS[p.kind], p.kind === "debris" ? Math.min(1, fade * 2) : fade);
  ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
}

/** Exhaust goes under the vehicles, everything else over them. */
export function drawParticles(ctx: CanvasRenderingContext2D, g: GameData, layer: "under" | "over") {
  for (const p of g.particles) {
    if ((p.kind === "exhaust") === (layer === "under")) drawParticle(ctx, p);
  }
}

/** "+1" over pickups and "+450 m" over deliveries, rising and fading. */
export function drawPopups(ctx: CanvasRenderingContext2D, g: GameData) {
  ctx.font = FONTS.popup;
  ctx.textAlign = "center";
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  for (const p of g.popups) {
    ctx.globalAlpha = Math.min(1, (p.life / POPUP_FRAMES) * 2);
    ctx.strokeStyle = EFFECTS.popupOutline;
    ctx.strokeText(p.text, p.x, p.y);
    ctx.fillStyle = p.kind === "deliver" ? EFFECTS.popupDeliver : EFFECTS.popupPickup;
    ctx.fillText(p.text, p.x, p.y);
  }
  ctx.globalAlpha = 1;
  ctx.lineJoin = "miter";
}

/** Siren light on the left edge while the police is after you. */
export function drawSirenEdge(ctx: CanvasRenderingContext2D, g: GameData) {
  if (!g.sirenActive || g.crash) return;
  const color = g.frame % 20 < 10 ? POLICE.glowRed : POLICE.glowBlue;
  const edge = ctx.createLinearGradient(0, 0, 70, 0);
  edge.addColorStop(0, rgba(color, 0.22));
  edge.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, 70, CANVAS_H);
}

/** Fireball at the impact point, fading over the first frames, plus a white flash. */
export function drawCrashFlash(ctx: CanvasRenderingContext2D, g: GameData) {
  if (!g.crash) return;
  const { x, y, timer } = g.crash;
  const fire = (timer - (CRASH_FRAMES - 24)) / 24;
  if (fire > 0) {
    const r = 30 + (1 - fire) * 50;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
    glow.addColorStop(0, rgba(EFFECTS.fireCore, fire));
    glow.addColorStop(0.4, rgba(EFFECTS.fire, fire * 0.8));
    glow.addColorStop(1, rgba(EFFECTS.fire, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  const flash = timer - (CRASH_FRAMES - 8);
  if (flash <= 0) return;
  ctx.fillStyle = rgba(EFFECTS.flash, (flash / 8) * 0.55);
  ctx.fillRect(-20, -20, CANVAS_W + 40, CANVAS_H + 40);
}
