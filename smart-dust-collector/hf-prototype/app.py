"""Gradio UI for the workshop audio classifier (Hugging Face Space entrypoint)."""

from __future__ import annotations

from typing import Any

import gradio as gr

from classifier import TOOL_LABELS, classify_audio


def predict(audio: Any) -> tuple[dict[str, float], str]:
    try:
        scores = classify_audio(audio)
    except Exception as exc:  # noqa: BLE001 — show in UI
        return {}, f"Error: {exc}"
    top = max(scores, key=scores.get)
    summary = f"Top class: **{top}** ({scores[top]:.0%})"
    return scores, summary


def build_demo() -> gr.Blocks:
    with gr.Blocks(title="Smart Dust Collector — Audio Prototype") as blocks:
        gr.Markdown(
            """
            # Smart Dust Collector — tool audio prototype

            Upload or record a short clip from the shop. Scores are a **CPU heuristic
            scaffold** for a future Hugging Face model — not production control logic.

            Labels: """
            + ", ".join(f"`{label}`" for label in TOOL_LABELS)
        )
        with gr.Row():
            audio_in = gr.Audio(
                sources=["upload", "microphone"],
                type="numpy",
                label="Workshop audio",
            )
            with gr.Column():
                label_out = gr.Label(label="Class scores", num_top_classes=8)
                summary = gr.Markdown()
        btn = gr.Button("Classify", variant="primary")
        btn.click(fn=predict, inputs=audio_in, outputs=[label_out, summary])
        audio_in.change(fn=predict, inputs=audio_in, outputs=[label_out, summary])
    return blocks


demo = build_demo()

if __name__ == "__main__":
    demo.launch()
