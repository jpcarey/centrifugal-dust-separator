# Shopping list & tools

Buy for a **breadboard prototype** first (Phases 2–4). Do not skip the low-voltage bring-up and jump straight to the dust collector.

Exact Amazon/AliExpress SKUs change; match the **spec column**, not a brand name.

## Tools (once)

| Tool | Why |
| ---- | --- |
| Computer with USB‑A or USB‑C | Flashing |
| **Data-capable** USB cable for the DevKit | Charge-only cables fail mysteriously |
| Solderless breadboard (830-point) | Prototyping |
| Jumper wires (M‑M, M‑F) | Breadboard ↔ modules |
| Multimeter | Continuity, 5 V rail, CT burden checks |
| Small flat screwdriver | Terminal blocks / SSR screws |
| Wire stripper / flush cutters | |
| Optional: adjustable bench PSU | Nice for 5 V servo rail |
| Optional: helping hands / third hand | |

## Electronics — minimum path (Phases 2–4)

| Item | Qty | Spec to match | Notes |
| ---- | --: | ------------- | ----- |
| ESP32 DevKit | 1 | ESP32‑WROOM‑32 DevKit **V1** (30‑pin) or similar “ESP32 DevKitC” | 3.3 V logic. Avoid ESP8266. |
| Breadboard + jumpers | 1 set | | |
| Micro/USB‑C cable | 1 | **Data** + power | Match your board’s connector |
| 5 V DC supply | 1 | **≥2 A** (3 A better) with bare wires or barrel + adapter | **Servos only** — not from ESP USB |
| MG996R or MG995 servo | 1 | Metal gear, 4.8–6 V | One blast gate |
| LED + 220 Ω resistor | 1 each | Any color LED | Stand‑in for “collector on” |
| Tactile button | 1 | Momentary NO | Stand‑in for “tool on” before CT works |
| NPN transistor **or** logic MOSFET | 1 | e.g. 2N2222 / 2N7000 / IRLZ44 (logic-level) | Drive LED or SSR input cleanly from 3.3 V |
| Base/gate resistor | 1 | 1 kΩ (NPN) or 100–220 Ω (MOSFET gate) | |
| SSR‑40DA (or 25DA) | 1 | **DC control, AC load**, 3–32 VDC input | Plus matching heat sink |
| CT clamp | 1 | **YHDC SCT‑013‑030** (or ‑020) with 3.5 mm plug | Non‑invasive current sense |
| 3.5 mm jack breakout | 1 | Stereo/TRS jack to screw terminals or pins | Makes CT breadboard-friendly |
| Burden resistor | 1 | See [CT section](#ct-clamp-parts) | Often **not** included |
| 2× 10 kΩ resistors | 2 | 1/4 W | ADC bias divider |
| 10–100 µF electrolytic | 1 | ≥10 V | Decouple 5 V servo rail near servo |
| 0.1 µF ceramic | 2 | | Bypass near ESP 3V3 and bias node |

### CT clamp parts

SCT‑013‑xxx secondary needs a **burden resistor**. For SCT‑013‑030 (30 A → 1 V variants are common—**read your seller’s datasheet**):

- Many “1 V output” SCT‑013‑030 units expect about **62 Ω** burden (check the sheet; some are 33 Ω / 100 Ω).
- You will also build a **mid‑rail bias** so the ESP32 ADC (0–3.3 V only) sees an AC waveform centered near 1.65 V. Full circuit: [breadboard.md](breadboard.md#phase-c-ct-clamp).

**Easier alternative:** buy a small “SCT‑013 ESP32 current sensor” module that already includes burden + bias. If you do, skip the discrete burden/bias parts and follow the module’s pin labels (`VCC`, `GND`, `OUT`) in the breadboard guide.

## Electronics — optional later

| Item | When |
| ---- | ---- |
| Sensirion SDP810‑500Pa + tubing | Continuous ΔP / clog detect |
| PMS5003 + 5 V | Ambient PM |
| Extra servos + gates | Multi-tool shop |
| Contactor instead of SSR | Large motors / electrician preference |
| Perfboard / enclosure | After breadboard works |

## Mechanical (this fork)

| Item | Where |
| ---- | ----- |
| MK2 separator prints | Upstream `MK2*` folders (sibling of `smart-dust-collector/`) |
| BT‑100 anemometer jig | Upstream `BT-100 Anemometer Jig/` |
| Blast gate + servo horn mount | Not in scaffold yet — 3D print or adapt a commercial gate |

## Rough cost (USD)

| Bundle | Ballpark |
| ------ | -------: |
| Tools you may already own | $0–40 |
| ESP + breadboard + servo + CT + SSR + PSU | $50–100 |
| Optional ΔP / PM | +$40–80 |

## Substitutions that cause pain

| Avoid | Prefer |
| ----- | ------ |
| ESP8266 “NodeMCU only” tutorials | ESP32 DevKit |
| Powering servo from ESP 5V/USB pin | Dedicated 5 V ≥2 A supply, common GND |
| SSR with **AC** control input | **DC-controlled** SSR (…DA suffix) |
| Clamping the CT on the whole power cord | One hot conductor only |
| Skipping the button/LED stage | Prove logic before mains |

## After the order ships

1. [Flashing ESPHome](flashing.md) — board only, no sensors required  
2. [Breadboard build](breadboard.md) — button, LED, servo, then CT  
3. [Bring-up checklist](bring-up.md) — staged pass/fail  

Also see the shorter [BOM](bom.md) for a compact parts table.
