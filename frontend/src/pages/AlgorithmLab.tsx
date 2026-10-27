import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, FlaskConical, Loader2, Cpu, Layers, Disc } from 'lucide-react';
import {
  compareCpuScheduling,
  comparePaging,
  compareDiskScheduling,
  type ProcessInput,
  type SchedulingResult,
  type PageReplacementResult,
  type DiskSchedulingResult,
} from '../lib/api';

const CPU_ALGORITHMS = [
  { value: 'fcfs', label: 'FCFS' },
  { value: 'sjf', label: 'SJF' },
  { value: 'srtf', label: 'SRTF' },
  { value: 'round_robin', label: 'Round Robin' },
  { value: 'priority_np', label: 'Priority (NP)' },
  { value: 'priority_p', label: 'Priority (P)' },
];

const PAGING_ALGORITHMS = [
  { value: 'fifo', label: 'FIFO' },
  { value: 'lru', label: 'LRU (Least Recently Used)' },
  { value: 'optimal', label: 'Optimal (Bélády)' },
  { value: 'second_chance', label: 'Second Chance (Clock)' },
];

const DISK_ALGORITHMS = [
  { value: 'fcfs', label: 'FCFS' },
  { value: 'sstf', label: 'SSTF' },
  { value: 'scan', label: 'SCAN (Elevator)' },
  { value: 'c_scan', label: 'C-SCAN' },
  { value: 'look', label: 'LOOK' },
  { value: 'c_look', label: 'C-LOOK' },
];

const GANTT_COLORS = ['#22d3ee', '#a78bfa', '#34d399', '#fbbf24', '#fb7185', '#818cf8'];

