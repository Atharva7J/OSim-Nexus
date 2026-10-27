import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Clock,
  Cpu as CpuIcon,
  BarChart3,
  List,
  Loader2,
} from 'lucide-react';
import {
  runCpuScheduling,
  type ProcessInput,
  type SchedulingResult,
} from '../lib/api';

const ALGORITHMS = [
  { value: 'fcfs', label: 'First Come First Served (FCFS)' },
  { value: 'sjf', label: 'Shortest Job First (SJF)' },
  { value: 'srtf', label: 'Shortest Remaining Time First (SRTF)' },
  { value: 'round_robin', label: 'Round Robin (RR)' },
  { value: 'priority_np', label: 'Priority (Non-Preemptive)' },
  { value: 'priority_p', label: 'Priority (Preemptive)' },
];

const GANTT_COLORS = [
  '#22d3ee', '#a78bfa', '#34d399', '#fbbf24', '#fb7185',
  '#818cf8', '#f472b6', '#38bdf8', '#4ade80', '#facc15',
  '#e879f9', '#2dd4bf',
];

const DEMOS: Record<string, { algo: string; processes: ProcessInput[]; tq: number }> = {
  rr: {
    algo: 'round_robin',
    tq: 3,
    processes: [
      { pid: 'P1', arrival_time: 0, burst_time: 8, priority: 0 },
      { pid: 'P2', arrival_time: 1, burst_time: 4, priority: 0 },
      { pid: 'P3', arrival_time: 2, burst_time: 2, priority: 0 },
      { pid: 'P4', arrival_time: 3, burst_time: 6, priority: 0 },
    ],
  },
  srtf: {
    algo: 'srtf',
    tq: 2,
    processes: [
      { pid: 'P1', arrival_time: 0, burst_time: 8, priority: 0 },
      { pid: 'P2', arrival_time: 1, burst_time: 4, priority: 0 },
      { pid: 'P3', arrival_time: 2, burst_time: 2, priority: 0 },
      { pid: 'P4', arrival_time: 3, burst_time: 1, priority: 0 },
    ],
  },
  priority: {
    algo: 'priority_np',
    tq: 2,
    processes: [
      { pid: 'P1', arrival_time: 0, burst_time: 6, priority: 3 },
      { pid: 'P2', arrival_time: 1, burst_time: 4, priority: 1 },
      { pid: 'P3', arrival_time: 2, burst_time: 2, priority: 2 },
      { pid: 'P4', arrival_time: 3, burst_time: 3, priority: 0 },
    ],
  },
};

function getColor(pid: string, pids: string[]): string {
  const idx = pids.indexOf(pid);
  return GANTT_COLORS[idx % GANTT_COLORS.length];
}

