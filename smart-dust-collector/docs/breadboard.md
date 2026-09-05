# Breadboard guide

Build and test in **stages**. Do not wire mains into the SSR until Phase B is reliable and you have read [bring-up.md](bring-up.md) Phase 5.

Pin numbers below match the stock firmware substitutions:

| Function | ESP32 GPIO | DevKit label (typical) |
| -------- | ---------- | ---------------------- |
| Servo signal | **18** | D18 |
| SSR / relay drive | **26** | D26 |
| CT ADC | **34** | D34 (input only) |
| Airflow ADC (optional later) | **35** | D35 (input only) |
| 3.3 V | **3V3** | |
| Ground | **GND** | Use one common ground rail |

GPIO **34** and **35** cannot be used as outputs. Do not move the servo or SSR onto those pins.

## Power rules (non-negotiable)

```text
USB (computer) ──► ESP32 only (logic)
5 V adapter ≥2 A ──► servo + (and later) any 5 V modules
GND (adapter) ──► GND (ESP32)   ← common ground
```

Never power the MG996R from the ESP32’s `5V` pin or from USB alone. A stalling servo will brown out the MCU and produce “random” resets that look like firmware bugs.

---

## Phase A — Prove the MCU (no sensors)

**Already done if** [flashing.md](flashing.md) succeeded and the web UI toggles `Dust Collector Relay`.

---

## Phase B — Button, LED “collector,” servo gate

Simulate a tool with a **button**. Simulate the collector with an **LED**. Move a real **servo**.

### Parts for Phase B

- ESP32 (flashed)
- 5 V ≥2 A supply
- Button
- LED + 220 Ω
- NPN (2N2222) + 1 kΩ **or** logic MOSFET + 100–220 Ω gate resistor
- MG996R servo
- 10–100 µF capacitor across 5 V / GND near the servo

### Schematic (Phase B)

```text
                    5V adapter
                       │
           ┌───────────┼────────────┐
           │           │            │
           │         servo+       LED+ (via 220Ω)
           │           │            │
         ESP32       servo signal   │
         3V3/GND/USB   ◄── GPIO18   │
           │                        │
           │     GPIO26 ──[1k]── NPN base
           │                   C collector ── LED−
           │                   E emitter ── GND
           │
           │     GPIO (any free, see note) optional
           │
          GND ─────────────────────────────── adapter GND


Button (tool simulation for early bring-up):
  3V3 ── button ── GPIO23   +  10k from GPIO23 to GND  (active high when pressed)

```

**Firmware note:** Stock YAML expects “tool on” from the **CT ADC**, not a button. For Phase B you have two choices:

1. **Preferred for learning:** Use the web UI manually — set **Blast Gate 1 Open Percent** to 100, turn **Dust Collector Relay** on/off, confirm servo + LED. Then proceed to CT.  
2. **Optional hack:** Uncomment the **Bring-up Tool Button** block at the bottom of `firmware/esphome/dust-collector.yaml` (GPIO23 + pulldown). Disable it before you enclose the shop install.

### Breadboard layout (conceptual)

```text
  [5V rail] =====+=====+========+========
                 |     |        |
               servo  LED+    100µF+
                 |     |        |
              GPIO18  (to transistor)  |
                 |     |        |
  [GND rail] ====+=====+========+========
                 |
               ESP GND + adapter GND

  ESP 3V3 ---- button ---- GPIO23
                     |
                    10k
                     |
                    GND
```

### Servo wiring

| Servo wire (typical) | Connect |
| -------------------- | ------- |
| Brown/black | GND |
| Red | 5 V adapter |
| Orange/yellow | GPIO18 |

Calibrate open/closed ends later with `number.blast_gate_1_open_percent` (0 vs 100). If the horn fights the gate, reverse 0/100 mapping in YAML (`level` lambda) or mechanically reverse the horn.

### LED / transistor wiring

| Piece | Connect |
| ----- | ------- |
| LED anode | 5 V via 220 Ω **or** 3.3 V via 220 Ω if LED is MCU-powered |
| LED cathode | NPN collector |
| NPN emitter | GND |
| NPN base | GPIO26 via 1 kΩ |

If the SSR’s DC input LED is what you will drive later, you can skip this LED and use the SSR input as the indicator **only when the AC side is still unwired**.

### Phase B checks

| Step | Expect |
| ---- | ------ |
| Web UI: gate 0% → 100% | Servo moves smoothly; ESP does not reboot |
| Web UI: relay on/off | LED tracks GPIO26 |
| Wiggle 5 V cable | No random resets (tighten power) |

