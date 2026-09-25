import type { SoundLayer } from "./shell/audio";
import { playLayers } from "./shell/audio";

export type SoundName = "pickup" | "deliver" | "crash" | "policeCrash" | "levelUp" | "sirenHigh" | "sirenLow";

/** Every sound in the game. Play them with `playSound(name)`. */
const SOUNDS: Record<SoundName, readonly SoundLayer[]> = {
  pickup: [{ kind: "tone", from: 587, to: 880, glide: 0.1, duration: 0.15, volume: 0.12 }],
  deliver: [
    { kind: "tone", from: 587, to: 880, glide: 0.08, duration: 0.12, volume: 0.12 },
    { kind: "tone", from: 880, to: 1175, glide: 0.08, duration: 0.2, volume: 0.12, delay: 0.1 },
  ],
  crash: [
    { kind: "tone", wave: "sawtooth", from: 200, to: 40, duration: 0.4, volume: 0.15 },
    { kind: "noise", lowpass: 800, duration: 0.35, volume: 0.2 },
  ],
  levelUp: [
    { kind: "tone", from: 440, duration: 0.1, volume: 0.1 },
    { kind: "tone", from: 587, duration: 0.1, volume: 0.1, delay: 0.1 },
    { kind: "tone", from: 880, duration: 0.25, volume: 0.1, delay: 0.2 },
  ],
  policeCrash: [
    { kind: "noise", lowpass: 1400, duration: 0.25, volume: 0.14 },
    { kind: "tone", wave: "square", from: 700, to: 180, glide: 0.6, duration: 0.7, volume: 0.035, delay: 0.05 },
  ],
  sirenHigh: [{ kind: "tone", from: 660, duration: 0.08, volume: 0.03 }],
  sirenLow: [{ kind: "tone", from: 550, duration: 0.08, volume: 0.03 }],
};

export const playSound = (name: SoundName) => playLayers(SOUNDS[name]);
