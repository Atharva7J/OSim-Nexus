"""Comprehensive tests for Deadlock algorithms (Banker's Algorithm and Deadlock Detection)."""
import pytest
from app.services.deadlock import bankers_algorithm, detect_deadlock


class TestBankersAlgorithm:
    def test_silberschatz_textbook_safe_state(self):
        """Silberschatz textbook standard example."""
        available = [3, 3, 2]
        maximum = [
            [7, 5, 3],  # P0
            [3, 2, 2],  # P1
            [9, 0, 2],  # P2
            [2, 2, 2],  # P3
            [4, 3, 3],  # P4
        ]
        allocation = [
            [0, 1, 0],  # P0
            [2, 0, 0],  # P1
            [3, 0, 2],  # P2
            [2, 1, 1],  # P3
            [0, 0, 2],  # P4
        ]
        pids = ["P0", "P1", "P2", "P3", "P4"]

        res = bankers_algorithm(available, maximum, allocation, pids)

        assert res.is_safe is True
        assert len(res.safe_sequence) == 5

        # Check Need matrix calculation: Need = Max - Allocation
        expected_need = [
            [7, 4, 3],  # P0
            [1, 2, 2],  # P1
            [6, 0, 0],  # P2
            [0, 1, 1],  # P3
            [4, 3, 1],  # P4
        ]
        assert res.need == expected_need

        # Validate that the returned safe sequence is indeed valid step-by-step
        work = list(available)
        for pid in res.safe_sequence:
            idx = pids.index(pid)
            assert all(res.need[idx][j] <= work[j] for j in range(3))
            for j in range(3):
                work[j] += allocation[idx][j]

    def test_unsafe_state_detection(self):
        """System with insufficient available resources enters unsafe state."""
        available = [0, 0, 0]
        maximum = [
            [2, 0, 0],
            [0, 2, 0],
        ]
        allocation = [
            [1, 0, 0],
            [0, 1, 0],
        ]
        # Need: P0 needs [1, 0, 0], P1 needs [0, 1, 0].
        # Work is [0, 0, 0]. Neither can finish.
        res = bankers_algorithm(available, maximum, allocation)
        assert res.is_safe is False
        assert len(res.safe_sequence) == 0


class TestDeadlockDetection:
    def test_no_deadlock(self):
        available = [0, 0, 0]
        allocation = [
            [1, 0, 0],  # P0 holds Res0
            [0, 1, 0],  # P1 holds Res1
        ]
        request = [
            [0, 0, 0],  # P0 has finished its requests
            [1, 0, 0],  # P1 requests Res0
        ]
        # P0 finishes first, releases [1, 0, 0].
        # Work becomes [1, 0, 0], which satisfies P1's request of [1, 0, 0].
        res = detect_deadlock(available, allocation, request)
        assert res.is_deadlocked is False
        assert len(res.deadlocked_processes) == 0

    def test_deadlock_detected(self):
        available = [0, 0, 0]
        allocation = [
            [1, 0, 0],
            [0, 1, 0],
        ]
        request = [
            [0, 1, 0],  # P0 holds Res0, requests Res1
            [1, 0, 0],  # P1 holds Res1, requests Res0 (cycle)
        ]
        res = detect_deadlock(available, allocation, request, ["P0", "P1"])
        assert res.is_deadlocked is True
        assert "P0" in res.deadlocked_processes
        assert "P1" in res.deadlocked_processes
