"""Synchronization Simulation Engine.

Implements deterministic simulations for:
- Producer-Consumer (Bounded Buffer)
- Dining Philosophers
"""
from __future__ import annotations

from pydantic import BaseModel
from app.models.simulation import EventType, SimulationEvent


class SyncStep(BaseModel):
    step: int
    actor: str
    action: str
    buffer_state: list[str]
    semaphores: dict[str, int]
    description: str


class ProducerConsumerResult(BaseModel):
    buffer_size: int
    steps: list[SyncStep]
    events: list[SimulationEvent]


class PhilosopherState(BaseModel):
    step: int
    philosophers: list[str]  # state for each philosopher
    forks: list[str | None]  # who holds each fork (None = free)
    description: str


class DiningPhilosophersResult(BaseModel):
    num_philosophers: int
    steps: list[PhilosopherState]
    events: list[SimulationEvent]


def producer_consumer(
    actions: list[dict],
    buffer_size: int = 5,
) -> ProducerConsumerResult:
    """Simulate Producer-Consumer with bounded buffer.

    actions: list of {"actor": "Producer1" | "Consumer1", "action": "produce" | "consume", "item": "A"}
    """
    buffer: list[str] = []
    empty = buffer_size  # semaphore: empty slots
    full = 0  # semaphore: filled slots
    mutex = 1
    steps: list[SyncStep] = []
    events: list[SimulationEvent] = []

    for i, act in enumerate(actions):
        actor = act["actor"]
        action = act["action"]
        item = act.get("item", f"item_{i}")

        if action == "produce":
            if empty <= 0:
                desc = f"{actor} wants to produce '{item}' but buffer is full (empty=0). BLOCKED."
                events.append(SimulationEvent(timestamp=i, event_type=EventType.SYNC_BLOCKED, entity_id=actor, description=desc))
                steps.append(SyncStep(step=i, actor=actor, action="blocked", buffer_state=list(buffer), semaphores={"empty": empty, "full": full, "mutex": mutex}, description=desc))
                continue

            empty -= 1
            mutex = 0
            buffer.append(item)
            mutex = 1
            full += 1
            desc = f"{actor} produced '{item}'. Buffer: {buffer}. (empty={empty}, full={full})"
            events.append(SimulationEvent(timestamp=i, event_type=EventType.SYNC_BUFFER_PRODUCE, entity_id=actor, description=desc))
        elif action == "consume":
            if full <= 0:
                desc = f"{actor} wants to consume but buffer is empty (full=0). BLOCKED."
                events.append(SimulationEvent(timestamp=i, event_type=EventType.SYNC_BLOCKED, entity_id=actor, description=desc))
                steps.append(SyncStep(step=i, actor=actor, action="blocked", buffer_state=list(buffer), semaphores={"empty": empty, "full": full, "mutex": mutex}, description=desc))
                continue

            full -= 1
            mutex = 0
            consumed = buffer.pop(0)
            mutex = 1
            empty += 1
            desc = f"{actor} consumed '{consumed}'. Buffer: {buffer}. (empty={empty}, full={full})"
            events.append(SimulationEvent(timestamp=i, event_type=EventType.SYNC_BUFFER_CONSUME, entity_id=actor, description=desc))
        else:
            desc = f"Unknown action '{action}' for {actor}."
            events.append(SimulationEvent(timestamp=i, event_type=EventType.SYNC_BLOCKED, entity_id=actor, description=desc))

        steps.append(SyncStep(step=i, actor=actor, action=action, buffer_state=list(buffer), semaphores={"empty": empty, "full": full, "mutex": mutex}, description=desc))

    return ProducerConsumerResult(buffer_size=buffer_size, steps=steps, events=events)


def dining_philosophers(
    num_philosophers: int = 5,
    action_sequence: list[dict] | None = None,
) -> DiningPhilosophersResult:
    """Simulate Dining Philosophers.

    action_sequence: list of {"philosopher": 0, "action": "pickup" | "putdown"}
    If None, runs a default demo sequence.
    """
    n = num_philosophers
    states = ["THINKING"] * n
    forks: list[str | None] = [None] * n
    steps: list[PhilosopherState] = []
    events: list[SimulationEvent] = []

    if action_sequence is None:
        # Default demo: each philosopher tries to pick up then eat then put down
        action_sequence = []
        for i in range(n):
            action_sequence.append({"philosopher": i, "action": "pickup"})
        for i in range(n):
            action_sequence.append({"philosopher": i, "action": "putdown"})

    for step_num, act in enumerate(action_sequence):
        p = act["philosopher"]
        action = act["action"]
        pid = f"P{p}"
        left = p
        right = (p + 1) % n

        if action == "pickup":
            if forks[left] is None and forks[right] is None:
                forks[left] = pid
                forks[right] = pid
                states[p] = "EATING"
                desc = f"Philosopher {p} picks up fork {left} (left) and fork {right} (right) and starts EATING."
                events.append(SimulationEvent(timestamp=step_num, event_type=EventType.SYNC_LOCK_ACQUIRED, entity_id=pid, description=desc))
            else:
                states[p] = "HUNGRY"
                blockers = []
                if forks[left] is not None:
                    blockers.append(f"fork {left} held by {forks[left]}")
                if forks[right] is not None:
                    blockers.append(f"fork {right} held by {forks[right]}")
                desc = f"Philosopher {p} is HUNGRY but cannot eat: {', '.join(blockers)}."
                events.append(SimulationEvent(timestamp=step_num, event_type=EventType.SYNC_BLOCKED, entity_id=pid, description=desc))
        elif action == "putdown":
            if states[p] == "EATING":
                forks[left] = None
                forks[right] = None
                states[p] = "THINKING"
                desc = f"Philosopher {p} puts down fork {left} and fork {right} and starts THINKING."
                events.append(SimulationEvent(timestamp=step_num, event_type=EventType.SYNC_LOCK_RELEASED, entity_id=pid, description=desc))
            else:
                desc = f"Philosopher {p} is not eating, nothing to put down."
                events.append(SimulationEvent(timestamp=step_num, event_type=EventType.SYNC_BLOCKED, entity_id=pid, description=desc))

        steps.append(PhilosopherState(
            step=step_num,
            philosophers=list(states),
            forks=list(forks),
            description=desc,
        ))

    return DiningPhilosophersResult(num_philosophers=n, steps=steps, events=events)
