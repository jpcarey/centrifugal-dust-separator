# Firmware — Smart Dust Collector

ESPHome config for the workshop dust-controller node. Companion docs: [`../docs/`](../docs/).

**Critical path is on-device:** CT clamp → open gate → collector relay → purge → close gate. That logic is in this YAML and runs on the ESP32 with no hub required.

TypeScript FSM (spec / tests): [`../control/`](../control/).

## Layout

| Path | Purpose |
| ---- | ------- |
| [`esphome/dust-collector.yaml`](esphome/dust-collector.yaml) | Main ESPHome device config |
| [`esphome/secrets.yaml.example`](esphome/secrets.yaml.example) | Copy → `secrets.yaml` (do not commit secrets) |

## Flash

Full first-time instructions: [`../docs/flashing.md`](../docs/flashing.md)  
Breadboard wiring: [`../docs/breadboard.md`](../docs/breadboard.md)

```bash
cd smart-dust-collector/firmware
cp esphome/secrets.yaml.example esphome/secrets.yaml
# edit Wi-Fi (+ API key for OTA / status)

esphome run esphome/dust-collector.yaml
# or https://web.esphome.io
```

After Wi-Fi joins, open `http://dust-collector.local` (web server) for status. If Wi-Fi is down, CT-driven control still works.

## What the scaffold does on the ESP

- CT ADC → binary “tool on”
- Tool on → open blast gate 1 → turn relay on
- Tool off → purge delay → relay off → close gate
- Placeholder airflow ADC
- Local web UI (no Home Assistant / MQTT required)
- Optional ESPHome native API (for OTA / later Homebridge) — not used for start/stop ownership

MQTT stays commented out. Optional phone hubs: [`../docs/optional-integrations.md`](../docs/optional-integrations.md).

## Tests (control FSM)

```bash
cd smart-dust-collector
npm install
npm test
```
