# Smart Dust Collector

Fork-local project for instrumenting the MK2 centrifugal separator. Everything for this effort lives **under this folder** so upstream CAD/print files stay untouched and `git pull` from the parent repo stays clean.

**Host language: TypeScript** (control FSM, tests, HF audio UI). Firmware on the ESP32 stays **ESPHome YAML** (C++ under the hood) — no Python toolchain required.

| Path | Purpose |
| ---- | ------- |
| [`docs/`](docs/) | Plan, architecture, BOM, wiring, Home Assistant |
| [`firmware/`](firmware/) | ESP32 / ESPHome scaffold |
| [`control/`](control/) | TypeScript control state machine |
| [`hf-prototype/`](hf-prototype/) | Vite + TS audio → tool-class prototype |
| [`tests/`](tests/) | Vitest coverage for FSM + classifier |

Upstream print files (MK2*, BT-100 jig, T-Loc Parts) are siblings of this directory — do not modify them for smart-collector work.

## Goals

1. **Auto-start** — detect an active tool and turn the dust collector on (with a short post-run purge).
2. **Directed suction** — open the matching blast gate; keep unused branches closed.
3. **Airflow health** — use the BT-100 anemometer jig (plus optional ΔP) to flag clogs and leaks.
4. **Ambient air** — optional PM2.5 / PM10 for shop air and “run until clear”.
5. **Local-first** — ESPHome + MQTT / Home Assistant; no cloud required for control.

## Architecture (summary)

```text
  Tools (CT clamp / smart plug / audio)
            │
            ▼
     ┌──────────────┐     MQTT / API      ┌─────────────────┐
     │  ESP32 node  │◄───────────────────►│  Home Assistant  │
     │  (ESPHome)   │                     │  automations     │
     └──────┬───────┘                     └─────────────────┘
            │
   ┌────────┼────────┬────────────┐
   ▼        ▼        ▼            ▼
 Relay    Servos   Airflow      PM sensor
 (DC)   (gates)  (anemometer /   (optional)
                  ΔP)
```

Details: [`docs/architecture.md`](docs/architecture.md).

## Quick start (host tools)

```bash
cd smart-dust-collector
npm install
npm test
npm run dev:hf    # audio prototype at http://localhost:5173
```

## Phased plan

| Phase | Deliverable | Status |
| ----- | ----------- | ------ |
| 0 | Plan, BOM, wiring notes | Docs in this folder |
| 1 | ESPHome: relay + 1 gate + CT + HA entities | Firmware scaffold |
| 2 | Airflow telemetry (BT-100 / ΔP) | Planned |
| 3 | Multi-gate + tool map + purge timers | Planned |
| 4 | HF audio prototype → optional edge assist | TS / Vite scaffold |
| 5 | Filter-clog heuristics + HA dashboard | Planned |

## Safety

Mains switching for a dust collector is hazardous. Use a properly rated SSR or contactor, isolate low-voltage wiring from mains, and have an electrician review permanent installs. See [`docs/wiring.md`](docs/wiring.md).

## Upstream pulls

Keep all smart-collector changes inside `smart-dust-collector/`. That way merging or rebasing upstream CAD updates should not conflict with this work.
