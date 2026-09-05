import { describe, expect, it } from "vitest";
import { CollectorController } from "../control/src/stateMachine";

function controller() {
  return new CollectorController({
    purgeSeconds: 2,
    gateTimeoutSeconds: 1,
    minAirflowWhileOn: 5,
    airflowFaultGraceSeconds: 1,
  });
}

describe("CollectorController", () => {
  it("runs idle → gate → on → purge → close → idle", () => {
    const ctl = controller();
    expect(ctl.state).toBe("IDLE");

    ctl.tick(0.1, { toolOn: true, airflow: 20, gateConfirmedOpen: false });
    expect(ctl.state).toBe("GATE_OPENING");
    expect(ctl.gateOpenPercent).toBe(100);

    ctl.tick(0.1, { toolOn: true, airflow: 20, gateConfirmedOpen: true });
    expect(ctl.state).toBe("COLLECTOR_ON");
    expect(ctl.relayOn).toBe(true);

    ctl.tick(0.1, { toolOn: false, airflow: 20 });
    expect(ctl.state).toBe("PURGE");

    ctl.tick(2.0, { toolOn: false, airflow: 20 });
    expect(ctl.state).toBe("GATE_CLOSING");
    expect(ctl.relayOn).toBe(false);

    ctl.tick(0.1, { toolOn: false, airflow: 0, gateConfirmedClosed: true });
    expect(ctl.state).toBe("IDLE");
  });

  it("faults on low airflow while running", () => {
    const ctl = controller();
    ctl.tick(0.1, { toolOn: true, airflow: 20, gateConfirmedOpen: false });
    ctl.tick(0.1, { toolOn: true, airflow: 20, gateConfirmedOpen: true });
    expect(ctl.state).toBe("COLLECTOR_ON");
    ctl.tick(1.1, { toolOn: true, airflow: 0.5 });
    expect(ctl.state).toBe("FAULT");
    expect(ctl.relayOn).toBe(false);
  });

  it("faults when the gate never confirms open", () => {
    const ctl = controller();
    ctl.tick(0.1, { toolOn: true, airflow: 20, gateConfirmedOpen: false });
    ctl.tick(1.0, { toolOn: true, airflow: 20, gateConfirmedOpen: false });
    expect(ctl.state).toBe("FAULT");
  });

  it("clears fault back to idle", () => {
    const ctl = controller();
    ctl.tick(0.1, { toolOn: true, airflow: 20, gateConfirmedOpen: false });
    ctl.tick(1.0, { toolOn: true, airflow: 20, gateConfirmedOpen: false });
    expect(ctl.state).toBe("FAULT");
    ctl.clearFault();
    expect(ctl.state).toBe("IDLE");
  });

  it("rejects negative dt", () => {
    const ctl = controller();
    expect(() => ctl.tick(-0.1, { toolOn: false, airflow: 0 })).toThrow(/non-negative/);
  });
});
