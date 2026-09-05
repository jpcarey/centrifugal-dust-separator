# Hugging Face prototype — workshop tool audio

Gradio app that classifies short workshop audio clips into coarse tool classes
(table saw, router, sander, idle, …). Intended as an **experiment** for
tool-on detection without a CT clamp — not wired into the ESP32 control loop yet.

## Layout

| Path | Purpose |
| ---- | ------- |
| [`classifier.py`](classifier.py) | Pure NumPy heuristic (unit-tested; no Gradio) |
| [`app.py`](app.py) | Gradio UI + Hugging Face Space entrypoint |
| [`requirements.txt`](requirements.txt) | Space / local Gradio deps |
| [`README_HF_SPACE.md`](README_HF_SPACE.md) | Copy to Space `README.md` (YAML front matter) |
| [`sample_data/`](sample_data/) | Place short labeled WAVs here |

## Local run

```bash
cd smart-dust-collector/hf-prototype
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 app.py
```

Open the printed local URL, upload a WAV/MP3 (or use the mic), and inspect scores.

## Hugging Face Space

1. Create a new Gradio Space.
2. Upload `app.py`, `classifier.py`, `requirements.txt`, and `sample_data/`.
3. Copy `README_HF_SPACE.md` to the Space as `README.md` (keeps the YAML header).
4. Hardware: CPU is enough for the scaffold heuristic.

Replace `classify_audio()` in `classifier.py` with a fine-tuned model when you
have labeled shop recordings.

## Mapping to firmware (later)

| HF class | Suggested action |
| -------- | ---------------- |
| `idle` | No change |
| `table_saw`, `miter_saw`, `router`, … | Open mapped gate + start collector |
| `dust_collector` | Ignore (feedback loop) |
| `unknown` | Require CT clamp confirmation |

See [`../docs/architecture.md`](../docs/architecture.md).
