"""Comprehensive tests for CPU Scheduling algorithms.

Tests textbook examples, edge cases, and boundary conditions.
"""
import pytest
from app.services.cpu_scheduling import fcfs, sjf, srtf, round_robin, priority_non_preemptive, priority_preemptive


# ─── FCFS ────────────────────────────────────────────────────────────────────

class TestFCFS:
    def test_textbook_example(self):
        procs = [
            {"pid": "P1", "arrival_time": 0, "burst_time": 24, "priority": 0},
            {"pid": "P2", "arrival_time": 0, "burst_time": 3, "priority": 0},
            {"pid": "P3", "arrival_time": 0, "burst_time": 3, "priority": 0},
        ]
        result = fcfs(procs)
        assert result.algorithm == "FCFS"
        metrics = {m.pid: m for m in result.metrics}
        assert metrics["P1"].completion_time == 24
        assert metrics["P2"].completion_time == 27
        assert metrics["P3"].completion_time == 30
        assert metrics["P1"].waiting_time == 0
        assert metrics["P2"].waiting_time == 24
        assert metrics["P3"].waiting_time == 27

    def test_staggered_arrivals(self):
        procs = [
            {"pid": "P1", "arrival_time": 0, "burst_time": 5, "priority": 0},
            {"pid": "P2", "arrival_time": 1, "burst_time": 3, "priority": 0},
        ]
        result = fcfs(procs)
        metrics = {m.pid: m for m in result.metrics}
        assert metrics["P1"].completion_time == 5
        assert metrics["P2"].completion_time == 8
        assert metrics["P2"].waiting_time == 4
        assert metrics["P2"].turnaround_time == 7

    def test_single_process(self):
        procs = [{"pid": "P1", "arrival_time": 0, "burst_time": 10, "priority": 0}]
        result = fcfs(procs)
        assert len(result.metrics) == 1
        assert result.metrics[0].completion_time == 10
        assert result.metrics[0].waiting_time == 0
        assert result.context_switches == 0
        assert result.cpu_utilization == 100.0

    def test_idle_gap(self):
        procs = [
            {"pid": "P1", "arrival_time": 0, "burst_time": 2, "priority": 0},
            {"pid": "P2", "arrival_time": 5, "burst_time": 3, "priority": 0},
        ]
        result = fcfs(procs)
        metrics = {m.pid: m for m in result.metrics}
        assert metrics["P1"].completion_time == 2
        assert metrics["P2"].completion_time == 8
        # Gantt should show IDLE between 2 and 5
        idle_entries = [g for g in result.gantt_chart if g.pid == "IDLE"]
        assert len(idle_entries) == 1
        assert idle_entries[0].start == 2
        assert idle_entries[0].end == 5


# ─── SJF ─────────────────────────────────────────────────────────────────────

class TestSJF:
    def test_textbook_example(self):
        procs = [
            {"pid": "P1", "arrival_time": 0, "burst_time": 6, "priority": 0},
            {"pid": "P2", "arrival_time": 0, "burst_time": 8, "priority": 0},
            {"pid": "P3", "arrival_time": 0, "burst_time": 7, "priority": 0},
            {"pid": "P4", "arrival_time": 0, "burst_time": 3, "priority": 0},
        ]
        result = sjf(procs)
        metrics = {m.pid: m for m in result.metrics}
        # SJF order: P4(3), P1(6), P3(7), P2(8)
        assert metrics["P4"].completion_time == 3
        assert metrics["P1"].completion_time == 9
        assert metrics["P3"].completion_time == 16
        assert metrics["P2"].completion_time == 24

    def test_with_arrivals(self):
        procs = [
            {"pid": "P1", "arrival_time": 0, "burst_time": 7, "priority": 0},
            {"pid": "P2", "arrival_time": 2, "burst_time": 4, "priority": 0},
            {"pid": "P3", "arrival_time": 4, "burst_time": 1, "priority": 0},
            {"pid": "P4", "arrival_time": 5, "burst_time": 4, "priority": 0},
        ]
        result = sjf(procs)
        metrics = {m.pid: m for m in result.metrics}
        # P1 runs first (only one at t=0), then at t=7: P3(1), P2(4), P4(4)
        assert metrics["P1"].completion_time == 7
        assert metrics["P3"].completion_time == 8
        assert metrics["P2"].completion_time == 12
        assert metrics["P4"].completion_time == 16

    def test_identical_bursts(self):
        procs = [
            {"pid": "P1", "arrival_time": 0, "burst_time": 5, "priority": 0},
            {"pid": "P2", "arrival_time": 0, "burst_time": 5, "priority": 0},
        ]
        result = sjf(procs)
        # Tie-breaking by arrival (same), then PID
        metrics = {m.pid: m for m in result.metrics}
        assert metrics["P1"].completion_time == 5
        assert metrics["P2"].completion_time == 10


# ─── SRTF ────────────────────────────────────────────────────────────────────

