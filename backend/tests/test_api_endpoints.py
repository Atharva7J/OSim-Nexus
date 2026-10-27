"""Integration tests for all FastAPI endpoints."""
import pytest
from starlette.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "osim-nexus-api"


def test_cpu_scheduling_api():
    payload = {
        "algorithm": "fcfs",
        "processes": [
            {"pid": "P1", "arrival_time": 0, "burst_time": 4, "priority": 0},
            {"pid": "P2", "arrival_time": 1, "burst_time": 3, "priority": 0},
        ],
    }
    response = client.post("/api/cpu/schedule", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["algorithm"] == "FCFS"
    assert len(data["metrics"]) == 2
    assert "gantt_chart" in data


def test_memory_simulation_api():
    payload = {
        "total_memory": 1000,
        "algorithm": "first_fit",
        "operations": [
            {"type": "allocate", "pid": "P1", "size": 200},
            {"type": "allocate", "pid": "P2", "size": 300},
            {"type": "deallocate", "pid": "P1"},
        ],
    }
    response = client.post("/api/memory/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["snapshots"]) == 3
    assert data["final_state"]["allocated_memory"] == 300


def test_paging_simulation_api():
    payload = {
        "algorithm": "lru",
        "reference_string": [7, 0, 1, 2, 0, 3, 0, 4, 2, 3],
        "num_frames": 3,
    }
    response = client.post("/api/paging/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["algorithm"] == "LRU"
    assert data["page_faults"] + data["page_hits"] == 10


def test_deadlock_bankers_api():
    payload = {
        "available": [3, 3, 2],
        "maximum": [
            [7, 5, 3],
            [3, 2, 2],
            [9, 0, 2],
            [2, 2, 2],
            [4, 3, 3],
        ],
        "allocation": [
            [0, 1, 0],
            [2, 0, 0],
            [3, 0, 2],
            [2, 1, 1],
            [0, 0, 2],
        ],
        "process_ids": ["P0", "P1", "P2", "P3", "P4"],
    }
    response = client.post("/api/deadlock/bankers", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_safe"] is True
    assert len(data["safe_sequence"]) == 5


def test_disk_scheduling_api():
    payload = {
        "algorithm": "scan",
        "request_queue": [98, 183, 37, 122, 14, 124, 65, 67],
        "initial_head": 53,
        "disk_size": 200,
        "direction": "right",
    }
    response = client.post("/api/disk/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["algorithm"] == "SCAN"
    assert data["total_head_movement"] == 331


def test_sync_producer_consumer_api():
    payload = {
        "buffer_size": 3,
        "actions": [
            {"actor": "Producer", "action": "produce", "item": "Data1"},
            {"actor": "Consumer", "action": "consume"},
        ],
    }
    response = client.post("/api/sync/producer-consumer", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["steps"]) == 2


def test_sync_dining_philosophers_api():
    payload = {
        "num_philosophers": 5,
        "action_sequence": [
            {"philosopher": 0, "action": "pickup"},
            {"philosopher": 0, "action": "putdown"},
        ],
    }
    response = client.post("/api/sync/dining-philosophers", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["steps"]) == 2


def test_deadlock_detection_api():
    payload = {
        "available": [0, 0, 0],
        "allocation": [
            [1, 0, 0],
            [0, 1, 0],
        ],
        "request": [
            [0, 1, 0],
            [1, 0, 0],
        ],
        "process_ids": ["P0", "P1"],
    }
    response = client.post("/api/deadlock/detect", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_deadlocked"] is True
    assert "P0" in data["deadlocked_processes"]
    assert "P1" in data["deadlocked_processes"]


def test_cpu_compare_api():
    payload = {
        "algorithms": ["fcfs", "sjf"],
        "processes": [
            {"pid": "P1", "arrival_time": 0, "burst_time": 4, "priority": 0},
            {"pid": "P2", "arrival_time": 1, "burst_time": 2, "priority": 0},
        ],
        "time_quantum": 2,
    }
    response = client.post("/api/cpu/compare", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "fcfs" in data
    assert "sjf" in data


def test_paging_compare_api():
    payload = {
        "algorithms": ["fifo", "lru", "optimal"],
        "reference_string": [1, 2, 3, 1, 4, 1],
        "num_frames": 3,
    }
    response = client.post("/api/paging/compare", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "fifo" in data
    assert "lru" in data
    assert "optimal" in data


def test_disk_compare_api():
    payload = {
        "algorithms": ["fcfs", "sstf", "scan"],
        "request_queue": [98, 183, 37, 122],
        "initial_head": 53,
        "disk_size": 200,
        "direction": "right",
    }
    response = client.post("/api/disk/compare", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "fcfs" in data
    assert "sstf" in data
    assert "scan" in data

