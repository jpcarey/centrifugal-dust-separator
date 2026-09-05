# Hugging Face prototype — workshop tool audio (TypeScript)

Browser app that classifies short workshop clips into coarse tool classes
(table saw, router, sander, idle, …). Experiment for tool-on detection without a
CT clamp — not wired into the ESP32 control loop yet.

Built with **Vite + TypeScript** (no Python).

## Layout

| Path | Purpose |
| ---- | ------- |
| [`src/classifier.ts`](src/classifier.ts) | Spectral heuristic (unit-tested) |
| [`src/main.ts`](src/main.ts) | UI wiring |
| [`index.html`](index.html) | Page shell |
| [`README_HF_SPACE.md`](README_HF_SPACE.md) | Copy to Space `README.md` for a static Space |
| [`sample_data/`](sample_data/) | Optional short labeled WAVs |

## Local run

From `smart-dust-collector/`:

```bash
npm install
npm run dev:hf
```

Open the printed URL, upload audio or record from the mic.

```bash
npm run build:hf   # static assets in hf-prototype/dist
```

## Hugging Face Space

1. Create a **Static** Space (or Docker serving `dist/`).
2. Build locally with `npm run build:hf` and upload `hf-prototype/dist/*`.
3. Use [`README_HF_SPACE.md`](README_HF_SPACE.md) as the Space README (YAML header).

Later: swap `classifyAudio` for [Transformers.js](https://huggingface.co/docs/transformers.js) when you have labeled shop recordings.

## Mapping to firmware (later)

| Class | Suggested action |
| ----- | ---------------- |
| `idle` | No change |
| `table_saw`, `miter_saw`, `router`, … | Open mapped gate + start collector |
| `dust_collector` | Ignore (feedback loop) |
| `unknown` | Require CT clamp confirmation |

See [`../docs/architecture.md`](../docs/architecture.md).
