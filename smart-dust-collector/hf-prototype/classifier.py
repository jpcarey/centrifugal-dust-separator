"""Workshop audio → coarse tool class (CPU heuristic scaffold).

No Gradio/torch dependency — safe for host unit tests. The HF Space wraps
this via app.py.
"""

from __future__ import annotations

from typing import Any

import numpy as np

TOOL_LABELS = [
    "idle",
    "table_saw",
    "miter_saw",
    "router",
    "sander",
    "planers_jointer",
    "dust_collector",
    "unknown",
]


def _load_mono(audio: Any, target_sr: int = 16000) -> tuple[np.ndarray, int]:
    """Accept Gradio mic/upload payload or (sample_rate, array) tuple."""
    if audio is None:
        raise ValueError("No audio provided")

    if isinstance(audio, tuple) and len(audio) == 2:
        sr, data = audio
        samples = np.asarray(data, dtype=np.float32)
    elif isinstance(audio, dict) and "sampling_rate" in audio:
        sr = int(audio["sampling_rate"])
        samples = np.asarray(audio["array"], dtype=np.float32)
    else:
        raise ValueError(f"Unsupported audio payload: {type(audio)}")

    if samples.ndim > 1:
        samples = samples.mean(axis=-1)

    peak = np.max(np.abs(samples)) if samples.size else 0.0
    if peak > 1.5:
        samples = samples / 32768.0

    if sr != target_sr and samples.size:
        duration = samples.shape[0] / float(sr)
        new_len = max(1, int(duration * target_sr))
        samples = np.interp(
            np.linspace(0, samples.shape[0] - 1, new_len),
            np.arange(samples.shape[0]),
            samples,
        ).astype(np.float32)
        sr = target_sr

    return samples, sr


def _band_energy(samples: np.ndarray, sr: int, f_lo: float, f_hi: float) -> float:
    if samples.size < 16:
        return 0.0
    spectrum = np.abs(np.fft.rfft(samples * np.hanning(samples.shape[0])))
    freqs = np.fft.rfftfreq(samples.shape[0], d=1.0 / sr)
    mask = (freqs >= f_lo) & (freqs < f_hi)
    if not np.any(mask):
        return 0.0
    return float(np.mean(spectrum[mask]))


def _normalize(scores: dict[str, float]) -> dict[str, float]:
    total = sum(max(0.0, v) for v in scores.values()) or 1.0
    return {k: round(max(0.0, v) / total, 4) for k, v in scores.items()}


def classify_audio(audio: Any) -> dict[str, float]:
    """Return label → score in [0, 1] (heuristic scaffold)."""
    samples, sr = _load_mono(audio)
    rms = float(np.sqrt(np.mean(np.square(samples)))) if samples.size else 0.0

    scores = {label: 0.02 for label in TOOL_LABELS}

    if rms < 0.01:
        scores["idle"] = 0.9
        return _normalize(scores)

    low = _band_energy(samples, sr, 40, 200)
    mid = _band_energy(samples, sr, 200, 2000)
    high = _band_energy(samples, sr, 2000, 8000)
    total = low + mid + high + 1e-9
    low_r, mid_r, high_r = low / total, mid / total, high / total

    scores["table_saw"] = 0.15 + 0.55 * mid_r + 0.2 * high_r
    scores["miter_saw"] = 0.1 + 0.35 * mid_r + 0.4 * high_r
    scores["router"] = 0.1 + 0.6 * high_r
    scores["sander"] = 0.15 + 0.5 * high_r + 0.2 * mid_r
    scores["planers_jointer"] = 0.1 + 0.55 * low_r + 0.25 * mid_r
    scores["dust_collector"] = 0.1 + 0.6 * low_r
    scores["idle"] = max(0.05, 0.4 - rms * 5)
    scores["unknown"] = 0.08

    return _normalize(scores)
