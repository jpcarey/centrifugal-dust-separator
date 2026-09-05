# Control FSM (TypeScript)

Host-testable reference for dust-collector sequencing. ESPHome YAML implements a
simpler on/off + purge path today; treat this module as the source of truth when
moving richer logic on-device or into a Node/MQTT bridge.

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
the HF audio UI (Vite), without a Python toolchain. Firmware stays ESPHome YAML /
C++ on the ESP32.
