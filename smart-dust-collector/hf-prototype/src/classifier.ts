/**
 * Workshop audio → coarse tool class (CPU heuristic scaffold).
 *
 * Deterministic spectral heuristic so the prototype runs in-browser without
 * downloading large weights. Swap classifyAudio for Transformers.js later.
 */

export const TOOL_LABELS = [
  "idle",
  "table_saw",
  "miter_saw",
  "router",
  "sander",
  "planers_jointer",
  "dust_collector",
  "unknown",
] as const;

export type ToolLabel = (typeof TOOL_LABELS)[number];

export type AudioPayload =
  | { sampleRate: number; samples: Float32Array | number[] }
  | [number, Float32Array | number[]];

function toMono(audio: AudioPayload): { sampleRate: number; samples: Float32Array } {
  let sampleRate: number;
  let raw: Float32Array | number[];

  if (Array.isArray(audio)) {
    [sampleRate, raw] = audio;
  } else {
    sampleRate = audio.sampleRate;
    raw = audio.samples;
  }

  let samples = raw instanceof Float32Array ? raw : Float32Array.from(raw);
  const peak = samples.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
  if (peak > 1.5) {
    samples = samples.map((v) => v / 32768);
  }
  return { sampleRate, samples };
}

function resampleLinear(
  samples: Float32Array,
  fromSr: number,
  toSr: number,
): Float32Array {
  if (fromSr === toSr || samples.length === 0) return samples;
  const duration = samples.length / fromSr;
  const newLen = Math.max(1, Math.floor(duration * toSr));
  const out = new Float32Array(newLen);
  for (let i = 0; i < newLen; i++) {
    const src = (i * (samples.length - 1)) / Math.max(1, newLen - 1);
    const lo = Math.floor(src);
    const hi = Math.min(samples.length - 1, lo + 1);
    const t = src - lo;
    out[i] = samples[lo] * (1 - t) + samples[hi] * t;
  }
  return out;
}

function bandEnergy(
  samples: Float32Array,
  sampleRate: number,
  fLo: number,
  fHi: number,
): number {
  if (samples.length < 16) return 0;
  // DFT magnitude mean over band (O(n²) — fine for short clips in the scaffold)
  const n = samples.length;
  let sum = 0;
  let count = 0;
  for (let k = 0; k < Math.floor(n / 2); k++) {
    const freq = (k * sampleRate) / n;
    if (freq < fLo || freq >= fHi) continue;
    let re = 0;
    let im = 0;
    for (let t = 0; t < n; t++) {
      const angle = (2 * Math.PI * k * t) / n;
      // Hann window
      const w = 0.5 * (1 - Math.cos((2 * Math.PI * t) / (n - 1)));
      const x = samples[t] * w;
      re += x * Math.cos(angle);
      im -= x * Math.sin(angle);
    }
    sum += Math.hypot(re, im);
    count += 1;
  }
  return count ? sum / count : 0;
}

function normalize(scores: Record<ToolLabel, number>): Record<ToolLabel, number> {
  const total =
    TOOL_LABELS.reduce((acc, label) => acc + Math.max(0, scores[label]), 0) || 1;
  const out = {} as Record<ToolLabel, number>;
  for (const label of TOOL_LABELS) {
    out[label] = Math.round((Math.max(0, scores[label]) / total) * 10000) / 10000;
  }
  return out;
}

export function classifyAudio(audio: AudioPayload): Record<ToolLabel, number> {
  let { sampleRate, samples } = toMono(audio);
  samples = resampleLinear(samples, sampleRate, 16000);
  sampleRate = 16000;

  // Cap analysis window so the O(n²) scaffold DFT stays interactive in-browser.
  const maxSamples = 4096;
  if (samples.length > maxSamples) {
    const start = Math.floor((samples.length - maxSamples) / 2);
    samples = samples.subarray(start, start + maxSamples);
  }

  let sumSq = 0;
  for (let i = 0; i < samples.length; i++) sumSq += samples[i] * samples[i];
  const rms = samples.length ? Math.sqrt(sumSq / samples.length) : 0;

  const scores = Object.fromEntries(TOOL_LABELS.map((l) => [l, 0.02])) as Record<
    ToolLabel,
    number
  >;

  if (rms < 0.01) {
    scores.idle = 0.9;
    return normalize(scores);
  }

  const low = bandEnergy(samples, sampleRate, 40, 200);
  const mid = bandEnergy(samples, sampleRate, 200, 2000);
  const high = bandEnergy(samples, sampleRate, 2000, 8000);
  const total = low + mid + high + 1e-9;
  const lowR = low / total;
  const midR = mid / total;
  const highR = high / total;

  scores.table_saw = 0.15 + 0.55 * midR + 0.2 * highR;
  scores.miter_saw = 0.1 + 0.35 * midR + 0.4 * highR;
  scores.router = 0.1 + 0.6 * highR;
  scores.sander = 0.15 + 0.5 * highR + 0.2 * midR;
  scores.planers_jointer = 0.1 + 0.55 * lowR + 0.25 * midR;
  scores.dust_collector = 0.1 + 0.6 * lowR;
  scores.idle = Math.max(0.05, 0.4 - rms * 5);
  scores.unknown = 0.08;

  return normalize(scores);
}
