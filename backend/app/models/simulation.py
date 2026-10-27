"""Shared simulation models used across all engines."""
from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class ProcessState(str, Enum):
    """Process lifecycle states."""
    NEW = "NEW"
    READY = "READY"
    RUNNING = "RUNNING"
    WAITING = "WAITING"
    TERMINATED = "TERMINATED"


class EventType(str, Enum):
    """Types of simulation events."""
    PROCESS_ARRIVAL = "PROCESS_ARRIVAL"
    PROCESS_SWITCH = "PROCESS_SWITCH"
    PROCESS_START = "PROCESS_START"
    PROCESS_COMPLETION = "PROCESS_COMPLETION"
    QUANTUM_EXPIRED = "QUANTUM_EXPIRED"
    CPU_IDLE = "CPU_IDLE"
    PAGE_FAULT = "PAGE_FAULT"
    PAGE_HIT = "PAGE_HIT"
    PAGE_REPLACEMENT = "PAGE_REPLACEMENT"
    MEMORY_ALLOCATION = "MEMORY_ALLOCATION"
    MEMORY_DEALLOCATION = "MEMORY_DEALLOCATION"
    MEMORY_ALLOCATION_FAILED = "MEMORY_ALLOCATION_FAILED"
    DEADLOCK_CHECK = "DEADLOCK_CHECK"
    RESOURCE_ALLOCATION = "RESOURCE_ALLOCATION"
    DISK_MOVEMENT = "DISK_MOVEMENT"
    DISK_REQUEST_SERVED = "DISK_REQUEST_SERVED"
    SYNC_LOCK_ACQUIRED = "SYNC_LOCK_ACQUIRED"
    SYNC_LOCK_RELEASED = "SYNC_LOCK_RELEASED"
    SYNC_BLOCKED = "SYNC_BLOCKED"
    SYNC_BUFFER_PRODUCE = "SYNC_BUFFER_PRODUCE"
    SYNC_BUFFER_CONSUME = "SYNC_BUFFER_CONSUME"


class SimulationEvent(BaseModel):
    """A single simulation event with full context."""
    timestamp: int
    event_type: EventType
    entity_id: str
    description: str
    metadata: dict[str, Any] = Field(default_factory=dict)


class GanttEntry(BaseModel):
    """One segment in a Gantt chart."""
    pid: str
    start: int
    end: int


class ProcessMetrics(BaseModel):
    """Per-process scheduling metrics."""
    pid: str
    arrival_time: int
    burst_time: int
    priority: int = 0
    completion_time: int = 0
    turnaround_time: int = 0
    waiting_time: int = 0
    response_time: int = -1


class SchedulingResult(BaseModel):
    """Full result from a CPU scheduling simulation."""
    algorithm: str
    gantt_chart: list[GanttEntry]
    metrics: list[ProcessMetrics]
    events: list[SimulationEvent]
    context_switches: int
    avg_turnaround_time: float
    avg_waiting_time: float
    avg_response_time: float
    cpu_utilization: float
    throughput: float
    total_time: int


class APIError(BaseModel):
    """Structured API error response."""
    code: str
    message: str
    field: str | None = None
