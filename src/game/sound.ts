import type { Speaker, ConnectionStatus } from "./types";

export type SoundEvent =
  | "incoming"
  | "outgoing"
  | "typing"
  | "glitch"
  | "intercepted"
  | "offline"
  | "actTransition"
  | "ending";

type OscillatorType = "sine" | "square" | "sawtooth" | "triangle";

type ToneSpec = {
  freq: number;
  duration: number;
  type?: OscillatorType;
  volume?: number;
  attack?: number;
  release?: number;
  detune?: number;
};

type NoiseSpec = {
  duration: number;
  volume?: number;
  filterFreq?: number;
  filterQ?: number;
};

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.5;
      masterGain.connect(ctx.destination);
    } catch {
      return null;
    }
  }
  return ctx;
}

export function resumeAudio(): void {
  const c = getCtx();
  if (c && c.state === "suspended") {
    void c.resume();
  }
}

export function setMasterVolume(v: number): void {
  if (masterGain) {
    masterGain.gain.value = Math.max(0, Math.min(1, v));
  }
}

function playTone(spec: ToneSpec): void {
  const c = getCtx();
  if (!c || !masterGain) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = spec.type ?? "sine";
  osc.frequency.value = spec.freq;
  if (spec.detune) osc.detune.value = spec.detune;

  const vol = spec.volume ?? 0.15;
  const attack = spec.attack ?? 0.005;
  const release = spec.release ?? 0.05;

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(vol, now + attack);
  gain.gain.setValueAtTime(vol, now + spec.duration - release);
  gain.gain.linearRampToValueAtTime(0, now + spec.duration);

  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(now);
  osc.stop(now + spec.duration + 0.02);
}

function playNoise(spec: NoiseSpec): void {
  const c = getCtx();
  if (!c || !masterGain) return;
  const now = c.currentTime;
  const sr = c.sampleRate;
  const frames = Math.floor(sr * spec.duration);
  const buffer = c.createBuffer(1, frames, sr);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  }
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = spec.filterFreq ?? 800;
  filter.Q.value = spec.filterQ ?? 1;
  const gain = c.createGain();
  gain.gain.value = spec.volume ?? 0.08;
  src.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  src.start(now);
}

function playSequence(specs: ToneSpec[], gap: number = 0): void {
  const c = getCtx();
  if (!c) return;
  let t = 0;
  for (const s of specs) {
    playTone({ ...s, attack: s.attack ?? 0.005 });
    const dur = s.duration;
    void t;
    void dur;
    void gap;
  }
}

const speakerTone: Record<Speaker, ToneSpec> = {
  mira: { freq: 660, duration: 0.08, type: "sine", volume: 0.12, release: 0.04 },
  control: { freq: 220, duration: 0.12, type: "triangle", volume: 0.14, release: 0.06 },
  system: { freq: 440, duration: 0.06, type: "square", volume: 0.06, release: 0.02 },
  player: { freq: 880, duration: 0.04, type: "sine", volume: 0.08, release: 0.02 },
};

export function playSound(
  event: SoundEvent,
  speaker?: Speaker,
  status?: ConnectionStatus,
): void {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") return;

  switch (event) {
    case "incoming": {
      const spec = speaker ? speakerTone[speaker] : speakerTone.mira;
      playTone(spec);
      break;
    }
    case "outgoing": {
      playTone(speakerTone.player);
      break;
    }
    case "typing": {
      playTone({ freq: 1200, duration: 0.015, type: "square", volume: 0.03, release: 0.005 });
      break;
    }
    case "glitch": {
      playNoise({ duration: 0.15, volume: 0.06, filterFreq: 1200, filterQ: 2 });
      playTone({ freq: 90, duration: 0.1, type: "sawtooth", volume: 0.05, release: 0.04 });
      break;
    }
    case "intercepted": {
      playTone({ freq: 150, duration: 0.2, type: "sawtooth", volume: 0.08, release: 0.1 });
      playNoise({ duration: 0.2, volume: 0.04, filterFreq: 400, filterQ: 3 });
      break;
    }
    case "offline": {
      playTone({ freq: 100, duration: 0.3, type: "sine", volume: 0.1, release: 0.2 });
      break;
    }
    case "actTransition": {
      playSequence([
        { freq: 330, duration: 0.1, type: "sine", volume: 0.08, release: 0.05 },
        { freq: 440, duration: 0.1, type: "sine", volume: 0.08, release: 0.05 },
        { freq: 550, duration: 0.15, type: "sine", volume: 0.08, release: 0.08 },
      ]);
      break;
    }
    case "ending": {
      playSequence([
        { freq: 440, duration: 0.2, type: "sine", volume: 0.1, release: 0.1 },
        { freq: 330, duration: 0.2, type: "sine", volume: 0.1, release: 0.1 },
        { freq: 220, duration: 0.4, type: "sine", volume: 0.1, release: 0.3 },
      ]);
      break;
    }
  }
  void status;
}

export function isSoundSupported(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext,
  );
}
