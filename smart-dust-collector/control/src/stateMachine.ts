/**
 * Reference dust-collector control state machine.
 *
 * Host-testable model of Phase-1/3 behavior in docs/architecture.md.
 * ESPHome YAML currently implements a simpler on/off + purge path; keep this
 * module as the source of truth when moving sequencing on-device.
 */

export type State =
  | "IDLE"
  | "GATE_OPENING"
  | "COLLECTOR_ON"
  | "PURGE"
  | "GATE_CLOSING"
  | "FAULT";

export interface CollectorConfig {
  purgeSeconds: number;
  gateTimeoutSeconds: number;
  minAirflowWhileOn: number;
  airflowFaultGraceSeconds: number;
}

export const DEFAULT_CONFIG: CollectorConfig = {
  purgeSeconds: 15,
  gateTimeoutSeconds: 3,
  minAirflowWhileOn: 5,
  airflowFaultGraceSeconds: 8,
};

export interface TickInput {
  toolOn: boolean;
  airflow: number;
  gateConfirmedOpen?: boolean;
  gateConfirmedClosed?: boolean;
}

export class CollectorController {
  readonly config: CollectorConfig;
  state: State = "IDLE";
  gateOpenPercent = 0;
  relayOn = false;
  private elapsedInState = 0;

  constructor(config: Partial<CollectorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  tick(dt: number, input: TickInput): State {
    if (dt < 0) {
      throw new Error("dt must be non-negative");
    }

    const {
      toolOn,
      airflow,
      gateConfirmedOpen = true,
      gateConfirmedClosed = true,
    } = input;

    this.elapsedInState += dt;

    switch (this.state) {
      case "IDLE":
        if (toolOn) {
          this.enter("GATE_OPENING");
          this.gateOpenPercent = 100;
        }
        break;

      case "GATE_OPENING":
        if (gateConfirmedOpen) {
          this.relayOn = true;
          this.enter("COLLECTOR_ON");
        } else if (this.elapsedInState >= this.config.gateTimeoutSeconds) {
          this.fault();
        }
        break;

      case "COLLECTOR_ON":
        if (!toolOn) {
          this.enter("PURGE");
        } else if (
          this.elapsedInState >= this.config.airflowFaultGraceSeconds &&
          airflow < this.config.minAirflowWhileOn
        ) {
          this.fault();
        }
        break;

      case "PURGE":
        if (toolOn) {
          this.enter("COLLECTOR_ON");
        } else if (this.elapsedInState >= this.config.purgeSeconds) {
          this.relayOn = false;
          this.gateOpenPercent = 0;
          this.enter("GATE_CLOSING");
        }
        break;

      case "GATE_CLOSING":
        if (toolOn) {
          this.gateOpenPercent = 100;
          this.enter("GATE_OPENING");
        } else if (gateConfirmedClosed) {
          this.enter("IDLE");
        } else if (this.elapsedInState >= this.config.gateTimeoutSeconds) {
          this.fault();
        }
        break;

      case "FAULT":
        this.relayOn = false;
        break;
    }

    return this.state;
  }

  clearFault(): void {
    if (this.state === "FAULT") {
      this.relayOn = false;
      this.gateOpenPercent = 0;
      this.enter("IDLE");
    }
  }

  private enter(next: State): void {
    this.state = next;
    this.elapsedInState = 0;
  }

  private fault(): void {
    this.relayOn = false;
    this.gateOpenPercent = 0;
    this.enter("FAULT");
  }
}
