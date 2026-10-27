"""Disk Scheduling Simulation Engine.

Implements: FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK.
"""
from __future__ import annotations

from pydantic import BaseModel
from app.models.simulation import EventType, SimulationEvent


class DiskSchedulingResult(BaseModel):
    algorithm: str
    seek_sequence: list[int]
    total_head_movement: int
    average_seek_distance: float
    events: list[SimulationEvent]
    initial_head: int
    request_queue: list[int]
    disk_size: int
    direction: str


def _disk_events(sequence: list[int], algorithm: str) -> tuple[list[SimulationEvent], int]:
    events: list[SimulationEvent] = []
    total = 0
    for i in range(1, len(sequence)):
        movement = abs(sequence[i] - sequence[i - 1])
        total += movement
        events.append(SimulationEvent(
            timestamp=i,
            event_type=EventType.DISK_MOVEMENT,
            entity_id=str(sequence[i]),
            description=f"Head moves from {sequence[i-1]} to {sequence[i]} (distance={movement}). Total so far: {total}.",
            metadata={"from": sequence[i-1], "to": sequence[i], "distance": movement},
        ))
    return events, total


def fcfs(request_queue: list[int], initial_head: int, disk_size: int, direction: str = "right") -> DiskSchedulingResult:
    sequence = [initial_head] + list(request_queue)
    events, total = _disk_events(sequence, "FCFS")
    n = len(request_queue)
    return DiskSchedulingResult(algorithm="FCFS", seek_sequence=sequence, total_head_movement=total, average_seek_distance=round(total / n, 2) if n else 0, events=events, initial_head=initial_head, request_queue=request_queue, disk_size=disk_size, direction=direction)


def sstf(request_queue: list[int], initial_head: int, disk_size: int, direction: str = "right") -> DiskSchedulingResult:
    pending = list(request_queue)
    sequence = [initial_head]
    current = initial_head
    while pending:
        closest = min(pending, key=lambda x: abs(x - current))
        sequence.append(closest)
        current = closest
        pending.remove(closest)
    events, total = _disk_events(sequence, "SSTF")
    n = len(request_queue)
    return DiskSchedulingResult(algorithm="SSTF", seek_sequence=sequence, total_head_movement=total, average_seek_distance=round(total / n, 2) if n else 0, events=events, initial_head=initial_head, request_queue=request_queue, disk_size=disk_size, direction=direction)


def scan(request_queue: list[int], initial_head: int, disk_size: int, direction: str = "right") -> DiskSchedulingResult:
    left = sorted([r for r in request_queue if r < initial_head])
    right = sorted([r for r in request_queue if r >= initial_head])

    sequence = [initial_head]
    if direction == "right":
        sequence.extend(right)
        if not right or right[-1] != disk_size - 1:
            sequence.append(disk_size - 1)
        sequence.extend(reversed(left))
    else:
        sequence.extend(reversed(left))
        if not left or left[0] != 0:
            sequence.append(0)
        sequence.extend(right)

    events, total = _disk_events(sequence, "SCAN")
    n = len(request_queue)
    return DiskSchedulingResult(algorithm="SCAN", seek_sequence=sequence, total_head_movement=total, average_seek_distance=round(total / n, 2) if n else 0, events=events, initial_head=initial_head, request_queue=request_queue, disk_size=disk_size, direction=direction)


def c_scan(request_queue: list[int], initial_head: int, disk_size: int, direction: str = "right") -> DiskSchedulingResult:
    left = sorted([r for r in request_queue if r < initial_head])
    right = sorted([r for r in request_queue if r >= initial_head])

    sequence = [initial_head]
    if direction == "right":
        sequence.extend(right)
        if not right or right[-1] != disk_size - 1:
            sequence.append(disk_size - 1)
        sequence.append(0)
        sequence.extend(left)
    else:
        sequence.extend(reversed(left))
        if not left or left[0] != 0:
            sequence.append(0)
        sequence.append(disk_size - 1)
        sequence.extend(reversed(right))

    events, total = _disk_events(sequence, "C-SCAN")
    n = len(request_queue)
    return DiskSchedulingResult(algorithm="C-SCAN", seek_sequence=sequence, total_head_movement=total, average_seek_distance=round(total / n, 2) if n else 0, events=events, initial_head=initial_head, request_queue=request_queue, disk_size=disk_size, direction=direction)


def look(request_queue: list[int], initial_head: int, disk_size: int, direction: str = "right") -> DiskSchedulingResult:
    left = sorted([r for r in request_queue if r < initial_head])
    right = sorted([r for r in request_queue if r >= initial_head])

    sequence = [initial_head]
    if direction == "right":
        sequence.extend(right)
        sequence.extend(reversed(left))
    else:
        sequence.extend(reversed(left))
        sequence.extend(right)

    events, total = _disk_events(sequence, "LOOK")
    n = len(request_queue)
    return DiskSchedulingResult(algorithm="LOOK", seek_sequence=sequence, total_head_movement=total, average_seek_distance=round(total / n, 2) if n else 0, events=events, initial_head=initial_head, request_queue=request_queue, disk_size=disk_size, direction=direction)


def c_look(request_queue: list[int], initial_head: int, disk_size: int, direction: str = "right") -> DiskSchedulingResult:
    left = sorted([r for r in request_queue if r < initial_head])
    right = sorted([r for r in request_queue if r >= initial_head])

    sequence = [initial_head]
    if direction == "right":
        sequence.extend(right)
        sequence.extend(left)
    else:
        sequence.extend(reversed(left))
        sequence.extend(reversed(right))

    events, total = _disk_events(sequence, "C-LOOK")
    n = len(request_queue)
    return DiskSchedulingResult(algorithm="C-LOOK", seek_sequence=sequence, total_head_movement=total, average_seek_distance=round(total / n, 2) if n else 0, events=events, initial_head=initial_head, request_queue=request_queue, disk_size=disk_size, direction=direction)


DISK_ALGORITHMS = {
    "fcfs": fcfs,
    "sstf": sstf,
    "scan": scan,
    "c_scan": c_scan,
    "look": look,
    "c_look": c_look,
}


def run_disk_scheduling(algorithm: str, request_queue: list[int], initial_head: int, disk_size: int, direction: str = "right") -> DiskSchedulingResult:
    fn = DISK_ALGORITHMS.get(algorithm)
    if fn is None:
        raise ValueError(f"Unknown algorithm: {algorithm}")
    return fn(request_queue, initial_head, disk_size, direction)
