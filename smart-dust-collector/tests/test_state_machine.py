"""Tests for the dust-collector reference state machine."""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "firmware"))

from src.state_machine import CollectorConfig, CollectorController, State  # noqa: E402


@pytest.fixture
def ctl() -> CollectorController:
    return CollectorController(
        CollectorConfig(
            purge_seconds=2.0,
            gate_timeout_seconds=1.0,
            min_airflow_while_on=5.0,
            airflow_fault_grace_seconds=1.0,
        )
    )


def test_idle_to_on_and_purge(ctl: CollectorController) -> None:
    assert ctl.state == State.IDLE
    ctl.tick(0.1, tool_on=True, airflow=20.0, gate_confirmed_open=False)
    assert ctl.state == State.GATE_OPENING
    assert ctl.gate_open_percent == 100.0

    ctl.tick(0.1, tool_on=True, airflow=20.0, gate_confirmed_open=True)
    assert ctl.state == State.COLLECTOR_ON
    assert ctl.relay_on is True

    ctl.tick(0.1, tool_on=False, airflow=20.0)
    assert ctl.state == State.PURGE

    ctl.tick(2.0, tool_on=False, airflow=20.0)
    assert ctl.state == State.GATE_CLOSING
    assert ctl.relay_on is False

    ctl.tick(0.1, tool_on=False, airflow=0.0, gate_confirmed_closed=True)
    assert ctl.state == State.IDLE


def test_low_airflow_fault(ctl: CollectorController) -> None:
    ctl.tick(0.1, tool_on=True, airflow=20.0, gate_confirmed_open=False)
    ctl.tick(0.1, tool_on=True, airflow=20.0, gate_confirmed_open=True)
    assert ctl.state == State.COLLECTOR_ON
    ctl.tick(1.1, tool_on=True, airflow=0.5)
    assert ctl.state == State.FAULT
    assert ctl.relay_on is False


def test_gate_timeout_fault(ctl: CollectorController) -> None:
    ctl.tick(0.1, tool_on=True, airflow=20.0, gate_confirmed_open=False)
    ctl.tick(1.0, tool_on=True, airflow=20.0, gate_confirmed_open=False)
    assert ctl.state == State.FAULT


def test_clear_fault(ctl: CollectorController) -> None:
    ctl.tick(0.1, tool_on=True, airflow=20.0, gate_confirmed_open=False)
    ctl.tick(1.0, tool_on=True, airflow=20.0, gate_confirmed_open=False)
    assert ctl.state == State.FAULT
    ctl.clear_fault()
    assert ctl.state == State.IDLE


def test_negative_dt_rejected(ctl: CollectorController) -> None:
    with pytest.raises(ValueError):
        ctl.tick(-0.1, tool_on=False, airflow=0.0)
