"""Page Replacement Simulation Engine.

Implements: FIFO, LRU, Optimal, Second Chance (Clock).
"""
from __future__ import annotations

from app.models.simulation import EventType, SimulationEvent
from pydantic import BaseModel


class PageReplacementResult(BaseModel):
    """Result from a page replacement simulation."""
    algorithm: str
    frames_over_time: list[list[int | None]]
    page_faults: int
    page_hits: int
    hit_ratio: float
    fault_ratio: float
    events: list[SimulationEvent]
    reference_string: list[int]
    num_frames: int


def fifo(reference_string: list[int], num_frames: int) -> PageReplacementResult:
    """FIFO page replacement."""
    frames: list[int | None] = [None] * num_frames
    frames_history: list[list[int | None]] = []
    events: list[SimulationEvent] = []
    queue: list[int] = []  # track insertion order
    faults = 0
    hits = 0

    for step, page in enumerate(reference_string):
        if page in frames:
            hits += 1
            events.append(SimulationEvent(timestamp=step, event_type=EventType.PAGE_HIT, entity_id=str(page), description=f"Page {page} found in frames (HIT). No replacement needed."))
        else:
            faults += 1
            if None in frames:
                idx = frames.index(None)
                frames[idx] = page
                queue.append(page)
                events.append(SimulationEvent(timestamp=step, event_type=EventType.PAGE_FAULT, entity_id=str(page), description=f"Page {page} not in frames (FAULT). Loaded into empty frame {idx}."))
            else:
                victim = queue.pop(0)
                idx = frames.index(victim)
                events.append(SimulationEvent(timestamp=step, event_type=EventType.PAGE_REPLACEMENT, entity_id=str(page), description=f"Page {page} not in frames (FAULT). FIFO evicts page {victim} (oldest in frames) from frame {idx}.", metadata={"victim": victim, "frame": idx}))
                frames[idx] = page
                queue.append(page)
        frames_history.append(list(frames))

    total = len(reference_string)
    return PageReplacementResult(algorithm="FIFO", frames_over_time=frames_history, page_faults=faults, page_hits=hits, hit_ratio=round(hits / total, 4) if total else 0, fault_ratio=round(faults / total, 4) if total else 0, events=events, reference_string=reference_string, num_frames=num_frames)


def lru(reference_string: list[int], num_frames: int) -> PageReplacementResult:
    """Least Recently Used page replacement."""
    frames: list[int | None] = [None] * num_frames
    frames_history: list[list[int | None]] = []
    events: list[SimulationEvent] = []
    last_used: dict[int, int] = {}
    faults = 0
    hits = 0

    for step, page in enumerate(reference_string):
        if page in frames:
            hits += 1
            last_used[page] = step
            events.append(SimulationEvent(timestamp=step, event_type=EventType.PAGE_HIT, entity_id=str(page), description=f"Page {page} found in frames (HIT)."))
        else:
            faults += 1
            if None in frames:
                idx = frames.index(None)
                frames[idx] = page
                last_used[page] = step
                events.append(SimulationEvent(timestamp=step, event_type=EventType.PAGE_FAULT, entity_id=str(page), description=f"Page {page} not in frames (FAULT). Loaded into empty frame {idx}."))
            else:
                # Find LRU page
                lru_page = min((p for p in frames if p is not None), key=lambda p: last_used[p])
                idx = frames.index(lru_page)
                events.append(SimulationEvent(timestamp=step, event_type=EventType.PAGE_REPLACEMENT, entity_id=str(page), description=f"Page {page} not in frames (FAULT). LRU evicts page {lru_page} (last used at step {last_used[lru_page]}) from frame {idx}.", metadata={"victim": lru_page, "frame": idx}))
                del last_used[lru_page]
                frames[idx] = page
                last_used[page] = step
        frames_history.append(list(frames))

    total = len(reference_string)
    return PageReplacementResult(algorithm="LRU", frames_over_time=frames_history, page_faults=faults, page_hits=hits, hit_ratio=round(hits / total, 4) if total else 0, fault_ratio=round(faults / total, 4) if total else 0, events=events, reference_string=reference_string, num_frames=num_frames)


