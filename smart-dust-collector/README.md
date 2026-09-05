# Smart Dust Collector

Fork-local project for instrumenting the MK2 centrifugal separator. Everything for this effort lives **under this folder** so upstream CAD/print files stay untouched and `git pull` from the parent repo stays clean.

**Host language: TypeScript** (control FSM, tests, HF audio UI). Firmware on the ESP32 stays **ESPHome YAML** (C++ under the hood) — no Python toolchain required.

| Path | Purpose |
| ---- | ------- |
| [`docs/`](docs/) | Plan, architecture, BOM, wiring, optional home integrations |
| [`firmware/`](firmware/) | ESP32 / ESPHome scaffold (**on-device control**) |
| [`control/`](control/) | TypeScript control state machine (spec / tests) |
| [`hf-prototype/`](hf-prototype/) | Vite + TS audio → tool-class experiment |
| [`tests/`](tests/) | Vitest coverage for FSM + classifier |

Upstream print files (MK2*, BT-100 jig, T-Loc Parts) are siblings of this directory — do not modify them for smart-collector work.

## Reliability first

**Shop control runs on the ESP32.** A CT clamp (or similar) sees the tool, the ESP opens the gate and energizes the collector relay, then purges and shuts down — all in firmware. That path does **not** need Home Assistant, MQTT, Apple Home, Homebridge, or the HF audio experiment.

If Wi-Fi or any phone/hub app is down, the collector should still auto-start when you run a tool.

Optional home integrations are for status / remote override only. The HF audio prototype is a separate experiment (browser / static site), not on the critical path.

## Goals

1. **Auto-start on-device** — detect an active tool and turn the dust collector on (with a short post-run purge).
2. **Directed suction** — open the matching blast gate; keep unused branches closed.
3. **Airflow health** — use the BT-100 anemometer jig (plus optional ΔP) to flag clogs and leaks.
4. **Ambient air** — optional PM2.5 / PM10 for shop air and “run until clear”.
5. **No cloud required** — control stays local to the ESP32.

## Architecture (summary)

```text
  Tool current (CT clamp)
            │
            ▼
     ┌──────────────┐
     │  ESP32 node  │  ← all start / gate / purge / stop logic lives here
     │  (ESPHome)   │
     └──────┬───────┘
            │
   ┌────────┼────────┬────────────┐
   ▼        ▼        ▼            ▼
 Relay    Servos   Airflow      PM sensor
 (DC)   (gates)  (anemometer /   (optional)
                  ΔP)

  Optional (not required for woodworking):
    Wi-Fi status page / Homebridge / Apple Home  ← remote glance / override
    HF audio prototype (browser)               ← experiment only
```

Details: [`docs/architecture.md`](docs/architecture.md).  
Optional hubs: [`docs/optional-integrations.md`](docs/optional-integrations.md).

## Quick start (host tools)

```bash
cd smart-dust-collector
npm install
npm test
npm run dev:hf    # audio experiment at http://localhost:5173 (no Home Assistant)
```

## Phased plan

| Phase | Deliverable | Status |
| ----- | ----------- | ------ |
| 0 | Plan, BOM, wiring notes | Docs in this folder |
| 1 | ESPHome: on-device relay + 1 gate + CT + purge | Firmware scaffold |
| 2 | Airflow telemetry (BT-100 / ΔP) on-device | Planned |
| 3 | Multi-gate + tool map (still on ESP) | Planned |
| 4 | HF audio experiment (browser; optional) | TS / Vite scaffold |
| 5 | Optional Homebridge / Apple Home status | Planned if useful |

## Safety

Mains switching for a dust collector is hazardous. Use a properly rated SSR or contactor, isolate low-voltage wiring from mains, and have an electrician review permanent installs. See [`docs/wiring.md`](docs/wiring.md).

## Upstream pulls

Keep all smart-collector changes inside `smart-dust-collector/`. That way merging or rebasing upstream CAD updates should not conflict with this work.
