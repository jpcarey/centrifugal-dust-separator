# Firmware (ESP32 / ESPHome)

All collector hardware firmware for this fork lives here.

## Layout

| Path | Purpose |
| ---- | ------- |
| [`esphome/dust-collector.yaml`](esphome/dust-collector.yaml) | Main ESPHome device config |
| [`esphome/secrets.yaml.example`](esphome/secrets.yaml.example) | Copy → `secrets.yaml` (do not commit secrets) |
| [`src/state_machine.py`](src/state_machine.py) | Reference control FSM (tested on host; port logic to HA / native later) |
| [`.gitignore`](.gitignore) | Ignore `secrets.yaml` and build artifacts |

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

Multi-step sequencing beyond this YAML should live in Home Assistant until Phase 3 moves it on-device. See [`../docs/home-assistant.md`](../docs/home-assistant.md).

## Tests

```bash
cd smart-dust-collector
python3 -m pytest tests -q
```
