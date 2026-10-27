"""Comprehensive tests for Disk Scheduling algorithms.

Tests FCFS, SSTF, SCAN, C-SCAN, LOOK, and C-LOOK using standard textbook examples.
"""
import pytest
from app.services.disk_scheduling import fcfs, sstf, scan, c_scan, look, c_look


QUEUE = [98, 183, 37, 122, 14, 124, 65, 67]
HEAD = 53
DISK_SIZE = 200


class TestDiskScheduling:
    def test_fcfs(self):
        res = fcfs(QUEUE, HEAD, DISK_SIZE)
        assert res.seek_sequence == [53, 98, 183, 37, 122, 14, 124, 65, 67]
        assert res.total_head_movement == 640
        assert res.average_seek_distance == 80.0

    def test_sstf(self):
        res = sstf(QUEUE, HEAD, DISK_SIZE)
        assert res.seek_sequence == [53, 65, 67, 37, 14, 98, 122, 124, 183]
        assert res.total_head_movement == 236

    def test_scan_right(self):
        res = scan(QUEUE, HEAD, DISK_SIZE, direction="right")
        assert res.seek_sequence == [53, 65, 67, 98, 122, 124, 183, 199, 37, 14]
        assert res.total_head_movement == 331

    def test_scan_left(self):
        res = scan(QUEUE, HEAD, DISK_SIZE, direction="left")
        assert res.seek_sequence == [53, 37, 14, 0, 65, 67, 98, 122, 124, 183]
        # 53 down to 0 (53) + 0 up to 183 (183) = 236
        assert res.total_head_movement == 236

    def test_c_scan_right(self):
        res = c_scan(QUEUE, HEAD, DISK_SIZE, direction="right")
        assert res.seek_sequence == [53, 65, 67, 98, 122, 124, 183, 199, 0, 14, 37]
        assert res.total_head_movement == 382

    def test_look_right(self):
        res = look(QUEUE, HEAD, DISK_SIZE, direction="right")
        assert res.seek_sequence == [53, 65, 67, 98, 122, 124, 183, 37, 14]
        assert res.total_head_movement == 299

    def test_c_look_right(self):
        res = c_look(QUEUE, HEAD, DISK_SIZE, direction="right")
        assert res.seek_sequence == [53, 65, 67, 98, 122, 124, 183, 14, 37]
        assert res.total_head_movement == 322

    def test_empty_queue(self):
        res = fcfs([], HEAD, DISK_SIZE)
        assert res.seek_sequence == [HEAD]
        assert res.total_head_movement == 0
        assert res.average_seek_distance == 0.0
