import { CANVAS_W, CONE_SIZE, LANES, MAX_TOBACCO, PLAYER_H, PLAYER_W, ROAD_Y } from "../game/constants";
import { isSlow } from "../game/logic";
import type { Texts } from "../game/texts";
import type { GameData, Obstacle } from "../game/types";
import { fillRound } from "./primitives";
import { CAR, CARTON, CONE, DROP_OFF, FONTS, POLICE, rgba, TRUCK } from "./theme";

/** Side view of the smugglers' van parked on the top verge, with its rear doors open and a lookout waving. */
function drawVan(ctx: CanvasRenderingContext2D, dx: number, dy: number, frame: number) {
  ctx.fillStyle = DROP_OFF.shadow;
  ctx.beginPath();
  ctx.ellipse(dx + 25, dy + 2, 30, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = DROP_OFF.door;
  ctx.fillRect(dx - 7, dy - 19, 7, 15);
  ctx.fillStyle = DROP_OFF.body;
  fillRound(ctx, dx, dy - 20, 40, 19, 3);
  fillRound(ctx, dx + 34, dy - 16, 17, 15, 4);
  ctx.fillStyle = DROP_OFF.roof;
  ctx.fillRect(dx + 1, dy - 20, 38, 2);
  ctx.fillStyle = DROP_OFF.shade;
  ctx.fillRect(dx, dy - 8, 51, 2);
  ctx.fillStyle = DROP_OFF.glass;
  ctx.fillRect(dx + 1, dy - 17, 3, 8);
  ctx.fillRect(dx + 37, dy - 14, 6, 6);
  ctx.fillRect(dx + 45, dy - 14, 5, 6);

  for (const wx of [dx + 10, dx + 40]) {
    ctx.fillStyle = DROP_OFF.wheel;
    ctx.beginPath();
    ctx.arc(wx, dy - 1, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = DROP_OFF.hub;
    ctx.beginPath();
    ctx.arc(wx, dy - 1, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  if (frame % 30 < 15) {
    ctx.fillStyle = DROP_OFF.hazard;
    ctx.fillRect(dx, dy - 5, 2, 3);
    ctx.fillRect(dx + 49, dy - 5, 2, 3);
  }

  const gx = dx - 16;
  ctx.fillStyle = DROP_OFF.guyLegs;
  ctx.fillRect(gx + 1, dy - 7, 2, 7);
  ctx.fillRect(gx + 5, dy - 7, 2, 7);
  ctx.fillStyle = DROP_OFF.guyShirt;
  ctx.fillRect(gx, dy - 15, 8, 9);
  ctx.strokeStyle = DROP_OFF.guyShirt;
  ctx.lineWidth = 2;
  const wave = Math.sin(frame * 0.3) * 0.6;
  ctx.beginPath();
  ctx.moveTo(gx + 7, dy - 14);
  ctx.lineTo(gx + 7 + Math.sin(wave + 0.6) * 7, dy - 14 - Math.cos(wave + 0.6) * 7);
  ctx.stroke();
  ctx.fillStyle = DROP_OFF.skin;
  ctx.beginPath();
  ctx.arc(gx + 4, dy - 18, 3.5, 0, Math.PI * 2);
  ctx.fill();
}

/** Van on the top roadside, chevrons on the road pointing at it, and a notice while it's off screen. */
export function drawDropOff(ctx: CanvasRenderingContext2D, g: GameData, t: Texts) {
  if (!g.dropOff) return;
  const dx = g.dropOff.x;
  const dy = ROAD_Y - 10;
  drawVan(ctx, dx, dy, g.frame);
  if (g.frame % 30 < 20) {
    ctx.fillStyle = DROP_OFF.label;
    ctx.font = FONTS.dropOffLabel;
    ctx.textAlign = "center";
    ctx.fillText(t.dropHere, dx + 25, dy - 30);
  }

  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let i = 0; i < 3; i++) {
    const ax = dx + 25 - 30 + i * 30;
    const pulse = Math.sin(g.frame * 0.12 - i * 0.8);
    const ay = ROAD_Y + 42 + pulse * 5;
    ctx.strokeStyle = rgba(DROP_OFF.arrows, 0.45 + pulse * 0.25);
    ctx.beginPath();
    ctx.moveTo(ax - 9, ay + 8);
    ctx.lineTo(ax, ay);
    ctx.lineTo(ax + 9, ay + 8);
    ctx.stroke();
  }
  ctx.lineCap = "butt";
  ctx.lineJoin = "miter";

  if (dx > CANVAS_W - 30) {
    ctx.fillStyle = DROP_OFF.ahead;
    ctx.font = FONTS.dropOffEdge;
    ctx.textAlign = "right";
    ctx.fillText(t.dropAhead, CANVAS_W - 10, ROAD_Y + 30);
  }
  if (dx < -40) {
    ctx.fillStyle = DROP_OFF.missed;
    ctx.font = FONTS.dropOffEdge;
    ctx.textAlign = "left";
    ctx.fillText(t.dropMissed, 10, ROAD_Y + 30);
  }
}

/** Tobacco cartons bobbing on the road, with a glint now and then. */
export function drawCartons(ctx: CanvasRenderingContext2D, g: GameData) {
  for (const c of g.cartons) {
    if (c.collected) continue;
    const cy = LANES[c.lane] + 5;
    const bob = Math.sin(g.frame * 0.12 + c.lane * 1.7) * 1.5;
    ctx.fillStyle = CARTON.shadow;
    ctx.beginPath();
    ctx.ellipse(c.x + 9, cy + 15, 9, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    const top = cy - 2 + bob;
    ctx.fillStyle = CARTON.box;
    ctx.fillRect(c.x, top, 18, 14);
    ctx.fillStyle = CARTON.band;
    ctx.fillRect(c.x, top, 18, 5);
    ctx.fillStyle = CARTON.stripe;
    ctx.fillRect(c.x, top + 5, 18, 1);
    ctx.strokeStyle = CARTON.edge;
    ctx.lineWidth = 1;
    ctx.strokeRect(c.x + 0.5, top + 0.5, 17, 13);
    if ((g.frame + c.lane * 13) % 70 < 8) {
      ctx.fillStyle = CARTON.glint;
      ctx.fillRect(c.x + 12, top + 7, 2, 5);
      ctx.fillRect(c.x + 11, top + 9, 4, 1);
    }
  }
}

/** Red and blue light the police siren throws on the road around the car. */
export function drawSirenGlow(ctx: CanvasRenderingContext2D, g: GameData) {
  for (const ob of g.obstacles) {
    if (ob.type !== "police" || ob.wreck) continue;
    const cx = ob.x + ob.w / 2;
    const cy = ob.y + ob.h / 2;
    const color = g.frame % 10 < 5 ? POLICE.glowRed : POLICE.glowBlue;
    const glow = ctx.createRadialGradient(cx, cy, 5, cx, cy, 80);
    glow.addColorStop(0, rgba(color, 0.35));
    glow.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(cx - 80, cy - 80, 160, 160);
  }
}

function drawWheels(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  for (const wx of [x + 7, x + w - 18]) {
    ctx.fillRect(wx, y - 2, 11, 4);
    ctx.fillRect(wx, y + h - 2, 11, 4);
  }
}

/** Top-down police car facing right: white roof, light bar flashing red and blue. A wreck is tilted, dark and unlit. */
function drawPolice(ctx: CanvasRenderingContext2D, ob: Obstacle, frame: number) {
  const { x, y, w, h, wreck } = ob;
  if (wreck) {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(wreck.tilt);
    ctx.translate(-x - w / 2, -y - h / 2);
  }
  ctx.fillStyle = CAR.shadow;
  fillRound(ctx, x + 3, y + 4, w, h, 7);
  drawWheels(ctx, x, y, w, h, POLICE.wheels);
  ctx.fillStyle = POLICE.body;
  fillRound(ctx, x, y, w, h, 7);
  ctx.fillStyle = POLICE.roof;
  fillRound(ctx, x + 14, y + 4, 22, h - 8, 3);
  ctx.fillStyle = POLICE.glass;
  ctx.beginPath();
  ctx.moveTo(x + 37, y + 5);
  ctx.lineTo(x + 43, y + 3);
  ctx.lineTo(x + 43, y + h - 3);
  ctx.lineTo(x + 37, y + h - 5);
  ctx.fill();
  ctx.fillRect(x + 9, y + 6, 4, h - 12);

  const redOn = frame % 10 < 5;
  ctx.fillStyle = redOn && !wreck ? POLICE.red : POLICE.lightOff;
  ctx.fillRect(x + 22, y + 3, 6, h / 2 - 3);
  ctx.fillStyle = redOn || wreck ? POLICE.lightOff : POLICE.blue;
  ctx.fillRect(x + 22, y + h / 2, 6, h / 2 - 3);

  ctx.fillStyle = CAR.headlights;
  ctx.fillRect(x + w - 3, y + 4, 3, 5);
  ctx.fillRect(x + w - 3, y + h - 9, 3, 5);
  ctx.fillStyle = CAR.taillights;
  ctx.fillRect(x, y + 4, 2, 4);
  ctx.fillRect(x, y + h - 8, 2, 4);

  ctx.fillStyle = POLICE.label;
  ctx.font = FONTS.policeLabel;
  ctx.textAlign = "center";
  ctx.save();
  ctx.translate(x + w - 8, y + h / 2);
  ctx.rotate(Math.PI / 2);
  ctx.fillText("POLICIA", 0, 2);
  ctx.restore();

  if (wreck) {
    ctx.fillStyle = POLICE.charred;
    fillRound(ctx, x, y, w, h, 7);
    ctx.restore();
  }
}

/** Lorry seen from above: ribbed trailer and a coloured cab at the front. */
function drawTruck(ctx: CanvasRenderingContext2D, ob: Obstacle) {
  const { x, y, w, h } = ob;
  ctx.fillStyle = CAR.shadow;
  fillRound(ctx, x + 3, y + 4, w, h, 3);
  ctx.fillStyle = TRUCK.wheels;
  for (const wx of [x + 4, x + 16, x + 30, x + w - 14]) {
    ctx.fillRect(wx, y - 2, 9, 4);
    ctx.fillRect(wx, y + h - 2, 9, 4);
  }
  const trailerW = w - 20;
  ctx.fillStyle = TRUCK.trailer;
  ctx.fillRect(x, y, trailerW, h);
  ctx.fillStyle = TRUCK.rib;
  for (let rx = x + 5; rx < x + trailerW - 2; rx += 7) ctx.fillRect(rx, y + 2, 1, h - 4);
  ctx.strokeStyle = TRUCK.trailerEdge;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, trailerW - 1, h - 1);
  ctx.fillStyle = TRUCK.wheels;
  ctx.fillRect(x + trailerW, y + h / 2 - 3, 2, 6);
  ctx.fillStyle = TRUCK.cabs[ob.lane % TRUCK.cabs.length];
  fillRound(ctx, x + trailerW + 2, y + 1, 18, h - 2, 4);
  ctx.fillStyle = TRUCK.glass;
  ctx.fillRect(x + w - 6, y + 5, 4, h - 10);
  ctx.fillStyle = TRUCK.cabShine;
  ctx.fillRect(x + trailerW + 4, y + 3, 8, h - 6);
}

/** Traffic cone seen from above: shadow, base plate, body, reflective band and tip. */
function drawCone(ctx: CanvasRenderingContext2D, ob: Obstacle) {
  const cx = ob.x + CONE_SIZE / 2;
  const cy = ob.y + CONE_SIZE / 2;
  const disc = (color: string, r: number, dx = 0, dy = 0) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx + dx, cy + dy, r, 0, Math.PI * 2);
    ctx.fill();
  };
  disc(CONE.shadow, 10, 2, 3);
  disc(CONE.base, 9);
  disc(CONE.body, 6);
  ctx.strokeStyle = CONE.band;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
  ctx.stroke();
  disc(CONE.tip, 2);
}

export function drawObstacles(ctx: CanvasRenderingContext2D, g: GameData) {
  for (const ob of g.obstacles) {
    if (ob.type === "police") drawPolice(ctx, ob, g.frame);
    else if (ob.type === "truck") drawTruck(ctx, ob);
    else drawCone(ctx, ob);
  }
}

/** Player car facing right, red while overloaded, with the tobacco cartons tied on the roof. */
export function drawCar(ctx: CanvasRenderingContext2D, g: GameData) {
  const { x, y } = g.player;
  const W = PLAYER_W;
  const H = PLAYER_H;
  const slow = isSlow(g);

  ctx.fillStyle = CAR.shadow;
  fillRound(ctx, x + 3, y + 4, W, H, 8);
  drawWheels(ctx, x, y, W, H, CAR.wheels);
  ctx.fillStyle = slow ? CAR.bodySlow : CAR.body;
  fillRound(ctx, x, y, W, H, 8);
  ctx.fillStyle = CAR.highlight;
  fillRound(ctx, x + 4, y + 2, W - 10, 4, 2);
  ctx.fillStyle = CAR.mirror;
  ctx.fillRect(x + 40, y - 2, 3, 3);
  ctx.fillRect(x + 40, y + H - 1, 3, 3);

  ctx.fillStyle = slow ? CAR.roofSlow : CAR.roof;
  fillRound(ctx, x + 16, y + 4, 26, H - 8, 4);
  ctx.fillStyle = CAR.sideGlass;
  ctx.fillRect(x + 18, y + 3, 21, 2);
  ctx.fillRect(x + 18, y + H - 5, 21, 2);
  ctx.fillStyle = CAR.glass;
  ctx.beginPath();
  ctx.moveTo(x + 43, y + 5);
  ctx.lineTo(x + 49, y + 3);
  ctx.lineTo(x + 49, y + H - 3);
  ctx.lineTo(x + 43, y + H - 5);
  ctx.fill();
  ctx.fillStyle = CAR.sideGlass;
  ctx.fillRect(x + 10, y + 6, 4, H - 12);

  ctx.fillStyle = CAR.headlights;
  ctx.fillRect(x + W - 3, y + 4, 3, 6);
  ctx.fillRect(x + W - 3, y + H - 10, 3, 6);
  ctx.fillStyle = CAR.taillights;
  ctx.fillRect(x, y + 4, 2, 5);
  ctx.fillRect(x, y + H - 9, 2, 5);

  for (let i = 0; i < Math.min(g.tobacco, MAX_TOBACCO); i++) {
    const bx = x + 18 + (i % 4) * 6;
    const by = i < 4 ? y + 8 : y + H - 13;
    ctx.fillStyle = CAR.carton;
    ctx.fillRect(bx, by, 5, 5);
    ctx.fillStyle = CAR.cartonBand;
    ctx.fillRect(bx, by, 5, 2);
  }
}
