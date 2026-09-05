"""Reference dust-collector control state machine.

Host-testable model of the Phase-1/3 behavior described in docs/architecture.md.
ESPHome YAML currently implements a simpler on/off + purge path; keep this module
as the source of truth when moving sequencing on-device.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum


class State(str, Enum):
    IDLE = "IDLE"
    GATE_OPENING = "GATE_OPENING"
    COLLECTOR_ON = "COLLECTOR_ON"
    PURGE = "PURGE"
    GATE_CLOSING = "GATE_CLOSING"
    FAULT = "FAULT"


@dataclass
class CollectorConfig:
    purge_seconds: float = 15.0
    gate_timeout_seconds: float = 3.0
    min_airflow_while_on: float = 5.0
    airflow_fault_grace_seconds: float = 8.0


@dataclass
class CollectorController:
    config: CollectorConfig = field(default_factory=CollectorConfig)
    state: State = State.IDLE
    gate_open_percent: float = 0.0
    relay_on: bool = False
    _elapsed_in_state: float = 0.0

    def tick(
        self,
        dt: float,
        *,
        tool_on: bool,
        airflow: float,
        gate_confirmed_open: bool = True,
        gate_confirmed_closed: bool = True,
    ) -> State:
        """Advance the FSM by dt seconds given current inputs."""
        if dt < 0:
            raise ValueError("dt must be non-negative")
        self._elapsed_in_state += dt

        if self.state == State.IDLE:
            if tool_on:
                self._enter(State.GATE_OPENING)
                self.gate_open_percent = 100.0

        elif self.state == State.GATE_OPENING:
            if gate_confirmed_open:
                self.relay_on = True
                self._enter(State.COLLECTOR_ON)
            elif self._elapsed_in_state >= self.config.gate_timeout_seconds:
                self._fault()

        elif self.state == State.COLLECTOR_ON:
            if not tool_on:
                self._enter(State.PURGE)
            elif (
                self._elapsed_in_state >= self.config.airflow_fault_grace_seconds
                and airflow < self.config.min_airflow_while_on
            ):
                self._fault()

        elif self.state == State.PURGE:
            if tool_on:
                self._enter(State.COLLECTOR_ON)
            elif self._elapsed_in_state >= self.config.purge_seconds:
                self.relay_on = False
                self.gate_open_percent = 0.0
                self._enter(State.GATE_CLOSING)

        elif self.state == State.GATE_CLOSING:
            if tool_on:
                self.gate_open_percent = 100.0
                self._enter(State.GATE_OPENING)
            elif gate_confirmed_closed:
                self._enter(State.IDLE)
            elif self._elapsed_in_state >= self.config.gate_timeout_seconds:
                self._fault()

        elif self.state == State.FAULT:
            self.relay_on = False
            # Stay faulted until tool is off and operator clears by calling clear_fault()
            if not tool_on and self.gate_open_percent == 0.0:
                pass

        return self.state

    def clear_fault(self) -> None:
        if self.state == State.FAULT:
            self.relay_on = False
            self.gate_open_percent = 0.0
            self._enter(State.IDLE)

    def _enter(self, new_state: State) -> None:
        self.state = new_state
        self._elapsed_in_state = 0.0

    def _fault(self) -> None:
        self.relay_on = False
        self.gate_open_percent = 0.0
        self._enter(State.FAULT)
