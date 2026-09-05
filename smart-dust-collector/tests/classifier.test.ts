import { describe, expect, it } from "vitest";
import { TOOL_LABELS, classifyAudio } from "../hf-prototype/src/classifier";

function tone(
  freq: number,
  seconds = 0.25,
  sampleRate = 16000,
  amp = 0.2,
): { sampleRate: number; samples: Float32Array } {
  const n = Math.floor(sampleRate * seconds);
  const samples = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    samples[i] = amp * Math.sin((2 * Math.PI * freq * i) / sampleRate);
  }
  return { sampleRate, samples };
}

describe("classifyAudio", () => {
  it("labels silence as idle", () => {
    const scores = classifyAudio({
      sampleRate: 16000,
      samples: new Float32Array(8000),
    });
    expect(Object.keys(scores).sort()).toEqual([...TOOL_LABELS].sort());
    expect(scores.idle).toBe(Math.max(...Object.values(scores)));
  });

  it("prefers router/sander for high-frequency energy", () => {
    const scores = classifyAudio(tone(4000, 0.25, 16000, 0.3));
    expect(scores.router).toBeGreaterThan(scores.dust_collector);
    expect(scores.sander).toBeGreaterThan(scores.idle);
  });

  it("returns scores that sum to ~1", () => {
    const scores = classifyAudio(tone(300, 0.25, 16000, 0.25));
    const sum = Object.values(scores).reduce((a, b) => a + b, 0);
    expect(sum).toBeGreaterThan(0.99);
    expect(sum).toBeLessThan(1.01);
  });
});