def optimal(reference_string: list[int], num_frames: int) -> PageReplacementResult:
    """Optimal (Belady's) page replacement. Requires future knowledge."""
    frames: list[int | None] = [None] * num_frames
    frames_history: list[list[int | None]] = []
    events: list[SimulationEvent] = []
    faults = 0
    hits = 0

    for step, page in enumerate(reference_string):
        if page in frames:
            hits += 1
            events.append(SimulationEvent(timestamp=step, event_type=EventType.PAGE_HIT, entity_id=str(page), description=f"Page {page} found in frames (HIT)."))
        else:
            faults += 1
            if None in frames:
                idx = frames.index(None)
                frames[idx] = page
                events.append(SimulationEvent(timestamp=step, event_type=EventType.PAGE_FAULT, entity_id=str(page), description=f"Page {page} not in frames (FAULT). Loaded into empty frame {idx}."))
            else:
                # Find page used farthest in the future
                future_uses: dict[int, int] = {}
                for p in frames:
                    if p is None:
                        continue
                    try:
                        future_uses[p] = reference_string[step + 1:].index(p)
                    except ValueError:
                        future_uses[p] = float('inf')

                victim = max(future_uses, key=lambda p: future_uses[p])
                idx = frames.index(victim)
                fu = future_uses[victim]
                fu_desc = "never used again" if fu == float('inf') else f"next used {fu} steps ahead"
                events.append(SimulationEvent(timestamp=step, event_type=EventType.PAGE_REPLACEMENT, entity_id=str(page), description=f"Page {page} not in frames (FAULT). Optimal evicts page {victim} ({fu_desc}) from frame {idx}.", metadata={"victim": victim, "frame": idx}))
                frames[idx] = page
        frames_history.append(list(frames))

    total = len(reference_string)
    return PageReplacementResult(algorithm="Optimal", frames_over_time=frames_history, page_faults=faults, page_hits=hits, hit_ratio=round(hits / total, 4) if total else 0, fault_ratio=round(faults / total, 4) if total else 0, events=events, reference_string=reference_string, num_frames=num_frames)


def second_chance(reference_string: list[int], num_frames: int) -> PageReplacementResult:
    """Second Chance (Clock) page replacement."""
    frames: list[int | None] = [None] * num_frames
    reference_bits: list[int] = [0] * num_frames
    frames_history: list[list[int | None]] = []
    events: list[SimulationEvent] = []
    pointer = 0
    faults = 0
    hits = 0

    for step, page in enumerate(reference_string):
        if page in frames:
            hits += 1
            idx = frames.index(page)
            reference_bits[idx] = 1
            events.append(SimulationEvent(timestamp=step, event_type=EventType.PAGE_HIT, entity_id=str(page), description=f"Page {page} found in frame {idx} (HIT). Reference bit set to 1."))
        else:
            faults += 1
            if None in frames:
                idx = frames.index(None)
                frames[idx] = page
                reference_bits[idx] = 1
                events.append(SimulationEvent(timestamp=step, event_type=EventType.PAGE_FAULT, entity_id=str(page), description=f"Page {page} not in frames (FAULT). Loaded into empty frame {idx}."))
            else:
                while True:
                    if reference_bits[pointer] == 0:
                        victim = frames[pointer]
                        events.append(SimulationEvent(timestamp=step, event_type=EventType.PAGE_REPLACEMENT, entity_id=str(page), description=f"Page {page} not in frames (FAULT). Clock hand at frame {pointer}: page {victim} has reference bit 0, evicted.", metadata={"victim": victim, "frame": pointer}))
                        frames[pointer] = page
                        reference_bits[pointer] = 1
                        pointer = (pointer + 1) % num_frames
                        break
                    else:
                        reference_bits[pointer] = 0
                        pointer = (pointer + 1) % num_frames
        frames_history.append(list(frames))

    total = len(reference_string)
    return PageReplacementResult(algorithm="Second Chance", frames_over_time=frames_history, page_faults=faults, page_hits=hits, hit_ratio=round(hits / total, 4) if total else 0, fault_ratio=round(faults / total, 4) if total else 0, events=events, reference_string=reference_string, num_frames=num_frames)


PAGE_ALGORITHMS = {
    "fifo": fifo,
    "lru": lru,
    "optimal": optimal,
    "second_chance": second_chance,
}


def run_page_replacement(algorithm: str, reference_string: list[int], num_frames: int) -> PageReplacementResult:
    fn = PAGE_ALGORITHMS.get(algorithm)
    if fn is None:
        raise ValueError(f"Unknown algorithm: {algorithm}")
    return fn(reference_string, num_frames)
