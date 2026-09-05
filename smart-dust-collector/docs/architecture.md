# Architecture

## Nodes

| Node | Role | Notes |
| ---- | ---- | ----- |
| `dust-controller` | ESP32 running ESPHome | Relay, gates, sensors, MQTT |
| Home Assistant | Automations + UI | Optional; ESPHome native API also works |
| HF prototype (optional) | Workshop audio → tool class | Prototype only; not in the control path yet |

## Sensing

| Signal | Hardware | Use |
| ------ | -------- | --- |
| Tool on | CT clamp (YHDC SCT-013) or smart plug binary sensor | Start collector + open gate |
| Airflow | BT-100 anemometer in the upstream jig and/or Sensirion SDP810 ΔP | Clog / leak detection |
| Particulate | PMS5003 or SDS011 (UART) | Ambient air + purge-until-clear |
| Gate position | Servo angle + optional limit switches | Confirm open/closed |

## Actuation

| Actuator | Default | Notes |
| -------- | ------- | ----- |
| Collector power | SSR-40DA (or contactor) on `GPIO26` | Opto-isolated; size for motor inrush |
| Blast gate 1..N | MG996R / similar on `GPIO18`, `GPIO19`, … | One servo per branch |
| Status LED | Onboard or WS2812 | Optional visual state |

## Control state machine

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

Reference implementation (host-testable): [`../firmware/src/state_machine.py`](../firmware/src/state_machine.py).

## ESPHome entities (scaffold)

From [`../firmware/esphome/dust-collector.yaml`](../firmware/esphome/dust-collector.yaml):

- `switch.dust_collector_relay`
- `number.blast_gate_1_open_percent` (0–100% → servo)
- `binary_sensor.tool_ct_clamp`
- `sensor.airflow_proxy` (ADC / ΔP placeholder)
- `sensor.pm_2_5` / `sensor.pm_10` (optional, commented)
- `text_sensor.collector_state`

## MQTT topics (optional)

Base prefix: `workshop/dust/`

| Topic | Payload |
| ----- | ------- |
| `workshop/dust/state` | JSON `{state, gate1, airflow, tool}` |
| `workshop/dust/cmd/relay` | `ON` / `OFF` |
| `workshop/dust/cmd/gate/1` | `0`–`100` |

Prefer the native ESPHome API when using Home Assistant.

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
