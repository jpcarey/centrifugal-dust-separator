# Architecture

## Design rule

**Control is on the ESP32.** Tool detection → blast gate → collector relay → purge must work with no phone, hub, or cloud online. Wi-Fi is for flashing, status, and optional remote override — not for the woodworking critical path.

Home Assistant, MQTT, Apple Home, and Homebridge are **optional**. The Hugging Face / Vite audio classifier is a **separate experiment** and is not required for the collector to run.

## Nodes

| Node | Role | Required? |
| ---- | ---- | --------- |
| `dust-controller` (ESP32 / ESPHome) | Sense tool, drive gates + relay, purge, faults | **Yes** |
| Browser status (`web_server`) | Glance at state on the LAN | Optional |
| Homebridge / Apple Home | Remote status or manual switch | Optional |
| Home Assistant / MQTT | Same as above if you already run them | Optional — **not assumed** |
| HF audio prototype | Offline experiment for tool-from-audio | Optional experiment |

## Sensing

| Signal | Hardware | Use |
| ------ | -------- | --- |
| Tool on | CT clamp (YHDC SCT-013) on the tool circuit | Start collector + open gate **on the ESP** |
| Airflow | BT-100 anemometer jig and/or Sensirion SDP810 ΔP | Clog / leak detection |
| Particulate | PMS5003 or SDS011 (UART) | Ambient air + purge-until-clear |
| Gate position | Servo angle + optional limit switches | Confirm open/closed |

Audio classification is **not** on the critical path. If you later want it, treat it as an assist that still must fail open to CT-clamp control.

## Actuation

| Actuator | Default | Notes |
| -------- | ------- | ----- |
| Collector power | SSR-40DA (or contactor) on `GPIO26` | Opto-isolated; size for motor inrush |
| Blast gate 1..N | MG996R / similar on `GPIO18`, `GPIO19`, … | One servo per branch |
| Status LED | Onboard or WS2812 | Optional visual state |

## Control state machine (on-device)

```text
IDLE ──(tool_on)──► GATE_OPENING ──► COLLECTOR_ON ──(tool_off)──► PURGE ──► GATE_CLOSING ──► IDLE
                      │                    │
                      └──(fault)───────────┴──► FAULT (collector off, gate safe)
```

| State | Behavior |
| ----- | -------- |
| `IDLE` | Collector off, gates closed |
| `GATE_OPENING` | Open mapped gate; wait confirm / timeout |
| `COLLECTOR_ON` | Energize relay; watch airflow |
| `PURGE` | Keep running `purge_seconds` (default 15) after tool stops |
| `GATE_CLOSING` | Close gate after purge |
| `FAULT` | Low airflow while commanded on, or gate timeout → safe off |

The ESPHome scaffold already wires CT clamp → open gate → relay on, and tool-off → purge → relay off → gate close **in firmware**. See [`../firmware/esphome/dust-collector.yaml`](../firmware/esphome/dust-collector.yaml).

Host-testable TypeScript spec: [`../control/src/stateMachine.ts`](../control/src/stateMachine.ts).

## ESPHome entities (scaffold)

- `switch.dust_collector_relay`
- `number.blast_gate_1_open_percent` (0–100% → servo)
- `binary_sensor.tool_ct_clamp`
- `sensor.airflow_proxy` (ADC / ΔP placeholder)
- `sensor.pm_2_5` / `sensor.pm_10` (optional, commented)
- `text_sensor.collector_state`
- Built-in `web_server` on port 80 for LAN status without a hub

## Optional MQTT topics

Only if you enable the commented `mqtt:` block. Not required for control.

Base prefix: `workshop/dust/`

| Topic | Payload |
| ----- | ------- |
| `workshop/dust/state` | JSON `{state, gate1, airflow, tool}` |
| `workshop/dust/cmd/relay` | `ON` / `OFF` |
| `workshop/dust/cmd/gate/1` | `0`–`100` |

## Pin map (ESP32 DevKit defaults)

| Function | GPIO | Notes |
| -------- | ---- | ----- |
| I²C SDA (ΔP) | 21 | SDP810 optional |
| I²C SCL (ΔP) | 22 | |
| SSR / relay | 26 | Active high in scaffold |
| Gate 1 servo | 18 | 50 Hz PWM |
| Gate 2 servo | 19 | Reserved |
| CT clamp ADC | 34 | Input-only; calibrate in YAML |
| PMS UART RX | 16 | Optional |
| PMS UART TX | 17 | Optional |
| Status LED | 2 | Onboard on many DevKits |

Override via substitutions; keep secrets out of git.

## HF audio experiment

Lives under [`../hf-prototype/`](../hf-prototype/). Run with `npm run dev:hf` or deploy the static build. It does not talk to the ESP32 in this scaffold and does not need Home Assistant.
