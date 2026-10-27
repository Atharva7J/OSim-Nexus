"""Memory Management Simulation Engine.

Implements: First Fit, Best Fit, Worst Fit, Next Fit.
"""
from __future__ import annotations

from pydantic import BaseModel
from app.models.simulation import EventType, SimulationEvent


class MemoryBlock(BaseModel):
    start: int
    size: int
    pid: str | None = None  # None = free

    @property
    def is_free(self) -> bool:
        return self.pid is None


class MemoryState(BaseModel):
    total_memory: int
    blocks: list[MemoryBlock]
    events: list[SimulationEvent]
    allocated_memory: int
    free_memory: int
    largest_free_block: int
    external_fragmentation: float
    allocation_failures: int


class MemoryManager:
    """Simulates contiguous memory allocation."""

    def __init__(self, total_memory: int):
        self.total_memory = total_memory
        self.blocks: list[MemoryBlock] = [MemoryBlock(start=0, size=total_memory)]
        self.events: list[SimulationEvent] = []
        self.step = 0
        self.allocation_failures = 0
        self._next_fit_index = 0

    def _merge_free(self):
        """Merge adjacent free blocks."""
        merged: list[MemoryBlock] = [self.blocks[0]]
        for b in self.blocks[1:]:
            if merged[-1].is_free and b.is_free:
                merged[-1] = MemoryBlock(start=merged[-1].start, size=merged[-1].size + b.size)
            else:
                merged.append(b)
        self.blocks = merged

    def allocate(self, pid: str, size: int, algorithm: str = "first_fit") -> bool:
        """Allocate memory using the specified algorithm."""
        self.step += 1
        free_blocks = [(i, b) for i, b in enumerate(self.blocks) if b.is_free and b.size >= size]

        idx: int | None = None
        if algorithm == "first_fit":
            if free_blocks:
                idx = free_blocks[0][0]
        elif algorithm == "best_fit":
            if free_blocks:
                idx = min(free_blocks, key=lambda x: x[1].size)[0]
        elif algorithm == "worst_fit":
            if free_blocks:
                idx = max(free_blocks, key=lambda x: x[1].size)[0]
        elif algorithm == "next_fit":
            # Start searching from _next_fit_index
            n = len(self.blocks)
            for offset in range(n):
                i = (self._next_fit_index + offset) % n
                b = self.blocks[i]
                if b.is_free and b.size >= size:
                    idx = i
                    self._next_fit_index = (i + 1) % n
                    break

        if idx is None:
            self.allocation_failures += 1
            self.events.append(SimulationEvent(
                timestamp=self.step,
                event_type=EventType.MEMORY_ALLOCATION_FAILED,
                entity_id=pid,
                description=f"Failed to allocate {size} units for {pid} using {algorithm}. No suitable free block found.",
            ))
            return False

        block = self.blocks[idx]
        # Split
        if block.size > size:
            allocated = MemoryBlock(start=block.start, size=size, pid=pid)
            remaining = MemoryBlock(start=block.start + size, size=block.size - size)
            self.blocks[idx:idx + 1] = [allocated, remaining]
        else:
            self.blocks[idx] = MemoryBlock(start=block.start, size=block.size, pid=pid)

        self.events.append(SimulationEvent(
            timestamp=self.step,
            event_type=EventType.MEMORY_ALLOCATION,
            entity_id=pid,
            description=f"Allocated {size} units for {pid} at position {block.start} using {algorithm}.",
            metadata={"start": block.start, "size": size, "algorithm": algorithm},
        ))
        return True

    def deallocate(self, pid: str) -> bool:
        """Deallocate all memory blocks for a process."""
        self.step += 1
        found = False
        for i, b in enumerate(self.blocks):
            if b.pid == pid:
                self.blocks[i] = MemoryBlock(start=b.start, size=b.size)
                found = True

        if found:
            self._merge_free()
            self.events.append(SimulationEvent(
                timestamp=self.step,
                event_type=EventType.MEMORY_DEALLOCATION,
                entity_id=pid,
                description=f"Deallocated memory for {pid}. Adjacent free blocks merged.",
            ))
        return found

    def get_state(self) -> MemoryState:
        allocated = sum(b.size for b in self.blocks if not b.is_free)
        free = self.total_memory - allocated
        free_blocks = [b for b in self.blocks if b.is_free]
        largest = max((b.size for b in free_blocks), default=0)
        num_free_blocks = len(free_blocks)
        ext_frag = round(1.0 - (largest / free), 4) if free > 0 else 0.0

        return MemoryState(
            total_memory=self.total_memory,
            blocks=list(self.blocks),
            events=list(self.events),
            allocated_memory=allocated,
            free_memory=free,
            largest_free_block=largest,
            external_fragmentation=ext_frag,
            allocation_failures=self.allocation_failures,
        )