**Done when:** servo and LED behave from the web UI without brown-outs.

---

## Phase C — CT clamp (real tool sensing)

### What you are building

The CT outputs a **small AC** current proportional to the tool’s AC load. A **burden resistor** turns that into a voltage. A **bias divider** lifts that AC to mid‑rail so the ESP32 ADC (0–3.3 V only) is never driven negative.

### Discrete circuit (SCT‑013 + jack)

```text
  3V3 ── 10k ──●── 10k ── GND
               │
               │  bias ≈ 1.65 V
               │
               ●─────────────── GPIO34
               │
              100nF
               │
              GND

  CT jack tip ────●──── burden Rb ────●──── CT jack sleeve
                  │                   │
                  └──── to bias node ●┘
```

Exact jack tip/sleeve vs tip/ring depends on the breakout—**verify with continuity** against the SCT cable. Burden **Rb** must match your CT datasheet (often ~62 Ω for SCT‑013‑030 “1 V” types). Wrong Rb = always-on or never-on tool detection.

Module shortcut: `VCC`→3V3, `GND`→GND, `OUT`→GPIO34.

### CT placement on the tool

```text
          Tool cord
    Hot ●───/\/\/───● Tool
            ▲
            │ CT window around HOT only
 Neutral ───────────●
```

- Clamp **one** insulated hot conductor (open a pigtail box or use a short extension lead with separated conductors).  
- Do **not** clamp the whole round cord (hot+neutral cancel → ~0 A).  
- Start with a **desk lamp / shop vac / router** you can switch safely—not the dust collector itself.

### Firmware calibration

1. Open web UI logs or the `Tool Current Proxy` sensor.  
2. Note idle value (tool off) vs running.  
3. Adjust `calibrate_linear` and `tool_on_threshold` in `dust-collector.yaml` until `Tool CT Clamp` is firmly off when idle and on when the tool runs (with `delayed_on` / `delayed_off` filtering chatter).  
4. Reflash after edits.

### Phase C checks

| Step | Expect |
| ---- | ------ |
| Tool off 10 s | `Tool CT Clamp` stays **off** |
| Tool on | Becomes **on** within ~0.5 s |
| Gate + LED/SSR drive | Follow CT automatically (stock YAML) |
| Tool off | After `purge_seconds`, relay off, gate closes |

**Done when:** a real tool triggers the sequence five times in a row without false triggers from nearby motors.

---

## Phase D — SSR (still no dust collector)

Wire only the **DC control** side first; leave AC screws empty and covered.

| SSR terminal | Connect |
| ------------ | ------- |
| DC+ | 3.3 V **or** 5 V (see module marking; many accept 3–32 VDC) through your transistor if needed |
| DC− | GND |
| Or small SSR modules with a single “IN” pin | Follow that module’s 3.3 V logic diagram |

Many SSR‑40DA units switch from a direct 3.3 V GPIO, but a transistor buffer is safer for GPIO current.

**AC side (desk lamp test only):**

```text
Wall hot ──► SSR AC1
SSR AC2 ──► Lamp hot
Lamp neutral ──► Wall neutral
```

Use a lamp ≤ the SSR rating (trivial). Use strain relief. Keep mains wires away from the breadboard 3.3 V section—**separate physical zones**.

**Done when:** CT or web UI turns the lamp on/off with purge timing correct.

---

## Phase E — Dust collector (electrician / experienced only)

Replace the lamp with the collector **only after** Phase D is boringly reliable. Add:

- Heat-sinked SSR or a proper contactor sized for **locked-rotor** current  
- Enclosure separating LV and mains  
- Series **E‑stop** or breaker that cuts collector power regardless of the ESP  

Details and warnings: [wiring.md](wiring.md), [bring-up.md](bring-up.md).

---

## Troubleshooting

| Symptom | Likely cause |
| ------- | ------------ |
| ESP reboots when servo moves | Servo sharing USB power; missing common GND; weak 5 V adapter |
| Servo jitters | Need thicker 5 V wires; add bulk capacitor; detach timeout in YAML |
| CT always on | Burden/bias wrong; clamp on whole cord; threshold too low |
| CT never on | Wrong conductor; Rb too large; ADC pin not 34; tool draws little current |
| SSR on but motor never starts | AC wiring; SSR failed open; E‑stop open; control voltage too low |
| False triggers from other tools | Move CT; raise threshold; lengthen `delayed_on` |

Next: [Bring-up checklist](bring-up.md).
