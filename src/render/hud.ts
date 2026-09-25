import { CANVAS_H, CANVAS_W, DRAG_HINT_FRAMES, MAX_TOBACCO } from "../game/constants";
import { isSlow, trunkFull } from "../game/logic";
import type { Texts } from "../game/texts";
import type { GameData } from "../game/types";
import { drawPill } from "./primitives";
import { FONTS, HUD } from "./theme";

export interface HudInfo {
  t: Texts;
  isTouch: boolean;
  playing: boolean;
  highScore: number;
}

const PIP_W = 10;
const PIP_GAP = 3;
const METER_SEGMENTS = 10;

/** Top bar: distance, one pip per carton in the trunk, speed meter and best distance. */
export function drawHud(ctx: CanvasRenderingContext2D, g: GameData, info: HudInfo) {
  const { t } = info;
  ctx.fillStyle = HUD.bar;
  ctx.fillRect(0, 0, CANVAS_W, 30);
  ctx.textBaseline = "middle";

  ctx.font = FONTS.hudBig;
  ctx.fillStyle = HUD.text;
  ctx.textAlign = "left";
  const distance = `${Math.floor(g.distance)} m`;
  ctx.fillText(distance, 12, 16);
  const distanceW = ctx.measureText(distance).width;
  ctx.font = FONTS.hud;
  ctx.fillStyle = HUD.level;
  ctx.fillText(`${t.level} ${g.level}`, 12 + distanceW + 14, 16);

  const slow = isSlow(g);
  const pipsW = MAX_TOBACCO * (PIP_W + PIP_GAP) - PIP_GAP;
  const pipsX = CANVAS_W / 2 - pipsW / 2;
  ctx.font = FONTS.hudSmall;
  ctx.fillStyle = HUD.label;
  ctx.textAlign = "right";
  ctx.fillText(t.tobacco, pipsX - 10, 16);
  for (let i = 0; i < MAX_TOBACCO; i++) {
    ctx.fillStyle = i < g.tobacco ? (slow ? HUD.tobaccoSlow : HUD.tobacco) : HUD.pipEmpty;
    ctx.fillRect(pipsX + i * (PIP_W + PIP_GAP), 9, PIP_W, 13);
  }
  if (slow) {
    ctx.font = FONTS.hud;
    ctx.fillStyle = HUD.tobaccoSlow;
    ctx.textAlign = "left";
    ctx.fillText(t.slow, pipsX + pipsW + 10, 16);
  }

  const best = `${t.record}: ${info.highScore} m`;
  ctx.font = FONTS.hud;
  ctx.fillStyle = HUD.label;
  ctx.textAlign = "right";
  ctx.fillText(best, CANVAS_W - 12, 16);
  const meterX = CANVAS_W - 12 - ctx.measureText(best).width - 18 - METER_SEGMENTS * 7;
  const lit = Math.round(Math.min(1, g.speed / 8) * METER_SEGMENTS);
  for (let i = 0; i < METER_SEGMENTS; i++) {
    ctx.fillStyle = i < lit ? HUD.meter[i] : HUD.meterOff;
    ctx.fillRect(meterX + i * 7, 10, 5, 11);
  }
  ctx.textBaseline = "alphabetic";
}

/** "Wait for the drop-off" while carrying tobacco, and a flashing warning when the trunk is full. */
export function drawLoadHints(ctx: CanvasRenderingContext2D, g: GameData, t: Texts) {
  if (g.crash) return;
  if (g.tobacco > 0 && !trunkFull(g) && !g.dropOff) drawPill(ctx, t.waitDrop, CANVAS_W / 2, 48, 11, HUD.waitDrop);

  if (trunkFull(g) && g.frame % 40 < 25) {
    ctx.fillStyle = HUD.fullOverlay;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = HUD.fullText;
    ctx.font = FONTS.fullWarning;
    ctx.textAlign = "center";
    ctx.fillText(t.trunkFull, CANVAS_W / 2, CANVAS_H / 2 - 40);
  }
}

/** "LEVEL n" in the middle of the road for a couple of seconds after going up a level. */
export function drawLevelBanner(ctx: CanvasRenderingContext2D, g: GameData, t: Texts) {
  if (g.levelBanner <= 0 || g.crash || g.frame % 20 >= 14) return;
  drawPill(ctx, `${t.level} ${g.level}`, CANVAS_W / 2, CANVAS_H / 2 - 90, 22, HUD.level);
}

/** Blinking "drag to steer" during the first seconds on touch devices. */
export function drawDragHint(ctx: CanvasRenderingContext2D, g: GameData, info: HudInfo) {
  if (info.isTouch && info.playing && g.frame < DRAG_HINT_FRAMES && g.frame % 60 < 40) {
    drawPill(ctx, info.t.dragHint, CANVAS_W / 2, CANVAS_H - 45, 13, HUD.dragHint);
  }
}
