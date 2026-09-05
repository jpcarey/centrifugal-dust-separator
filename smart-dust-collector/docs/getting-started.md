# Getting started (first-time ESP32 build)

This is the ordered path from an empty workbench to a working **on-device** auto-start dust controller. You do **not** need Home Assistant, MQTT, or Apple Home for any of these steps.

If you have strong software/hardware experience but little ESP32 / breadboard practice, treat this as the checklist—not a scavenger hunt. Each phase has a clear “done when” exit criteria before you spend time on the next.

## How control works (one paragraph)

A **CT clamp** around one hot wire of a tool sees current. The **ESP32** decides “tool on,” opens a **servo blast gate**, then turns on a **SSR/contactor** that powers the dust collector. When the tool stops, the ESP waits a **purge** time, turns the collector off, and closes the gate. All of that runs **on the ESP32**.

## Safety (read before shopping)

- Mains voltage can kill. Until Phase 5, **do not** wire the dust collector. Use USB power, a 5 V wall wart, LEDs, and (later) a **desk lamp** on the SSR.
- The dust collector needs a physical **emergency off** that does not depend on firmware or Wi‑Fi.
- If you are not comfortable with mains wiring, stop before Phase 5 and hire a licensed electrician for the SSR/contactor install. These docs are a build guide, not electrical advice or a code inspection.

## Phases

| Phase | Doc | Done when |
| ----- | --- | --------- |
| 0 | You are here + [architecture](architecture.md) | You understand on-device control and what is optional |
| 1 | [Shopping list](shopping-list.md) | Parts and tools are on the bench |
| 2 | [Flashing ESPHome](flashing.md) | Board boots, joins Wi‑Fi, web UI loads |
| 3 | [Breadboard build](breadboard.md) | Button → servo moves → LED “relay” lights; purge works |
| 4 | Same + CT section in breadboard guide | A real tool/lamp current trips “tool on” reliably |
| 5 | [Bring-up checklist](bring-up.md) Phase 5 | Desk lamp on SSR works; then collector only with E‑stop |
| 6 | Optional | [HF audio experiment](../hf-prototype/README.md), [home integrations](optional-integrations.md) |

## Time boxing (rough)

| Phase | Typical first-time effort |
| ----- | ------------------------ |
| Shopping / wait for parts | One order |
| First flash | Under an hour if the cable is data-capable |
| Breadboard + button/servo/LED | One focused evening |
| CT calibration | One evening (fiddly; leave margin) |
| Mains SSR + collector | Schedule deliberately; do not rush |

## What you will *not* do in Phase 1–4

- Design a custom PCB (breadboard / protoboard is enough to learn)
- Install Home Assistant
- Trust Wi‑Fi for start/stop
- Connect the dust collector motor until the low-voltage path is boringly reliable

## Repo map for builders

| Path | Why you care |
| ---- | ------------ |
| [`firmware/esphome/dust-collector.yaml`](../firmware/esphome/dust-collector.yaml) | The firmware you flash |
| [`firmware/esphome/secrets.yaml.example`](../firmware/esphome/secrets.yaml.example) | Wi‑Fi / passwords template |
| [`control/`](../control/) | Typed state-machine spec (optional reading) |
| [`hf-prototype/`](../hf-prototype/) | Separate audio experiment |

Next: [Shopping list](shopping-list.md).