export default function CpuSchedulingPage() {
  const [searchParams] = useSearchParams();
  const demoKey = searchParams.get('demo');
  const demoData = demoKey && DEMOS[demoKey] ? DEMOS[demoKey] : null;

  const [algorithm, setAlgorithm] = useState(demoData ? demoData.algo : 'fcfs');
  const [timeQuantum, setTimeQuantum] = useState(demoData ? demoData.tq : 2);
  const [processes, setProcesses] = useState<ProcessInput[]>(
    demoData
      ? [...demoData.processes]
      : [
          { pid: 'P1', arrival_time: 0, burst_time: 5, priority: 2 },
          { pid: 'P2', arrival_time: 1, burst_time: 3, priority: 1 },
          { pid: 'P3', arrival_time: 2, burst_time: 8, priority: 3 },
          { pid: 'P4', arrival_time: 3, burst_time: 2, priority: 0 },
        ]
  );
  const [result, setResult] = useState<SchedulingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEvents, setShowEvents] = useState(false);

  const runSimulation = async (algo?: string, procs?: ProcessInput[], tq?: number) => {
    setLoading(true);
    setError('');
    try {
      const res = await runCpuScheduling(algo || algorithm, procs || processes, tq || timeQuantum);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  // Load demo from URL params
  useEffect(() => {
    if (demoData) {
      const timer = setTimeout(() => {
        runSimulation(demoData.algo, demoData.processes, demoData.tq);
      }, 0);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addProcess = () => {
    const nextId = `P${processes.length + 1}`;
    setProcesses([...processes, { pid: nextId, arrival_time: 0, burst_time: 1, priority: 0 }]);
  };

  const removeProcess = (idx: number) => {
    setProcesses(processes.filter((_, i) => i !== idx));
  };

  const updateProcess = (idx: number, field: keyof ProcessInput, value: string | number) => {
    const updated = [...processes];
    if (field === 'pid') {
      updated[idx] = { ...updated[idx], [field]: value as string };
    } else {
      updated[idx] = { ...updated[idx], [field]: Number(value) };
    }
    setProcesses(updated);
  };

  const allPids = processes.map((p) => p.pid);

  return (
    <div style={{ padding: '24px', maxWidth: 1280, margin: '0 auto' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
          <CpuIcon size={22} color="var(--color-accent-cyan)" />
          CPU Scheduling Simulator
        </h1>
        <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.85rem', marginTop: 4 }}>
          Configure processes and run scheduling algorithms with real-time Gantt chart visualization
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Left Panel: Controls */}
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          {/* Algorithm Selection */}
          <div className="card" style={{ padding: '16px', marginBottom: 12 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
              Algorithm
            </label>
            <select
              className="input"
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              {ALGORITHMS.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>

            {algorithm === 'round_robin' && (
              <div style={{ marginTop: 12 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
                  Time Quantum
                </label>
                <input
                  type="number"
                  className="input"
                  value={timeQuantum}
                  min={1}
                  onChange={(e) => setTimeQuantum(Number(e.target.value))}
                  style={{ width: 100 }}
                />
              </div>
            )}
          </div>

          {/* Process Table */}
          <div className="card" style={{ padding: '16px', marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Processes ({processes.length})
              </span>
              <button className="btn btn-ghost btn-sm" onClick={addProcess}>
                <Plus size={14} /> Add
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '56px 40px 40px 40px 28px', gap: 6, marginBottom: 6, fontSize: '0.68rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span>PID</span>
              <span>Arr.</span>
              <span>Burst</span>
              <span>Pri.</span>
              <span></span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {processes.map((p, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '56px 40px 40px 40px 28px', gap: 6, alignItems: 'center' }}>
                  <input className="input" value={p.pid} onChange={(e) => updateProcess(i, 'pid', e.target.value)} style={{ padding: '5px 6px', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }} />
                  <input className="input" type="number" min={0} value={p.arrival_time} onChange={(e) => updateProcess(i, 'arrival_time', e.target.value)} style={{ padding: '5px 4px', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', textAlign: 'center' }} />
                  <input className="input" type="number" min={1} value={p.burst_time} onChange={(e) => updateProcess(i, 'burst_time', e.target.value)} style={{ padding: '5px 4px', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', textAlign: 'center' }} />
                  <input className="input" type="number" min={0} value={p.priority} onChange={(e) => updateProcess(i, 'priority', e.target.value)} style={{ padding: '5px 4px', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', textAlign: 'center' }} />
                  <button onClick={() => removeProcess(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4 }} title="Remove">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Run Button */}
          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '10px', fontSize: '0.9rem' }}
            onClick={() => runSimulation()}
            disabled={loading || processes.length === 0}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            {loading ? 'Running...' : 'Run Simulation'}
          </button>

          {error && (
            <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.2)', color: 'var(--color-accent-rose)', fontSize: '0.8rem' }}>
              {error}
            </div>
          )}
        </motion.div>

        {/* Right Panel: Results */}
        <div>
          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  padding: '60px 40px',
                  textAlign: 'center',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px dashed var(--color-border-default)',
                  background: 'var(--color-bg-secondary)',
                }}
              >
                <CpuIcon size={40} color="var(--color-text-muted)" style={{ margin: '0 auto 16px' }} />
                <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.9rem', fontWeight: 500 }}>
                  Configure processes and select an algorithm to begin
                </p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: 6 }}>
                  Results will appear here with a Gantt chart, metrics, and event log
                </p>
              </motion.div>
            )}

            {result && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {/* Algorithm Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <span className="badge badge-cyan" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
                    {result.algorithm}
                  </span>
                  <span className="mono" style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>
                    Total Time: {result.total_time} | Ctx Switches: {result.context_switches}
                  </span>
                </div>

                {/* Gantt Chart */}
                <div className="card" style={{ padding: '20px', marginBottom: 16 }}>
                  <h3 style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <BarChart3 size={14} /> Gantt Chart
                  </h3>
                  <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
                    <div style={{ display: 'flex', minWidth: 'min-content' }}>
                      {result.gantt_chart.map((entry, i) => {
                        const width = (entry.end - entry.start) * 44;
                        const isIdle = entry.pid === 'IDLE';
                        const color = isIdle ? 'var(--color-bg-hover)' : getColor(entry.pid, allPids);
                        return (
                          <motion.div
                            key={i}
                            initial={{ scaleX: 0, opacity: 0 }}
                            animate={{ scaleX: 1, opacity: 1 }}
                            transition={{ delay: i * 0.05, duration: 0.3 }}
                            style={{ transformOrigin: 'left' }}
                          >
                            <div
                              className="gantt-bar"
                              style={{
                                width,
                                height: 38,
                                background: isIdle ? color : `${color}cc`,
                                borderLeft: i > 0 ? '1px solid var(--color-bg-primary)' : 'none',
                                color: isIdle ? 'var(--color-text-muted)' : 'white',
                                fontStyle: isIdle ? 'italic' : 'normal',
                              }}
                              title={`${entry.pid}: ${entry.start} → ${entry.end}`}
                            >
                              {width >= 30 ? entry.pid : ''}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width, padding: '3px 2px 0' }}>
                              <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{entry.start}</span>
                              {i === result.gantt_chart.length - 1 && (
                                <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{entry.end}</span>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Metrics Table */}
                <div className="card" style={{ padding: '20px', marginBottom: 16 }}>
                  <h3 style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={14} /> Process Metrics
                  </h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-border-default)' }}>
                          {['PID', 'Arrival', 'Burst', 'Priority', 'Completion', 'Turnaround', 'Waiting', 'Response'].map((h) => (
                            <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.metrics.map((m) => (
                          <tr key={m.pid} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                            <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: getColor(m.pid, allPids) }}>{m.pid}</td>
                            <td className="mono" style={{ padding: '8px 10px' }}>{m.arrival_time}</td>
                            <td className="mono" style={{ padding: '8px 10px' }}>{m.burst_time}</td>
                            <td className="mono" style={{ padding: '8px 10px' }}>{m.priority}</td>
                            <td className="mono" style={{ padding: '8px 10px' }}>{m.completion_time}</td>
                            <td className="mono" style={{ padding: '8px 10px' }}>{m.turnaround_time}</td>
                            <td className="mono" style={{ padding: '8px 10px' }}>{m.waiting_time}</td>
                            <td className="mono" style={{ padding: '8px 10px' }}>{m.response_time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Averages */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-border-subtle)' }}>
                    {[
                      { label: 'Avg Turnaround', value: result.avg_turnaround_time, color: '#22d3ee' },
                      { label: 'Avg Waiting', value: result.avg_waiting_time, color: '#a78bfa' },
                      { label: 'Avg Response', value: result.avg_response_time, color: '#818cf8' },
                      { label: 'CPU Utilization', value: `${result.cpu_utilization}%`, color: '#34d399' },
                    ].map((s) => (
                      <div key={s.label}>
                        <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                          {s.label}
                        </div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: s.color }}>
                          {s.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Event Log */}
                <div className="card" style={{ padding: '16px' }}>
                  <button
                    onClick={() => setShowEvents(!showEvents)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-text-secondary)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      width: '100%',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <List size={14} /> Event Log ({result.events.length} events)
                    </span>
                    {showEvents ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>

                  <AnimatePresence>
                    {showEvents && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ marginTop: 12, maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {result.events.map((evt, i) => (
                            <div
                              key={i}
                              style={{
                                padding: '8px 12px',
                                borderRadius: 'var(--radius-sm)',
                                background: 'var(--color-bg-elevated)',
                                fontSize: '0.78rem',
                                display: 'flex',
                                gap: 10,
                                alignItems: 'flex-start',
                              }}
                            >
                              <span className="mono" style={{ color: 'var(--color-text-muted)', flexShrink: 0, fontSize: '0.72rem', minWidth: 32, textAlign: 'right' }}>
                                t={evt.timestamp}
                              </span>
                              <span style={{ color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                                {evt.description}
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
