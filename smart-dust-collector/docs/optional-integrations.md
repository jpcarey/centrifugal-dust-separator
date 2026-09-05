# Optional home integrations

**You do not need any of this for the dust collector to auto-start.**

On-device ESPHome logic (CT clamp → gate → relay → purge) is the primary path. Use the options below only if you want phone status or a manual override in Apple Home / another hub.

## What is MQTT?

MQTT is a lightweight publish/subscribe message bus (“tool is on”, “turn relay off”). Some hubs use it to talk to devices. This project’s MQTT block is **commented out** and unused by default. Prefer on-device automations; skip MQTT unless you already know you want it.

## Local status without a hub

The firmware scaffold enables ESPHome’s `web_server` on port 80. After the ESP joins Wi-Fi, open `http://dust-collector.local` (or its IP) for state and manual controls. If Wi-Fi is down, woodworking control still works from the CT clamp.

## Apple Home + Homebridge

You already run Homebridge — that can be enough if you want a Home app tile later:

1. Keep **all auto-start logic on the ESP32** (already in the YAML).
2. Optionally expose a **manual** collector switch / sensor to HomeKit via a Homebridge plugin that speaks to ESPHome or a dumb smart plug used only as a status/override — not as the sole start signal.
3. Do **not** put “tool on → start collector” solely in Homebridge scenes; when Homebridge is restarting you still want the ESP to react to the CT clamp.

Exact Homebridge plugin choice can wait until the hardware path is proven. Reliability comes from firmware first.

## Home Assistant

Not required. The old examples in this repo’s history assumed HA for automations; that duplicated what the ESP already does and created the exact failure mode you want to avoid (hub offline → no dust collection).

If you ever run HA anyway, treat it as a dashboard / notifier only. Do not move start/stop ownership off the ESP.

## HF audio classifier experiment

No hub needed:

```bash
cd smart-dust-collector
npm install
npm run dev:hf
```

Or build static files with `npm run build:hf` and open `hf-prototype/dist/`. This is for exploring “can audio detect a tool?” — separate from shop control. Any future link to the ESP should be additive and fail soft (CT clamp remains authoritative).
