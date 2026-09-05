# Home Assistant integration

ESPHome’s native API is the simplest path: adopt the device in HA after first flash. MQTT is optional.

## Example automation — tool starts collector

```yaml
automation:
  - id: dust_tool_on
    alias: "Dust collector — tool on"
    trigger:
      - platform: state
        entity_id: binary_sensor.tool_ct_clamp
        to: "on"
    action:
      - service: number.set_value
        target:
          entity_id: number.blast_gate_1_open_percent
        data:
          value: 100
      - delay: "00:00:01"
      - service: switch.turn_on
        target:
          entity_id: switch.dust_collector_relay

  - id: dust_tool_off_purge
    alias: "Dust collector — tool off with purge"
    trigger:
      - platform: state
        entity_id: binary_sensor.tool_ct_clamp
        to: "off"
        for: "00:00:02"
    action:
      - delay: "00:00:15"  # purge
      - service: switch.turn_off
        target:
          entity_id: switch.dust_collector_relay
      - service: number.set_value
        target:
          entity_id: number.blast_gate_1_open_percent
        data:
          value: 0
```

## Airflow fault (placeholder)

```yaml
  - id: dust_low_airflow_fault
    alias: "Dust collector — low airflow while running"
    trigger:
      - platform: numeric_state
        entity_id: sensor.airflow_proxy
        below: 5
        for: "00:00:08"
    condition:
      - condition: state
        entity_id: switch.dust_collector_relay
        state: "on"
    action:
      - service: switch.turn_off
        target:
          entity_id: switch.dust_collector_relay
      - service: notify.persistent_notification
        data:
          message: "Dust collector low airflow — check filter / gates / clog."
```

## Dashboard sketch

- Entities: relay, gate %, tool binary, airflow, PM2.5, `collector_state`
- History: airflow + PM during a session
- Manual overrides for relay and gate
