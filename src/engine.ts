import { PLAYER_SPEED } from "./game/constants";
import type { GameData } from "./game/types";
import { getContext, isMuted } from "./shell/audio";

const VOLUME = 0.09;
const IDLE_HZ = 48;
const HZ_PER_SPEED = 12;
const THROTTLE_HZ = 22;
/** Seconds the pitch and volume take to settle, so the engine revs instead of jumping. */
const SMOOTHING = 0.12;

interface Nodes {
  body: OscillatorNode;
  rumble: OscillatorNode;
  pulse: OscillatorNode;
  filter: BiquadFilterNode;
  master: GainNode;
}

/**
 * Continuous engine hum, synthesized: a sawtooth and a square an octave below through a low-pass
 * filter, with a pulse on the volume that speeds up with the revs. Pitch follows the road speed and
 * goes up while steering forward.
 */
export function createEngine() {
  let nodes: Nodes | null = null;

  const build = (): Nodes => {
    const c = getContext();
    const master = c.createGain();
    master.gain.value = 0;
    master.connect(c.destination);

    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 500;
    filter.Q.value = 2;
    filter.connect(master);

    const body = c.createOscillator();
    body.type = "sawtooth";
    body.frequency.value = IDLE_HZ;
    const bodyGain = c.createGain();
    bodyGain.gain.value = 0.6;
    body.connect(bodyGain).connect(filter);

    const rumble = c.createOscillator();
    rumble.type = "square";
    rumble.frequency.value = IDLE_HZ / 2;
    const rumbleGain = c.createGain();
    rumbleGain.gain.value = 0.4;
    rumble.connect(rumbleGain).connect(filter);

    // Cylinder beat: an LFO on a gain stage between the filter and the master
    const pulse = c.createOscillator();
    pulse.frequency.value = IDLE_HZ / 4;
    const depth = c.createGain();
    depth.gain.value = 0.35;
    const beat = c.createGain();
    beat.gain.value = 0.65;
    filter.disconnect();
    filter.connect(beat).connect(master);
    pulse.connect(depth).connect(beat.gain);

    for (const osc of [body, rumble, pulse]) osc.start();
    return { body, rumble, pulse, filter, master };
  };

  return {
    /** Call once per tick. `on` is false in menus, on pause and while crashing, and the engine fades out. */
    update(g: GameData, on: boolean) {
      const audible = on && !isMuted();
      if (!audible && !nodes) return;
      nodes ??= build();
      const now = getContext().currentTime;
      const throttle = Math.max(0, Math.min(1, g.player.vx / PLAYER_SPEED));
      const hz = IDLE_HZ + g.speed * HZ_PER_SPEED + throttle * THROTTLE_HZ;
      nodes.body.frequency.setTargetAtTime(hz, now, SMOOTHING);
      nodes.rumble.frequency.setTargetAtTime(hz / 2, now, SMOOTHING);
      nodes.pulse.frequency.setTargetAtTime(hz / 4, now, SMOOTHING);
      nodes.filter.frequency.setTargetAtTime(400 + hz * 4 + throttle * 400, now, SMOOTHING);
      nodes.master.gain.setTargetAtTime(audible ? VOLUME : 0, now, audible ? SMOOTHING : 0.05);
    },
  };
}
