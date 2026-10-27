"""CPU Scheduling Simulation Engine.

Implements: FCFS, SJF, SRTF, Round Robin, Priority (Non-Preemptive & Preemptive).
All algorithms are deterministic and produce reproducible results.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from app.models.simulation import (
    EventType,
    GanttEntry,
    ProcessMetrics,
    SchedulingResult,
    SimulationEvent,
)


@dataclass
class Process:
    """Internal mutable process representation for the scheduling engine."""
    pid: str
    arrival_time: int
    burst_time: int
    priority: int = 0
    remaining_time: int = 0
    start_time: int = -1
    completion_time: int = 0
    waiting_time: int = 0
    response_time: int = -1

    def __post_init__(self):
        self.remaining_time = self.burst_time


def _make_event(time: int, event_type: EventType, pid: str, desc: str, **meta) -> SimulationEvent:
    return SimulationEvent(
        timestamp=time,
        event_type=event_type,
        entity_id=pid,
        description=desc,
        metadata=meta,
    )


def _build_result(
    algorithm: str,
    gantt: list[GanttEntry],
    processes: list[Process],
    events: list[SimulationEvent],
    context_switches: int,
    total_time: int,
) -> SchedulingResult:
    n = len(processes)
    if n == 0:
        return SchedulingResult(
            algorithm=algorithm,
            gantt_chart=[],
            metrics=[],
            events=events,
            context_switches=0,
            avg_turnaround_time=0.0,
            avg_waiting_time=0.0,
            avg_response_time=0.0,
            cpu_utilization=0.0,
            throughput=0.0,
            total_time=0,
        )

    metrics = []
    total_burst = 0
    for p in processes:
        tat = p.completion_time - p.arrival_time
        wt = tat - p.burst_time
        metrics.append(
            ProcessMetrics(
                pid=p.pid,
                arrival_time=p.arrival_time,
                burst_time=p.burst_time,
                priority=p.priority,
                completion_time=p.completion_time,
                turnaround_time=tat,
                waiting_time=wt,
                response_time=p.response_time,
            )
        )
        total_burst += p.burst_time

    avg_tat = sum(m.turnaround_time for m in metrics) / n
    avg_wt = sum(m.waiting_time for m in metrics) / n
    avg_rt = sum(m.response_time for m in metrics) / n
    cpu_util = (total_burst / total_time * 100) if total_time > 0 else 0.0
    throughput = n / total_time if total_time > 0 else 0.0

    return SchedulingResult(
        algorithm=algorithm,
        gantt_chart=gantt,
        metrics=metrics,
        events=events,
        context_switches=context_switches,
        avg_turnaround_time=round(avg_tat, 2),
        avg_waiting_time=round(avg_wt, 2),
        avg_response_time=round(avg_rt, 2),
        cpu_utilization=round(cpu_util, 2),
        throughput=round(throughput, 4),
        total_time=total_time,
    )


def _merge_gantt(gantt: list[GanttEntry]) -> list[GanttEntry]:
    """Merge consecutive Gantt entries with the same PID."""
    if not gantt:
        return gantt
    merged: list[GanttEntry] = [gantt[0]]
    for entry in gantt[1:]:
        if merged[-1].pid == entry.pid:
            merged[-1] = GanttEntry(pid=merged[-1].pid, start=merged[-1].start, end=entry.end)
        else:
            merged.append(entry)
    return merged


# ─── FCFS ────────────────────────────────────────────────────────────────────

def fcfs(processes_input: list[dict]) -> SchedulingResult:
    """First Come First Served scheduling."""
    processes = [Process(**p) for p in processes_input]
    processes.sort(key=lambda p: (p.arrival_time, p.pid))

    time = 0
    gantt: list[GanttEntry] = []
    events: list[SimulationEvent] = []
    context_switches = 0
    prev_pid: str | None = None

    for p in processes:
        if time < p.arrival_time:
            events.append(_make_event(time, EventType.CPU_IDLE, "CPU", f"CPU idle from {time} to {p.arrival_time}. No process in ready queue."))
            gantt.append(GanttEntry(pid="IDLE", start=time, end=p.arrival_time))
            time = p.arrival_time

        events.append(_make_event(time, EventType.PROCESS_ARRIVAL, p.pid, f"At time {time}, {p.pid} begins execution. FCFS selects the process that arrived earliest (arrival={p.arrival_time})."))

        if prev_pid is not None and prev_pid != p.pid:
            context_switches += 1
            events.append(_make_event(time, EventType.PROCESS_SWITCH, p.pid, f"Context switch from {prev_pid} to {p.pid}."))

        p.start_time = time
        p.response_time = time - p.arrival_time
        start = time
        time += p.burst_time
        p.completion_time = time
        gantt.append(GanttEntry(pid=p.pid, start=start, end=time))
        events.append(_make_event(time, EventType.PROCESS_COMPLETION, p.pid, f"{p.pid} completed at time {time}. Turnaround = {p.completion_time - p.arrival_time}, Waiting = {p.completion_time - p.arrival_time - p.burst_time}."))
        prev_pid = p.pid

    return _build_result("FCFS", gantt, processes, events, context_switches, time)


# ─── SJF (Non-Preemptive) ───────────────────────────────────────────────────

def sjf(processes_input: list[dict]) -> SchedulingResult:
    """Shortest Job First (Non-Preemptive) scheduling."""
    processes = [Process(**p) for p in processes_input]
    remaining = list(processes)
    completed: list[Process] = []

    time = 0
    gantt: list[GanttEntry] = []
    events: list[SimulationEvent] = []
    context_switches = 0
    prev_pid: str | None = None

    while remaining:
        ready = [p for p in remaining if p.arrival_time <= time]
        if not ready:
            next_arrival = min(p.arrival_time for p in remaining)
            events.append(_make_event(time, EventType.CPU_IDLE, "CPU", f"CPU idle from {time} to {next_arrival}. No process available."))
            gantt.append(GanttEntry(pid="IDLE", start=time, end=next_arrival))
            time = next_arrival
            continue

        # SJF: pick shortest burst, break ties by arrival, then PID
        ready.sort(key=lambda p: (p.burst_time, p.arrival_time, p.pid))
        p = ready[0]

        ready_pids = [r.pid for r in ready]
        events.append(_make_event(time, EventType.PROCESS_START, p.pid, f"At time {time}, SJF selects {p.pid} (burst={p.burst_time}) — shortest burst among ready processes {ready_pids}."))

        if prev_pid is not None and prev_pid != p.pid:
            context_switches += 1

        p.start_time = time
        p.response_time = time - p.arrival_time
        start = time
        time += p.burst_time
        p.completion_time = time
        gantt.append(GanttEntry(pid=p.pid, start=start, end=time))
        events.append(_make_event(time, EventType.PROCESS_COMPLETION, p.pid, f"{p.pid} completed at time {time}. Turnaround = {p.completion_time - p.arrival_time}."))
        remaining.remove(p)
        completed.append(p)
        prev_pid = p.pid

    return _build_result("SJF", gantt, completed, events, context_switches, time)


# ─── SRTF (Preemptive SJF) ──────────────────────────────────────────────────

def srtf(processes_input: list[dict]) -> SchedulingResult:
    """Shortest Remaining Time First (Preemptive SJF) scheduling."""
    processes = [Process(**p) for p in processes_input]
    n = len(processes)
    completed = 0
    time = 0
    gantt: list[GanttEntry] = []
    events: list[SimulationEvent] = []
    context_switches = 0
    prev_pid: str | None = None

    while completed < n:
        ready = [p for p in processes if p.arrival_time <= time and p.remaining_time > 0]
        if not ready:
            next_arrival = min(p.arrival_time for p in processes if p.remaining_time > 0)
            events.append(_make_event(time, EventType.CPU_IDLE, "CPU", f"CPU idle from {time} to {next_arrival}."))
            gantt.append(GanttEntry(pid="IDLE", start=time, end=next_arrival))
            time = next_arrival
            continue

        # SRTF: pick smallest remaining, break ties by arrival, then PID
        ready.sort(key=lambda p: (p.remaining_time, p.arrival_time, p.pid))
        p = ready[0]

        if prev_pid is not None and prev_pid != p.pid:
            context_switches += 1
            events.append(_make_event(time, EventType.PROCESS_SWITCH, p.pid, f"At time {time}, SRTF preempts to {p.pid} (remaining={p.remaining_time}) — smallest remaining time among ready processes."))

        if p.response_time == -1:
            p.response_time = time - p.arrival_time
            p.start_time = time

        gantt.append(GanttEntry(pid=p.pid, start=time, end=time + 1))
        p.remaining_time -= 1
        time += 1

        if p.remaining_time == 0:
            p.completion_time = time
            completed += 1
            events.append(_make_event(time, EventType.PROCESS_COMPLETION, p.pid, f"{p.pid} completed at time {time}. Turnaround = {p.completion_time - p.arrival_time}."))

        prev_pid = p.pid

    gantt = _merge_gantt(gantt)
    return _build_result("SRTF", gantt, processes, events, context_switches, time)


# ─── Round Robin ─────────────────────────────────────────────────────────────

def round_robin(processes_input: list[dict], time_quantum: int) -> SchedulingResult:
    """Round Robin scheduling with configurable time quantum."""
    processes = [Process(**p) for p in processes_input]
    processes.sort(key=lambda p: (p.arrival_time, p.pid))

    from collections import deque
    time = 0
    gantt: list[GanttEntry] = []
    events: list[SimulationEvent] = []
    context_switches = 0
    prev_pid: str | None = None

    queue: deque[Process] = deque()
    remaining = list(processes)
    arrived_set: set[str] = set()
    completed = 0
    n = len(processes)

    # Enqueue all processes arriving at time 0
    for p in remaining:
        if p.arrival_time <= time and p.pid not in arrived_set:
            queue.append(p)
            arrived_set.add(p.pid)

    while completed < n:
        if not queue:
            future = [p for p in remaining if p.pid not in arrived_set]
            if not future:
                # All remaining are already completed or something went wrong
                break
            next_arrival = min(p.arrival_time for p in future)
            events.append(_make_event(time, EventType.CPU_IDLE, "CPU", f"CPU idle from {time} to {next_arrival}."))
            gantt.append(GanttEntry(pid="IDLE", start=time, end=next_arrival))
            time = next_arrival
            for p in remaining:
                if p.arrival_time <= time and p.pid not in arrived_set:
                    queue.append(p)
                    arrived_set.add(p.pid)
            continue

        p = queue.popleft()

        if prev_pid is not None and prev_pid != p.pid:
            context_switches += 1

        if p.response_time == -1:
            p.response_time = time - p.arrival_time
            p.start_time = time

        exec_time = min(time_quantum, p.remaining_time)
        start = time
        time += exec_time
        p.remaining_time -= exec_time
        gantt.append(GanttEntry(pid=p.pid, start=start, end=time))

        # Enqueue new arrivals during this execution slice (before re-enqueuing current)
        for rp in remaining:
            if rp.arrival_time > start and rp.arrival_time <= time and rp.pid not in arrived_set:
                queue.append(rp)
                arrived_set.add(rp.pid)

        if p.remaining_time == 0:
            p.completion_time = time
            completed += 1
            events.append(_make_event(time, EventType.PROCESS_COMPLETION, p.pid, f"{p.pid} completed at time {time} after using {exec_time} units. Turnaround = {p.completion_time - p.arrival_time}."))
        else:
            events.append(_make_event(time, EventType.QUANTUM_EXPIRED, p.pid, f"Time quantum expired for {p.pid} at time {time}. Remaining burst = {p.remaining_time}. {p.pid} moves back to the ready queue."))
            queue.append(p)

        prev_pid = p.pid

    gantt = _merge_gantt(gantt)
    return _build_result("Round Robin", gantt, processes, events, context_switches, time)


# ─── Priority (Non-Preemptive) ──────────────────────────────────────────────

def priority_non_preemptive(processes_input: list[dict]) -> SchedulingResult:
    """Priority scheduling (non-preemptive). Lower priority number = higher priority."""
    processes = [Process(**p) for p in processes_input]
    remaining = list(processes)
    completed: list[Process] = []

    time = 0
    gantt: list[GanttEntry] = []
    events: list[SimulationEvent] = []
    context_switches = 0
    prev_pid: str | None = None

    while remaining:
        ready = [p for p in remaining if p.arrival_time <= time]
        if not ready:
            next_arrival = min(p.arrival_time for p in remaining)
            events.append(_make_event(time, EventType.CPU_IDLE, "CPU", f"CPU idle from {time} to {next_arrival}."))
            gantt.append(GanttEntry(pid="IDLE", start=time, end=next_arrival))
            time = next_arrival
            continue

        # Lower number = higher priority. Break ties by arrival, then PID.
        ready.sort(key=lambda p: (p.priority, p.arrival_time, p.pid))
        p = ready[0]

        events.append(_make_event(time, EventType.PROCESS_START, p.pid, f"At time {time}, Priority selects {p.pid} (priority={p.priority}) — highest priority (lowest number) among ready processes."))

        if prev_pid is not None and prev_pid != p.pid:
            context_switches += 1

        p.start_time = time
        p.response_time = time - p.arrival_time
        start = time
        time += p.burst_time
        p.completion_time = time
        gantt.append(GanttEntry(pid=p.pid, start=start, end=time))
        events.append(_make_event(time, EventType.PROCESS_COMPLETION, p.pid, f"{p.pid} completed at time {time}."))
        remaining.remove(p)
        completed.append(p)
        prev_pid = p.pid

    return _build_result("Priority (Non-Preemptive)", gantt, completed, events, context_switches, time)


# ─── Priority (Preemptive) ──────────────────────────────────────────────────

def priority_preemptive(processes_input: list[dict]) -> SchedulingResult:
    """Priority scheduling (preemptive). Lower priority number = higher priority."""
    processes = [Process(**p) for p in processes_input]
    n = len(processes)
    completed = 0
    time = 0
    gantt: list[GanttEntry] = []
    events: list[SimulationEvent] = []
    context_switches = 0
    prev_pid: str | None = None

    while completed < n:
        ready = [p for p in processes if p.arrival_time <= time and p.remaining_time > 0]
        if not ready:
            next_arrival = min(p.arrival_time for p in processes if p.remaining_time > 0)
            events.append(_make_event(time, EventType.CPU_IDLE, "CPU", f"CPU idle from {time} to {next_arrival}."))
            gantt.append(GanttEntry(pid="IDLE", start=time, end=next_arrival))
            time = next_arrival
            continue

        ready.sort(key=lambda p: (p.priority, p.arrival_time, p.pid))
        p = ready[0]

        if prev_pid is not None and prev_pid != p.pid:
            context_switches += 1
            events.append(_make_event(time, EventType.PROCESS_SWITCH, p.pid, f"At time {time}, Priority (Preemptive) switches to {p.pid} (priority={p.priority})."))

        if p.response_time == -1:
            p.response_time = time - p.arrival_time
            p.start_time = time

        gantt.append(GanttEntry(pid=p.pid, start=time, end=time + 1))
        p.remaining_time -= 1
        time += 1

        if p.remaining_time == 0:
            p.completion_time = time
            completed += 1
            events.append(_make_event(time, EventType.PROCESS_COMPLETION, p.pid, f"{p.pid} completed at time {time}."))

        prev_pid = p.pid

    gantt = _merge_gantt(gantt)
    return _build_result("Priority (Preemptive)", gantt, processes, events, context_switches, time)


# ─── Dispatcher ──────────────────────────────────────────────────────────────

ALGORITHMS = {
    "fcfs": fcfs,
    "sjf": sjf,
    "srtf": srtf,
    "round_robin": round_robin,
    "priority_np": priority_non_preemptive,
    "priority_p": priority_preemptive,
}


def run_scheduling(algorithm: str, processes: list[dict], time_quantum: int = 2) -> SchedulingResult:
    """Dispatch to the appropriate scheduling algorithm."""
    if algorithm == "round_robin":
        return round_robin(processes, time_quantum)
    fn = ALGORITHMS.get(algorithm)
    if fn is None:
        raise ValueError(f"Unknown algorithm: {algorithm}")
    return fn(processes)
