"""Deadlock Simulation Engine.

Implements: Banker's Algorithm (Safety Check + Resource Request),
            Deadlock Detection (using wait-for graph / matrix-based).
"""
from __future__ import annotations

from pydantic import BaseModel
from app.models.simulation import EventType, SimulationEvent


class BankerState(BaseModel):
    """Input and result of Banker's Algorithm."""
    num_processes: int
    num_resources: int
    available: list[int]
    maximum: list[list[int]]
    allocation: list[list[int]]
    need: list[list[int]]
    is_safe: bool
    safe_sequence: list[str]
    events: list[SimulationEvent]


class DeadlockDetectionResult(BaseModel):
    """Result from deadlock detection."""
    is_deadlocked: bool
    deadlocked_processes: list[str]
    events: list[SimulationEvent]


def bankers_algorithm(
    available: list[int],
    maximum: list[list[int]],
    allocation: list[list[int]],
    process_ids: list[str] | None = None,
) -> BankerState:
    """Run Banker's Safety Algorithm.

    Returns whether the system is in a safe state and the safe sequence if one exists.
    """
    n = len(maximum)
    m = len(available)
    pids = process_ids or [f"P{i}" for i in range(n)]

    # Calculate Need = Max - Allocation
    need = [[maximum[i][j] - allocation[i][j] for j in range(m)] for i in range(n)]

    events: list[SimulationEvent] = []
    work = list(available)
    finish = [False] * n
    safe_sequence: list[str] = []

    events.append(SimulationEvent(
        timestamp=0,
        event_type=EventType.DEADLOCK_CHECK,
        entity_id="SYSTEM",
        description=f"Starting Banker's Safety Algorithm. Available = {work}.",
        metadata={"work": list(work), "need": [list(row) for row in need]},
    ))

    step = 0
    while True:
        found = False
        for i in range(n):
            if not finish[i] and all(need[i][j] <= work[j] for j in range(m)):
                step += 1
                # Process can finish
                events.append(SimulationEvent(
                    timestamp=step,
                    event_type=EventType.RESOURCE_ALLOCATION,
                    entity_id=pids[i],
                    description=f"{pids[i]} can finish: Need {need[i]} <= Work {work}. After release, Work = {[work[j] + allocation[i][j] for j in range(m)]}.",
                    metadata={"need": need[i], "work": list(work), "allocation": allocation[i]},
                ))
                for j in range(m):
                    work[j] += allocation[i][j]
                finish[i] = True
                safe_sequence.append(pids[i])
                found = True
        if not found:
            break

    is_safe = all(finish)
    if is_safe:
        events.append(SimulationEvent(
            timestamp=step + 1,
            event_type=EventType.DEADLOCK_CHECK,
            entity_id="SYSTEM",
            description=f"System is in a SAFE state. Safe sequence: {' → '.join(safe_sequence)}.",
        ))
    else:
        unsafe = [pids[i] for i in range(n) if not finish[i]]
        events.append(SimulationEvent(
            timestamp=step + 1,
            event_type=EventType.DEADLOCK_CHECK,
            entity_id="SYSTEM",
            description=f"System is in an UNSAFE state. Processes that cannot finish: {unsafe}.",
        ))

    return BankerState(
        num_processes=n,
        num_resources=m,
        available=available,
        maximum=maximum,
        allocation=allocation,
        need=need,
        is_safe=is_safe,
        safe_sequence=safe_sequence,
        events=events,
    )


def detect_deadlock(
    available: list[int],
    allocation: list[list[int]],
    request: list[list[int]],
    process_ids: list[str] | None = None,
) -> DeadlockDetectionResult:
    """Deadlock detection using the resource allocation matrix approach."""
    n = len(allocation)
    m = len(available)
    pids = process_ids or [f"P{i}" for i in range(n)]

    work = list(available)
    finish = [False] * n
    events: list[SimulationEvent] = []

    # Initially mark processes with zero allocation as finished
    for i in range(n):
        if all(allocation[i][j] == 0 for j in range(m)):
            finish[i] = True

    step = 0
    while True:
        found = False
        for i in range(n):
            if not finish[i] and all(request[i][j] <= work[j] for j in range(m)):
                step += 1
                events.append(SimulationEvent(
                    timestamp=step,
                    event_type=EventType.RESOURCE_ALLOCATION,
                    entity_id=pids[i],
                    description=f"{pids[i]} can proceed: Request {request[i]} <= Work {work}.",
                ))
                for j in range(m):
                    work[j] += allocation[i][j]
                finish[i] = True
                found = True
        if not found:
            break

    deadlocked = [pids[i] for i in range(n) if not finish[i]]
    is_deadlocked = len(deadlocked) > 0

    if is_deadlocked:
        events.append(SimulationEvent(
            timestamp=step + 1,
            event_type=EventType.DEADLOCK_CHECK,
            entity_id="SYSTEM",
            description=f"DEADLOCK detected! Deadlocked processes: {deadlocked}.",
        ))
    else:
        events.append(SimulationEvent(
            timestamp=step + 1,
            event_type=EventType.DEADLOCK_CHECK,
            entity_id="SYSTEM",
            description="No deadlock detected. All processes can eventually complete.",
        ))

    return DeadlockDetectionResult(
        is_deadlocked=is_deadlocked,
        deadlocked_processes=deadlocked,
        events=events,
    )
