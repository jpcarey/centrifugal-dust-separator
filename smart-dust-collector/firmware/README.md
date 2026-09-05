# Firmware — Smart Dust Collector

ESPHome configuration for the workshop dust-controller node. Companion docs: [`../docs/`](../docs/).

Control sequencing reference (TypeScript, host-tested): [`../control/`](../control/).

## Layout

| Path | Purpose |
| ---- | ------- |
| [`esphome/dust-collector.yaml`](esphome/dust-collector.yaml) | Main ESPHome device config |
| [`esphome/secrets.yaml.example`](esphome/secrets.yaml.example) | Copy → `secrets.yaml` (do not commit secrets) |

## Flash

```bash
cd smart-dust-collector/firmware
cp esphome/secrets.yaml.example esphome/secrets.yaml
# edit Wi-Fi + API keys

esphome run esphome/dust-collector.yaml
# or use https://web.esphome.io / Home Assistant ESPHome add-on
```

## Scaffold capabilities

- Wi-Fi + ESPHome API (optional MQTT)
- Collector SSR/relay switch
- Blast gate 1 as 0–100% number → servo
- CT-clamp ADC → binary “tool on”
- Placeholder ADC airflow proxy
- Text sensor for coarse state: `IDLE` / `COLLECTOR_ON` / `PURGE`

Multi-step sequencing beyond this YAML should live in Home Assistant (or later on-device using the TS FSM as the spec) until Phase 3. See [`../docs/home-assistant.md`](../docs/home-assistant.md).

## Tests (control FSM)

```bash
cd smart-dust-collector
npm install
npm test
```
