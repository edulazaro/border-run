/** Every color and font the canvas uses. Colors that fade are RGB tuples, turned into CSS with `rgba`. */

type RGB = readonly [number, number, number];

export const rgba = ([r, g, b]: RGB, alpha: number) => `rgba(${r},${g},${b},${alpha})`;

export const SKY = {
  top: "#8fbbe0",
  bottom: "#e4eef6",
  sunGlow: [255, 244, 214] as RGB,
  sun: "#fff8e1",
  cloud: "rgba(255,255,255,0.9)",
  cloudShade: "rgba(214,226,238,0.9)",
};

export const MOUNTAINS = {
  far: "#a7b9cc",
  farSnow: "#f3f7fb",
  near: "#9db49a",
  snow: "#fbfdff",
  pine: "#4d6b4c",
  pineDark: "#3e5a3e",
};

export const ROADSIDE = {
  verge: "#8aaa7a",
  vergeEdge: "#7a9a6a",
  grass: "#7a9a6a",
  grassStripe: "#739363",
  bush: "#5e7f52",
  bushLight: "#6f9161",
  rock: "#9a9a92",
  post: "#f2f2f2",
  reflector: "#ff8c1a",
  signPost: "#7c7c7c",
  signBoard: "#1f5fa8",
  signBorder: "#ffffff",
  signText: "#ffffff",
};

export const ROAD = {
  asphalt: "#3a3a3d",
  speckLight: "rgba(255,255,255,0.06)",
  speckDark: "rgba(0,0,0,0.18)",
  laneLine: "#8a8a8a",
  edge: "#f4f4f4",
};

export const OLD_MAN = {
  coat: "#8B7355",
  legs: "#3f3a36",
  skin: "#FFDAB9",
  beret: "#2b2b2b",
  cane: "#6b4a2b",
};

export const BUBBLE = {
  fill: "white",
  border: "black",
  text: "black",
};

export const DROP_OFF = {
  body: "#ececec",
  roof: "#f8f8f8",
  shade: "#c9c9c9",
  glass: "#3b4a55",
  door: "#d6d6d6",
  shadow: "rgba(0,0,0,0.2)",
  wheel: "#1a1a1a",
  hub: "#9a9a9a",
  hazard: "#ffb020",
  guyShirt: "#2f6fb0",
  guyLegs: "#2b2b2b",
  skin: "#FFDAB9",
  label: "#22C55E",
  arrows: [34, 197, 94] as RGB,
  ahead: "#22C55E",
  missed: "#EF4444",
};

export const CARTON = {
  shadow: "rgba(0,0,0,0.25)",
  box: "#f4f1ea",
  band: "#c0392b",
  stripe: "#d4a017",
  edge: "#8a8378",
  glint: "rgba(255,255,255,0.85)",
};

export const POLICE = {
  body: "#173a6e",
  roof: "#f2f4f7",
  stripe: "#f2f4f7",
  glass: "#8ec5e8",
  lightOff: "#3a3a3a",
  red: "#ff2d2d",
  blue: "#2d6bff",
  glowRed: [255, 45, 45] as RGB,
  glowBlue: [45, 107, 255] as RGB,
  label: "#ffffff",
  wheels: "#111",
  charred: "rgba(20, 20, 20, 0.45)",
};

export const TRUCK = {
  trailer: "#d9d9d9",
  rib: "#bdbdbd",
  trailerEdge: "#a9a9a9",
  cabs: ["#b33a3a", "#2f5d8a", "#d99a2b", "#3f7a4a"],
  glass: "#8ec5e8",
  cabShine: "rgba(255,255,255,0.18)",
  wheels: "#1c1c1c",
};

export const CONE = {
  shadow: "rgba(0,0,0,0.2)",
  base: "#e65100",
  body: "#ff7700",
  band: "#fff",
  tip: "#ff5500",
};

export const CAR = {
  shadow: "rgba(0,0,0,0.28)",
  body: "#23262d",
  bodySlow: "#8a2222",
  highlight: "rgba(255,255,255,0.12)",
  roof: "#30343d",
  roofSlow: "#9e2f2f",
  glass: "#6fb7e8",
  sideGlass: "#4a7fa8",
  headlights: "#fff6b0",
  taillights: "#ff3b3b",
  wheels: "#0e0e0e",
  mirror: "#1a1c21",
  carton: "#f4f1ea",
  cartonBand: "#c0392b",
};

export const EFFECTS = {
  exhaust: [205, 205, 205] as RGB,
  smoke: [60, 60, 60] as RGB,
  spark: [255, 190, 80] as RGB,
  debris: [40, 40, 40] as RGB,
  glint: [255, 226, 122] as RGB,
  flash: [255, 255, 255] as RGB,
  fire: [255, 120, 30] as RGB,
  fireCore: [255, 236, 170] as RGB,
  popupPickup: "#ffd24a",
  popupDeliver: "#4ade80",
  popupOutline: "rgba(0,0,0,0.75)",
};

export const HUD = {
  bar: "rgba(0,0,0,0.8)",
  text: "#fff",
  label: "#9a9a9a",
  tobacco: "#DAA520",
  tobaccoSlow: "#EF4444",
  pipEmpty: "#444",
  meterOff: "#333",
  meter: ["#22C55E", "#22C55E", "#22C55E", "#84cc16", "#84cc16", "#EAB308", "#EAB308", "#F97316", "#EF4444", "#EF4444"],
  pillBg: "rgba(0,0,0,0.55)",
  waitDrop: "#DAA520",
  fullOverlay: "rgba(139,69,19,0.3)",
  fullText: "#DAA520",
  dragHint: "#fff",
  level: "#38bdf8",
};

export const FONTS = {
  hud: "bold 13px monospace",
  hudBig: "bold 15px monospace",
  hudSmall: "bold 10px monospace",
  fullWarning: "bold 16px monospace",
  bubble: "10px monospace",
  dropOffLabel: "bold 12px monospace",
  dropOffEdge: "bold 14px monospace",
  sign: "bold 8px sans-serif",
  policeLabel: "bold 6px monospace",
  popup: "bold 15px monospace",
  pill: (size: number) => `bold ${size}px monospace`,
};
