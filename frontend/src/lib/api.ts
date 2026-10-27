/* API Client for OSim Nexus Backend */

const BASE_URL = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail?.error?.message || err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

/* ── CPU Scheduling ── */
export interface ProcessInput {
  pid: string;
  arrival_time: number;
  burst_time: number;
  priority: number;
}

export interface GanttEntry {
  pid: string;
  start: number;
  end: number;
}

export interface ProcessMetrics {
  pid: string;
  arrival_time: number;
  burst_time: number;
  priority: number;
  completion_time: number;
  turnaround_time: number;
  waiting_time: number;
  response_time: number;
}

export interface SimulationEvent {
  timestamp: number;
  event_type: string;
  entity_id: string;
  description: string;
  metadata: Record<string, unknown>;
}

export interface SchedulingResult {
  algorithm: string;
  gantt_chart: GanttEntry[];
  metrics: ProcessMetrics[];
  events: SimulationEvent[];
  context_switches: number;
  avg_turnaround_time: number;
  avg_waiting_time: number;
  avg_response_time: number;
  cpu_utilization: number;
  throughput: number;
  total_time: number;
}

export function runCpuScheduling(
  algorithm: string,
  processes: ProcessInput[],
  time_quantum: number = 2
): Promise<SchedulingResult> {
  return request('/cpu/schedule', {
    method: 'POST',
    body: JSON.stringify({ algorithm, processes, time_quantum }),
  });
}

export function compareCpuScheduling(
  algorithms: string[],
  processes: ProcessInput[],
  time_quantum: number = 2
): Promise<Record<string, SchedulingResult>> {
  return request('/cpu/compare', {
    method: 'POST',
    body: JSON.stringify({ algorithms, processes, time_quantum }),
  });
}

/* ── Page Replacement ── */
export interface PageReplacementResult {
  algorithm: string;
  frames_over_time: (number | null)[][];
  page_faults: number;
  page_hits: number;
  hit_ratio: number;
  fault_ratio: number;
  events: SimulationEvent[];
  reference_string: number[];
  num_frames: number;
}

export function runPaging(
  algorithm: string,
  reference_string: number[],
  num_frames: number
): Promise<PageReplacementResult> {
  return request('/paging/simulate', {
    method: 'POST',
    body: JSON.stringify({ algorithm, reference_string, num_frames }),
  });
}

export function comparePaging(
  algorithms: string[],
  reference_string: number[],
  num_frames: number
): Promise<Record<string, PageReplacementResult>> {
  return request('/paging/compare', {
    method: 'POST',
    body: JSON.stringify({ algorithms, reference_string, num_frames }),
  });
}

/* ── Memory Management ── */
export interface MemoryBlock {
  start: number;
  size: number;
  pid: string | null;
}

export interface MemoryState {
  total_memory: number;
  blocks: MemoryBlock[];
  events: SimulationEvent[];
  allocated_memory: number;
  free_memory: number;
  largest_free_block: number;
  external_fragmentation: number;
  allocation_failures: number;
}

export interface MemorySimulationResult {
  algorithm: string;
  snapshots: MemoryState[];
  final_state: MemoryState;
}

export function runMemorySimulation(
  total_memory: number,
  algorithm: string,
  operations: { type: string; pid?: string; size?: number }[]
): Promise<MemorySimulationResult> {
  return request('/memory/simulate', {
    method: 'POST',
    body: JSON.stringify({ total_memory, algorithm, operations }),
  });
}

/* ── Deadlock ── */
export interface BankerState {
  num_processes: number;
  num_resources: number;
  available: number[];
  maximum: number[][];
  allocation: number[][];
  need: number[][];
  is_safe: boolean;
  safe_sequence: string[];
  events: SimulationEvent[];
}

export function runBankers(
  available: number[],
  maximum: number[][],
  allocation: number[][],
  process_ids?: string[]
): Promise<BankerState> {
  return request('/deadlock/bankers', {
    method: 'POST',
    body: JSON.stringify({ available, maximum, allocation, process_ids }),
  });
}

export interface DeadlockDetectionResult {
  is_deadlocked: boolean;
  deadlocked_processes: string[];
  events: SimulationEvent[];
}

export function runDeadlockDetection(
  available: number[],
  allocation: number[][],
  request_matrix: number[][],
  process_ids?: string[]
): Promise<DeadlockDetectionResult> {
  return request('/deadlock/detect', {
    method: 'POST',
    body: JSON.stringify({ available, allocation, request: request_matrix, process_ids }),
  });
}

/* ── Disk Scheduling ── */
export interface DiskSchedulingResult {
  algorithm: string;
  seek_sequence: number[];
  total_head_movement: number;
  average_seek_distance: number;
  events: SimulationEvent[];
  initial_head: number;
  request_queue: number[];
  disk_size: number;
  direction: string;
}

export function runDiskScheduling(
  algorithm: string,
  request_queue: number[],
  initial_head: number,
  disk_size: number,
  direction: string = 'right'
): Promise<DiskSchedulingResult> {
  return request('/disk/simulate', {
    method: 'POST',
    body: JSON.stringify({ algorithm, request_queue, initial_head, disk_size, direction }),
  });
}

export function compareDiskScheduling(
  algorithms: string[],
  request_queue: number[],
  initial_head: number,
  disk_size: number,
  direction: string = 'right'
): Promise<Record<string, DiskSchedulingResult>> {
  return request('/disk/compare', {
    method: 'POST',
    body: JSON.stringify({ algorithms, request_queue, initial_head, disk_size, direction }),
  });
}

/* ── Synchronization ── */
export interface SyncStep {
  step: number;
  actor: string;
  action: string;
  buffer_state: string[];
  semaphores: Record<string, number>;
  description: string;
}

export interface ProducerConsumerResult {
  buffer_size: number;
  steps: SyncStep[];
  events: SimulationEvent[];
}

export function runProducerConsumer(
  actions: { actor: string; action: string; item?: string }[],
  buffer_size: number = 5
): Promise<ProducerConsumerResult> {
  return request('/sync/producer-consumer', {
    method: 'POST',
    body: JSON.stringify({ buffer_size, actions }),
  });
}

export interface PhilosopherState {
  step: number;
  philosophers: string[];
  forks: (string | null)[];
  description: string;
}

export interface DiningPhilosophersResult {
  num_philosophers: number;
  steps: PhilosopherState[];
  events: SimulationEvent[];
}

export function runDiningPhilosophers(
  num_philosophers: number = 5,
  action_sequence?: { philosopher: number; action: string }[]
): Promise<DiningPhilosophersResult> {
  return request('/sync/dining-philosophers', {
    method: 'POST',
    body: JSON.stringify({ num_philosophers, action_sequence }),
  });
}

/* ── Health ── */
export function healthCheck(): Promise<{ status: string; service: string; version: string }> {
  return request('/health');
}
