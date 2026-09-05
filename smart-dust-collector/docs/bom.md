# Bill of materials

Quantities assume one collector and one active branch to start.

For first-time buyers (tools, substitutions, CT burden notes), use the longer **[shopping-list.md](shopping-list.md)**.

## Electronics

| Item | Qty | Example | Notes |
| ---- | --: | ------- | ----- |
| ESP32 DevKit | 1 | ESP32-WROOM-32 | Wi-Fi; 3.3 V logic |
| SSR or contactor | 1 | SSR-40DA + heat sink | Match collector voltage/current + inrush |
| Servo (blast gate) | 1+ | MG996R metal gear | One per gate |
| CT clamp | 1+ | YHDC SCT-013-030 | Burden resistor required |
| ΔP sensor (optional) | 1 | Sensirion SDP810-500Pa | Filter / duct ΔP |
| PM sensor (optional) | 1 | PMS5003 | Ambient particulate |
| 5 V supply (servos) | 1 | 5 V 3 A+ | Do **not** power servos from ESP USB |
| Isolation | as needed | Optocoupler / SSR module | Keep mains away from ESP |

## Mechanical (from upstream folders)

| Item | Location in repo |
| ---- | ---------------- |
| MK2 / MK2_EU / MK2_UK separator | `../MK2*`, `../README.md` |
| BT-100 anemometer jig | `../BT-100 Anemometer Jig/` |
| Blast gate bodies | Phase 2 CAD (not in this scaffold) |
| Festool VAB-20/1 bin | As in upstream MK2 docs |

## Software

| Item | Notes |
| ---- | ----- |
| ESPHome 2024.x+ | [web.esphome.io](https://web.esphome.io/) — no hub required |
| Home hub (HA / Homebridge) | Optional — status only; not required for control |
| Hugging Face Space | [`../hf-prototype/`](../hf-prototype/) |

## Rough budget (USD, hobby scale)

| Tier | Estimate | Includes |
| ---- | -------: | -------- |
| Minimum (relay + 1 gate + CT) | ~$40–80 | ESP32, SSR, servo, CT, PSU |
| + airflow / ΔP | +$30–60 | SDP810 or spot-check with BT-100 |
| + PM sensor | +$15–30 | PMS5003 |
