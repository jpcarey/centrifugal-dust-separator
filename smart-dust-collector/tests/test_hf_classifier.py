"""Tests for the HF audio heuristic classifier."""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "hf-prototype"))

from classifier import TOOL_LABELS, classify_audio  # noqa: E402


def _tone(freq: float, seconds: float = 0.5, sr: int = 16000, amp: float = 0.2) -> tuple[int, np.ndarray]:
    t = np.linspace(0, seconds, int(sr * seconds), endpoint=False)
    return sr, (amp * np.sin(2 * np.pi * freq * t)).astype(np.float32)


def test_silence_is_idle() -> None:
    sr = 16000
    audio = (sr, np.zeros(sr // 2, dtype=np.float32))
    scores = classify_audio(audio)
    assert set(scores) == set(TOOL_LABELS)
    assert scores["idle"] == max(scores.values())


def test_high_freq_prefers_router_or_sander() -> None:
    scores = classify_audio(_tone(4000, amp=0.3))
    assert scores["router"] > scores["dust_collector"]
    assert scores["sander"] > scores["idle"]


def test_scores_sum_to_one() -> None:
    scores = classify_audio(_tone(300, amp=0.25))
    assert abs(sum(scores.values()) - 1.0) < 1e-3
