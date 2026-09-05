# Bring-up checklist

Print this or keep it open. Do not skip phases to “save time”—that is how evenings disappear into power/brown-out ghosts.

## Phase 0 — Mindset

- [ ] Read [getting-started.md](getting-started.md) safety section
- [ ] Accept that **control is on the ESP32**; hubs are optional
- [ ] Dust collector motor stays unplugged until Phase 5

## Phase 1 — Parts on the bench

- [ ] All [shopping-list.md](shopping-list.md) **minimum path** items present
- [ ] USB cable confirmed data-capable (board shows up as a serial device)
- [ ] 5 V ≥2 A supply available for the servo

## Phase 2 — Flash only

Follow [flashing.md](flashing.md).

- [ ] `secrets.yaml` created (not committed)
- [ ] Firmware installed via web.esphome.io or `esphome run`
- [ ] Board joins 2.4 GHz Wi‑Fi
- [ ] Web UI opens (`http://dust-collector.local` or IP)
- [ ] Toggling **Dust Collector Relay** in the UI does not crash the board

**Exit:** Web UI is boringly reliable on USB power alone.

## Phase 3 — Breadboard LV (no CT, no mains)

Follow [breadboard.md](breadboard.md) Phase B.

- [ ] Common GND between ESP and 5 V adapter
- [ ] Servo on GPIO18 moves 0% ↔ 100% via **Blast Gate 1 Open Percent**
- [ ] ESP does **not** reboot when the servo stalls against a finger
- [ ] LED (or SSR DC LED) tracks **Dust Collector Relay** / GPIO26
- [ ] Optional: temporary bring-up button works if you enabled the commented block in YAML

**Exit:** Manual UI control of gate + “relay” LED is reliable for 10+ toggles.

## Phase 4 — CT clamp on a benign load

Follow [breadboard.md](breadboard.md) Phase C.

- [ ] CT on **one hot** conductor (not the whole cord)
- [ ] Burden + bias (or breakout module) wired to GPIO34
- [ ] **Tool Current Proxy** changes clearly between idle and load
- [ ] `tool_on_threshold` calibrated; **Tool CT Clamp** is stable
- [ ] Full sequence: tool on → gate opens → relay LED on → tool off → purge → off → gate closes
- [ ] Five successful cycles; no false triggers for 5 minutes idle

**Exit:** You trust CT more than the web UI for start/stop.

## Phase 5 — SSR with a desk lamp (mains)

- [ ] LV breadboard physically separated from AC wires
- [ ] SSR heat sink attached
- [ ] AC side wired to a **lamp** only (not the collector)
- [ ] E‑stop or switched power strip in series with the lamp circuit
- [ ] CT or UI turns lamp on/off with correct purge timing
- [ ] After unplugging ESP USB, behavior still works on board 5 V/USB power as you intend for the shop

**Exit:** Lamp automation is dull. Then schedule collector wiring deliberately.

## Phase 6 — Dust collector

- [ ] SSR/contactor rated for motor inrush (or electrician-installed contactor)
- [ ] Enclosure: LV vs mains barriers
- [ ] Independent emergency off tested
- [ ] First live test: stand clear; one short cycle
- [ ] Verify blast gate mechanically before trusting unattended use
- [ ] Monitor for SSR heat on long cuts

**Exit:** A normal shop session uses auto-start without touching a phone.

## Phase 7 — Optional experiments

- [ ] [HF audio prototype](../hf-prototype/README.md) via `npm run dev:hf` (no hub)
- [ ] Airflow / ΔP sensor when ready
- [ ] [optional-integrations.md](optional-integrations.md) only after Phase 6 is trusted

## When something fails

1. Return to the last phase that passed.  
2. Check power and common GND before changing firmware.  
3. Capture ESPHome logs while reproducing once.  
4. Avoid “fixing” CT, servo, and mains in the same hour.

## Definition of success (for you and other first-timers)

Someone with hardware/software experience but **no prior ESP32 shop project** can go from sealed bags to “tool starts collector” using only docs under `smart-dust-collector/docs/`, without installing Home Assistant, and without guessing pin numbers or power topology.