export default function AlgorithmLab() {
  const [labCategory, setLabCategory] = useState<'cpu' | 'paging' | 'disk'>('cpu');

  // ── CPU Scheduling Comparison State ──
  const [cpuSelectedAlgos, setCpuSelectedAlgos] = useState(['fcfs', 'sjf', 'srtf', 'round_robin']);
  const [timeQuantum, setTimeQuantum] = useState(3);
  const [processes] = useState<ProcessInput[]>([
    { pid: 'P1', arrival_time: 0, burst_time: 8, priority: 3 },
    { pid: 'P2', arrival_time: 1, burst_time: 4, priority: 1 },
    { pid: 'P3', arrival_time: 2, burst_time: 2, priority: 2 },
    { pid: 'P4', arrival_time: 3, burst_time: 6, priority: 0 },
  ]);
  const [cpuResults, setCpuResults] = useState<Record<string, SchedulingResult> | null>(null);
  const [cpuLoading, setCpuLoading] = useState(false);

  // ── Paging Comparison State ──
  const [pagingSelectedAlgos, setPagingSelectedAlgos] = useState(['fifo', 'lru', 'optimal', 'second_chance']);
  const [refString, setRefString] = useState('7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1');
  const [numFrames, setNumFrames] = useState(3);
  const [pagingResults, setPagingResults] = useState<Record<string, PageReplacementResult> | null>(null);
  const [pagingLoading, setPagingLoading] = useState(false);

  // ── Disk Comparison State ──
  const [diskSelectedAlgos, setDiskSelectedAlgos] = useState(['fcfs', 'sstf', 'scan', 'c_scan', 'look', 'c_look']);
  const [requestQueue, setRequestQueue] = useState('98, 183, 37, 122, 14, 124, 65, 67');
  const [initialHead, setInitialHead] = useState(53);
  const [diskSize, setDiskSize] = useState(200);
  const [direction, setDirection] = useState('right');
  const [diskResults, setDiskResults] = useState<Record<string, DiskSchedulingResult> | null>(null);
  const [diskLoading, setDiskLoading] = useState(false);

  const [error, setError] = useState('');

  // ── CPU Run ──
  const toggleCpuAlgo = (val: string) => {
    setCpuSelectedAlgos((prev) =>
      prev.includes(val) ? prev.filter((a) => a !== val) : [...prev, val]
    );
  };

  const runCpu = async () => {
    if (cpuSelectedAlgos.length === 0) return;
    setCpuLoading(true);
    setError('');
    try {
      const res = await compareCpuScheduling(cpuSelectedAlgos, processes, timeQuantum);
      setCpuResults(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'CPU comparison failed');
    } finally {
      setCpuLoading(false);
    }
  };

  // ── Paging Run ──
  const togglePagingAlgo = (val: string) => {
    setPagingSelectedAlgos((prev) =>
      prev.includes(val) ? prev.filter((a) => a !== val) : [...prev, val]
    );
  };

  const runPagingComparison = async () => {
    if (pagingSelectedAlgos.length === 0) return;
    const pages = refString.split(/[,\s]+/).map(Number).filter((n) => !isNaN(n));
    if (pages.length === 0) {
      setError('Please provide a valid reference string of pages.');
      return;
    }
    setPagingLoading(true);
    setError('');
    try {
      const res = await comparePaging(pagingSelectedAlgos, pages, numFrames);
      setPagingResults(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Paging comparison failed');
    } finally {
      setPagingLoading(false);
    }
  };

  // ── Disk Run ──
  const toggleDiskAlgo = (val: string) => {
    setDiskSelectedAlgos((prev) =>
      prev.includes(val) ? prev.filter((a) => a !== val) : [...prev, val]
    );
  };

  const runDiskComparison = async () => {
    if (diskSelectedAlgos.length === 0) return;
    const queue = requestQueue.split(/[,\s]+/).map(Number).filter((n) => !isNaN(n));
    if (queue.length === 0) {
      setError('Please provide a valid disk request queue.');
      return;
    }
    setDiskLoading(true);
    setError('');
    try {
      const res = await compareDiskScheduling(diskSelectedAlgos, queue, initialHead, diskSize, direction);
      setDiskResults(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Disk comparison failed');
    } finally {
      setDiskLoading(false);
    }
  };

  const allCpuPids = processes.map((p) => p.pid);

  return (
    <div style={{ padding: '24px', maxWidth: 1280, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 20 }}>
        <h1
          style={{
            fontSize: '1.4rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <FlaskConical size={22} color="var(--color-accent-indigo)" />
          Algorithm Benchmarking Lab
        </h1>
        <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.85rem', marginTop: 4 }}>
          Run head-to-head performance benchmarks across CPU scheduling, page replacement, and disk scheduling algorithms
        </p>
      </motion.div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        <button
          className={`btn btn-sm ${labCategory === 'cpu' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setLabCategory('cpu');
            setError('');
          }}
        >
          <Cpu size={14} /> CPU Scheduling
        </button>
        <button
          className={`btn btn-sm ${labCategory === 'paging' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setLabCategory('paging');
            setError('');
          }}
        >
          <Layers size={14} /> Page Replacement
        </button>
        <button
          className={`btn btn-sm ${labCategory === 'disk' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setLabCategory('disk');
            setError('');
          }}
        >
          <Disc size={14} /> Disk Scheduling
        </button>
      </div>

      {error && (
        <div
          style={{
            marginBottom: 16,
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(251,113,133,0.1)',
            color: 'var(--color-accent-rose)',
            fontSize: '0.82rem',
          }}
        >
          {error}
        </div>
      )}

      {/* ────────────────── CPU TAB ────────────────── */}
      {labCategory === 'cpu' && (
        <div>
          <div className="card" style={{ padding: '20px', marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'end', flexWrap: 'wrap' }}>
              <div>
                <label
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: 'var(--color-text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    display: 'block',
                    marginBottom: 8,
                  }}
                >
                  Algorithms to Compare
                </label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {CPU_ALGORITHMS.map((a) => (
                    <button
                      key={a.value}
                      className={`btn btn-sm ${cpuSelectedAlgos.includes(a.value) ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => toggleCpuAlgo(a.value)}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: 'var(--color-text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    display: 'block',
                    marginBottom: 6,
                  }}
                >
                  Time Quantum (RR)
                </label>
                <input
                  className="input mono"
                  type="number"
                  min={1}
                  value={timeQuantum}
                  onChange={(e) => setTimeQuantum(Number(e.target.value))}
                  style={{ width: 80 }}
                />
              </div>
              <button className="btn btn-primary" onClick={runCpu} disabled={cpuLoading || cpuSelectedAlgos.length === 0}>
                {cpuLoading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />} Compare CPU
              </button>
            </div>

            <div style={{ marginTop: 14, fontSize: '0.78rem', color: 'var(--color-text-tertiary)' }}>
              Input Workload: {processes.map((p) => `${p.pid}(arr=${p.arrival_time}, burst=${p.burst_time}, pri=${p.priority})`).join(', ')}
            </div>
          </div>

          {cpuResults && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="card" style={{ padding: '20px', marginBottom: 20, overflowX: 'auto' }}>
                <h3
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: 'var(--color-text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 14,
                  }}
                >
                  CPU Scheduling Comparison Results
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border-default)' }}>
                      {['Algorithm', 'Avg TAT', 'Avg WT', 'Avg RT', 'CPU Util.', 'Ctx Switches', 'Throughput'].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: '8px 12px',
                            textAlign: 'left',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            color: 'var(--color-text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(cpuResults).map(([algo, res]) => {
                      const allResults = Object.values(cpuResults);
                      const bestTAT = Math.min(...allResults.map((r) => r.avg_turnaround_time));
                      const bestWT = Math.min(...allResults.map((r) => r.avg_waiting_time));
                      const bestRT = Math.min(...allResults.map((r) => r.avg_response_time));
                      const bestUtil = Math.max(...allResults.map((r) => r.cpu_utilization));
                      const bestCtx = Math.min(...allResults.map((r) => r.context_switches));

                      return (
                        <tr key={algo} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 600 }}>{res.algorithm}</td>
                          <td
                            className="mono"
                            style={{
                              padding: '8px 12px',
                              color: res.avg_turnaround_time === bestTAT ? '#34d399' : 'var(--color-text-secondary)',
                              fontWeight: res.avg_turnaround_time === bestTAT ? 700 : 400,
                            }}
                          >
                            {res.avg_turnaround_time} {res.avg_turnaround_time === bestTAT && '★'}
                          </td>
                          <td
                            className="mono"
                            style={{
                              padding: '8px 12px',
                              color: res.avg_waiting_time === bestWT ? '#34d399' : 'var(--color-text-secondary)',
                              fontWeight: res.avg_waiting_time === bestWT ? 700 : 400,
                            }}
                          >
                            {res.avg_waiting_time} {res.avg_waiting_time === bestWT && '★'}
                          </td>
                          <td
                            className="mono"
                            style={{
                              padding: '8px 12px',
                              color: res.avg_response_time === bestRT ? '#34d399' : 'var(--color-text-secondary)',
                              fontWeight: res.avg_response_time === bestRT ? 700 : 400,
                            }}
                          >
                            {res.avg_response_time} {res.avg_response_time === bestRT && '★'}
                          </td>
                          <td
                            className="mono"
                            style={{
                              padding: '8px 12px',
                              color: res.cpu_utilization === bestUtil ? '#34d399' : 'var(--color-text-secondary)',
                              fontWeight: res.cpu_utilization === bestUtil ? 700 : 400,
                            }}
                          >
                            {res.cpu_utilization}% {res.cpu_utilization === bestUtil && '★'}
                          </td>
                          <td
                            className="mono"
                            style={{
                              padding: '8px 12px',
                              color: res.context_switches === bestCtx ? '#34d399' : 'var(--color-text-secondary)',
                              fontWeight: res.context_switches === bestCtx ? 700 : 400,
                            }}
                          >
                            {res.context_switches} {res.context_switches === bestCtx && '★'}
                          </td>
                          <td className="mono" style={{ padding: '8px 12px' }}>
                            {res.throughput}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div style={{ marginTop: 10, fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                  ★ = Best in category. No single algorithm is universally optimal across all OS scheduling goals.
                </div>
              </div>

              {/* Side-by-side Gantt Charts */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${Math.min(Object.keys(cpuResults).length, 2)}, 1fr)`,
                  gap: 12,
                }}
              >
                {Object.entries(cpuResults).map(([algo, res]) => (
                  <div key={algo} className="card" style={{ padding: '16px' }}>
                    <h4 style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: 10, color: 'var(--color-text-secondary)' }}>
                      {res.algorithm} Gantt
                    </h4>
                    <div style={{ display: 'flex', overflowX: 'auto' }}>
                      {res.gantt_chart.map((entry, i) => {
                        const width = (entry.end - entry.start) * 28;
                        const isIdle = entry.pid === 'IDLE';
                        const pidIdx = allCpuPids.indexOf(entry.pid);
                        const color = isIdle ? 'var(--color-bg-hover)' : GANTT_COLORS[pidIdx % GANTT_COLORS.length];
                        return (
                          <div key={i}>
                            <div
                              style={{
                                width,
                                height: 28,
                                background: isIdle ? color : `${color}cc`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.65rem',
                                fontWeight: 600,
                                color: isIdle ? 'var(--color-text-muted)' : 'white',
                                borderLeft: i > 0 ? '1px solid var(--color-bg-primary)' : 'none',
                                borderRadius: 3,
                              }}
                            >
                              {width >= 22 ? entry.pid : ''}
                            </div>
                            <div className="mono" style={{ fontSize: '0.55rem', color: 'var(--color-text-muted)', textAlign: 'left', marginTop: 2 }}>
                              {entry.start}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* ────────────────── PAGING TAB ────────────────── */}
      {labCategory === 'paging' && (
        <div>
          <div className="card" style={{ padding: '20px', marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'end', flexWrap: 'wrap' }}>
              <div>
                <label
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: 'var(--color-text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    display: 'block',
                    marginBottom: 8,
                  }}
                >
                  Algorithms to Compare
                </label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {PAGING_ALGORITHMS.map((a) => (
                    <button
                      key={a.value}
                      className={`btn btn-sm ${pagingSelectedAlgos.includes(a.value) ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => togglePagingAlgo(a.value)}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: 'var(--color-text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    display: 'block',
                    marginBottom: 6,
                  }}
                >
                  Frames
                </label>
                <input
                  className="input mono"
                  type="number"
                  min={1}
                  max={10}
                  value={numFrames}
                  onChange={(e) => setNumFrames(Number(e.target.value))}
                  style={{ width: 75 }}
                />
              </div>

              <div style={{ flex: 1, minWidth: 260 }}>
                <label
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: 'var(--color-text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    display: 'block',
                    marginBottom: 6,
                  }}
                >
                  Reference String
                </label>
                <input
                  className="input mono"
                  value={refString}
                  onChange={(e) => setRefString(e.target.value)}
                  placeholder="e.g. 7, 0, 1, 2, 0, 3..."
                />
              </div>

              <button
                className="btn btn-primary"
                onClick={runPagingComparison}
                disabled={pagingLoading || pagingSelectedAlgos.length === 0}
              >
                {pagingLoading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />} Compare Paging
              </button>
            </div>
          </div>

          {pagingResults && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="card" style={{ padding: '20px', marginBottom: 20, overflowX: 'auto' }}>
                <h3
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: 'var(--color-text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 14,
                  }}
                >
                  Page Replacement Comparison Results
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border-default)' }}>
                      {['Algorithm', 'Page Faults', 'Page Hits', 'Hit Ratio', 'Fault Ratio', 'Efficiency Rating'].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: '8px 12px',
                            textAlign: 'left',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            color: 'var(--color-text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(pagingResults).map(([algo, res]) => {
                      const allResults = Object.values(pagingResults);
                      const minFaults = Math.min(...allResults.map((r) => r.page_faults));
                      const maxHits = Math.max(...allResults.map((r) => r.page_hits));
                      const maxHitRatio = Math.max(...allResults.map((r) => r.hit_ratio));

                      return (
                        <tr key={algo} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 600 }}>{res.algorithm}</td>
                          <td
                            className="mono"
                            style={{
                              padding: '8px 12px',
                              color: res.page_faults === minFaults ? '#34d399' : 'var(--color-text-secondary)',
                              fontWeight: res.page_faults === minFaults ? 700 : 400,
                            }}
                          >
                            {res.page_faults} {res.page_faults === minFaults && '★'}
                          </td>
                          <td
                            className="mono"
                            style={{
                              padding: '8px 12px',
                              color: res.page_hits === maxHits ? '#34d399' : 'var(--color-text-secondary)',
                              fontWeight: res.page_hits === maxHits ? 700 : 400,
                            }}
                          >
                            {res.page_hits} {res.page_hits === maxHits && '★'}
                          </td>
                          <td
                            className="mono"
                            style={{
                              padding: '8px 12px',
                              color: res.hit_ratio === maxHitRatio ? '#34d399' : 'var(--color-text-secondary)',
                              fontWeight: res.hit_ratio === maxHitRatio ? 700 : 400,
                            }}
                          >
                            {(res.hit_ratio * 100).toFixed(1)}% {res.hit_ratio === maxHitRatio && '★'}
                          </td>
                          <td className="mono" style={{ padding: '8px 12px', color: 'var(--color-text-secondary)' }}>
                            {(res.fault_ratio * 100).toFixed(1)}%
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div
                                style={{
                                  width: 80,
                                  height: 6,
                                  background: 'var(--color-bg-elevated)',
                                  borderRadius: 3,
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  style={{
                                    width: `${res.hit_ratio * 100}%`,
                                    height: '100%',
                                    background: res.hit_ratio === maxHitRatio ? '#34d399' : '#818cf8',
                                    borderRadius: 3,
                                  }}
                                />
                              </div>
                              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                                {res.hit_ratio === maxHitRatio ? 'Optimal' : 'Standard'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div style={{ marginTop: 10, fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                  ★ = Lowest page faults / highest hit ratio. Optimal represents the theoretical minimum bound for the given sequence and frame count.
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* ────────────────── DISK TAB ────────────────── */}
      {labCategory === 'disk' && (
        <div>
          <div className="card" style={{ padding: '20px', marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'end', flexWrap: 'wrap' }}>
              <div>
                <label
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: 'var(--color-text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    display: 'block',
                    marginBottom: 8,
                  }}
                >
                  Algorithms to Compare
                </label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {DISK_ALGORITHMS.map((a) => (
                    <button
                      key={a.value}
                      className={`btn btn-sm ${diskSelectedAlgos.includes(a.value) ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => toggleDiskAlgo(a.value)}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: 'var(--color-text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    display: 'block',
                    marginBottom: 6,
                  }}
                >
                  Head Pos
                </label>
                <input
                  className="input mono"
                  type="number"
                  min={0}
                  value={initialHead}
                  onChange={(e) => setInitialHead(Number(e.target.value))}
                  style={{ width: 75 }}
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: 'var(--color-text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    display: 'block',
                    marginBottom: 6,
                  }}
                >
                  Disk Size
                </label>
                <input
                  className="input mono"
                  type="number"
                  min={10}
                  value={diskSize}
                  onChange={(e) => setDiskSize(Number(e.target.value))}
                  style={{ width: 80 }}
                />
              </div>


              <div>
                <label
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: 'var(--color-text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    display: 'block',
                    marginBottom: 6,
                  }}
                >
                  Direction
                </label>
                <select
                  className="input"
                  value={direction}
                  onChange={(e) => setDirection(e.target.value)}
                  style={{ width: 90 }}
                >
                  <option value="right">Right (→)</option>
                  <option value="left">Left (←)</option>
                </select>
              </div>

              <div style={{ flex: 1, minWidth: 260 }}>
                <label
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: 'var(--color-text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    display: 'block',
                    marginBottom: 6,
                  }}
                >
                  Request Cylinders
                </label>
                <input
                  className="input mono"
                  value={requestQueue}
                  onChange={(e) => setRequestQueue(e.target.value)}
                  placeholder="e.g. 98, 183, 37, 122..."
                />
              </div>

              <button
                className="btn btn-primary"
                onClick={runDiskComparison}
                disabled={diskLoading || diskSelectedAlgos.length === 0}
              >
                {diskLoading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />} Compare Disk
              </button>
            </div>
          </div>

          {diskResults && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="card" style={{ padding: '20px', marginBottom: 20, overflowX: 'auto' }}>
                <h3
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: 'var(--color-text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 14,
                  }}
                >
                  Disk Scheduling Comparison Results
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border-default)' }}>
                      {['Algorithm', 'Total Head Movement (Cylinders)', 'Average Seek Distance', 'Serviced Order'].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: '8px 12px',
                            textAlign: 'left',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            color: 'var(--color-text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(diskResults).map(([algo, res]) => {
                      const allResults = Object.values(diskResults);
                      const minMovement = Math.min(...allResults.map((r) => r.total_head_movement));
                      const minAvgSeek = Math.min(...allResults.map((r) => r.average_seek_distance));

                      return (
                        <tr key={algo} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 600 }}>{res.algorithm}</td>
                          <td
                            className="mono"
                            style={{
                              padding: '8px 12px',
                              color: res.total_head_movement === minMovement ? '#34d399' : 'var(--color-text-secondary)',
                              fontWeight: res.total_head_movement === minMovement ? 700 : 400,
                            }}
                          >
                            {res.total_head_movement} cyl {res.total_head_movement === minMovement && '★'}
                          </td>
                          <td
                            className="mono"
                            style={{
                              padding: '8px 12px',
                              color: res.average_seek_distance === minAvgSeek ? '#34d399' : 'var(--color-text-secondary)',
                              fontWeight: res.average_seek_distance === minAvgSeek ? 700 : 400,
                            }}
                          >
                            {res.average_seek_distance.toFixed(1)} {res.average_seek_distance === minAvgSeek && '★'}
                          </td>
                          <td className="mono" style={{ padding: '8px 12px', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                            {res.seek_sequence.join(' → ')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div style={{ marginTop: 10, fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                  ★ = Lowest total head travel. Elevator algorithms (SCAN, LOOK) prevent starvation compared to SSTF in heavily-loaded systems.
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
