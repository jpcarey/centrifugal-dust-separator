# Control FSM (TypeScript)

Host-testable reference for dust-collector sequencing. The ESPHome YAML already
runs CT→gate→relay→purge on the ESP32; treat this module as the typed spec when
extending that on-device logic. Do not move ownership of start/stop to a hub.

## API

```ts
import { CollectorController } from "./src/stateMachine";

const ctl = new CollectorController({ purgeSeconds: 15 });
ctl.tick(0.1, { toolOn: true, airflow: 20, gateConfirmedOpen: true });
// ctl.state === "COLLECTOR_ON"
```

States: `IDLE` → `GATE_OPENING` → `COLLECTOR_ON` → `PURGE` → `GATE_CLOSING` → `IDLE`, plus `FAULT`.

## Why TypeScript

Chosen as the single host language for this fork: shared FSM + Vitest coverage +
the HF audio experiment (Vite), without a Python toolchain. Firmware stays
ESPHome YAML / C++ on the ESP32. Home Assistant is not part of the stack.
