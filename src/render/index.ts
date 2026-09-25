import { CANVAS_H, CANVAS_W } from "../game/constants";
import type { GameData } from "../game/types";
import { drawCar, drawCartons, drawDropOff, drawObstacles, drawSirenGlow } from "./actors";
import { drawCrashFlash, drawParticles, drawPopups, drawSirenEdge } from "./effects";
import type { HudInfo } from "./hud";
import { drawDragHint, drawHud, drawLevelBanner, drawLoadHints } from "./hud";
import { drawBackground, drawOldMen, drawQuotes } from "./world";

export type RenderInfo = HudInfo;

/** Draws one frame. Reads the game state, never changes it. The HUD stays still while the world shakes. */
export function render(ctx: CanvasRenderingContext2D, g: GameData, info: RenderInfo) {
  ctx.save();
  if (g.shake > 0) {
    // Zoom in a little so the shaking world never uncovers the canvas edges
    const zoom = 1 + g.shake / 250;
    ctx.translate(CANVAS_W / 2, CANVAS_H / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(
      -CANVAS_W / 2 + Math.sin(g.frame * 1.9) * g.shake,
      -CANVAS_H / 2 + Math.cos(g.frame * 2.7) * g.shake * 0.6,
    );
  }
  ctx.clearRect(-20, -20, CANVAS_W + 40, CANVAS_H + 40);
  drawBackground(ctx, g);
  drawOldMen(ctx, g);
  drawDropOff(ctx, g, info.t);
  drawSirenGlow(ctx, g);
  drawCartons(ctx, g);
  drawParticles(ctx, g, "under");
  drawObstacles(ctx, g);
  drawCar(ctx, g);
  drawParticles(ctx, g, "over");
  drawQuotes(ctx, g);
  drawPopups(ctx, g);
  drawSirenEdge(ctx, g);
  drawCrashFlash(ctx, g);
  ctx.restore();

  drawHud(ctx, g, info);
  drawLoadHints(ctx, g, info.t);
  drawLevelBanner(ctx, g, info.t);
  drawDragHint(ctx, g, info);
}