class TestSRTF:
    def test_textbook_preemption(self):
        procs = [
            {"pid": "P1", "arrival_time": 0, "burst_time": 8, "priority": 0},
            {"pid": "P2", "arrival_time": 1, "burst_time": 4, "priority": 0},
            {"pid": "P3", "arrival_time": 2, "burst_time": 9, "priority": 0},
            {"pid": "P4", "arrival_time": 3, "burst_time": 5, "priority": 0},
        ]
        result = srtf(procs)
        metrics = {m.pid: m for m in result.metrics}
        # At t=1: P1 remaining=7, P2 remaining=4 → P2 preempts
        # At t=2: P2 remaining=3, P3=9 → P2 continues
        # At t=3: P2 remaining=2, P4=5 → P2 continues
        # P2 completes at t=5
        assert metrics["P2"].completion_time == 5
        assert metrics["P1"].completion_time == 17

    def test_no_preemption_needed(self):
        procs = [
            {"pid": "P1", "arrival_time": 0, "burst_time": 2, "priority": 0},
            {"pid": "P2", "arrival_time": 5, "burst_time": 3, "priority": 0},
        ]
        result = srtf(procs)
        metrics = {m.pid: m for m in result.metrics}
        assert metrics["P1"].completion_time == 2
        assert metrics["P2"].completion_time == 8


# ─── Round Robin ─────────────────────────────────────────────────────────────

class TestRoundRobin:
    def test_textbook_example(self):
        procs = [
            {"pid": "P1", "arrival_time": 0, "burst_time": 10, "priority": 0},
            {"pid": "P2", "arrival_time": 0, "burst_time": 4, "priority": 0},
            {"pid": "P3", "arrival_time": 0, "burst_time": 5, "priority": 0},
        ]
        result = round_robin(procs, time_quantum=3)
        metrics = {m.pid: m for m in result.metrics}
        # RR(3): P1[0-3], P2[3-6], P3[6-9], P1[9-12], P3[12-14], P1[14-18]...
        # Actually: P1(3), P2(3→done at 6 with burst=4? no, 3), P3(3), P1(3), P2(1), P3(2), P1(4)
        # P1: 0-3, P2: 3-6, P3: 6-9, P1: 9-12, P2: 12-13, P3: 13-15, P1: 15-19
        assert metrics["P2"].completion_time <= 19
        assert result.total_time == 19

    def test_quantum_larger_than_burst(self):
        procs = [
            {"pid": "P1", "arrival_time": 0, "burst_time": 2, "priority": 0},
            {"pid": "P2", "arrival_time": 0, "burst_time": 3, "priority": 0},
        ]
        result = round_robin(procs, time_quantum=5)
        metrics = {m.pid: m for m in result.metrics}
        # All complete within one quantum → behaves like FCFS
        assert metrics["P1"].completion_time == 2
        assert metrics["P2"].completion_time == 5

    def test_quantum_one(self):
        procs = [
            {"pid": "P1", "arrival_time": 0, "burst_time": 3, "priority": 0},
            {"pid": "P2", "arrival_time": 0, "burst_time": 2, "priority": 0},
        ]
        result = round_robin(procs, time_quantum=1)
        assert result.total_time == 5
        # Should have many context switches
        assert result.context_switches >= 3


# ─── Priority (Non-Preemptive) ──────────────────────────────────────────────

class TestPriorityNP:
    def test_basic_priority(self):
        procs = [
            {"pid": "P1", "arrival_time": 0, "burst_time": 10, "priority": 3},
            {"pid": "P2", "arrival_time": 0, "burst_time": 1, "priority": 1},
            {"pid": "P3", "arrival_time": 0, "burst_time": 2, "priority": 0},
            {"pid": "P4", "arrival_time": 0, "burst_time": 1, "priority": 2},
        ]
        result = priority_non_preemptive(procs)
        metrics = {m.pid: m for m in result.metrics}
        # Lower number = higher priority: P3(0), P2(1), P4(2), P1(3)
        assert metrics["P3"].completion_time == 2
        assert metrics["P2"].completion_time == 3
        assert metrics["P4"].completion_time == 4
        assert metrics["P1"].completion_time == 14


# ─── Priority (Preemptive) ──────────────────────────────────────────────────

class TestPriorityP:
    def test_preemption(self):
        procs = [
            {"pid": "P1", "arrival_time": 0, "burst_time": 4, "priority": 2},
            {"pid": "P2", "arrival_time": 1, "burst_time": 3, "priority": 0},
        ]
        result = priority_preemptive(procs)
        metrics = {m.pid: m for m in result.metrics}
        # At t=1, P2 (priority 0) preempts P1 (priority 2)
        assert metrics["P2"].completion_time == 4
        assert metrics["P1"].completion_time == 7

    def test_no_preemption_same_priority(self):
        procs = [
            {"pid": "P1", "arrival_time": 0, "burst_time": 3, "priority": 1},
            {"pid": "P2", "arrival_time": 1, "burst_time": 2, "priority": 1},
        ]
        result = priority_preemptive(procs)
        metrics = {m.pid: m for m in result.metrics}
        # Same priority, P1 arrived first, should complete first
        assert metrics["P1"].completion_time == 3
        assert metrics["P2"].completion_time == 5
