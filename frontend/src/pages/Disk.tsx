import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Disc, Loader2, ChevronDown, ChevronRight, List } from 'lucide-react';
import { runDiskScheduling, type DiskSchedulingResult } from '../lib/api';

const ALGORITHMS = [
  { value: 'fcfs', label: 'FCFS' },
  { value: 'sstf', label: 'SSTF' },
  { value: 'scan', label: 'SCAN (Elevator)' },
  { value: 'c_scan', label: 'C-SCAN' },
  { value: 'look', label: 'LOOK' },
  { value: 'c_look', label: 'C-LOOK' },
];

export default function DiskPage() {
  const [searchParams] = useSearchParams();
  const [algorithm, setAlgorithm] = useState('scan');
  const [requestQueue, setRequestQueue] = useState('98, 183, 37, 122, 14, 124, 65, 67');
  const [initialHead, setInitialHead] = useState(53);
  const [diskSize, setDiskSize] = useState(200);
  const [direction, setDirection] = useState('right');
  const [result, setResult] = useState<DiskSchedulingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEvents, setShowEvents] = useState(false);

  const parseQueue = (s: string): number[] => s.split(/[,\s]+/).map(Number).filter((n) => !isNaN(n));

  const run = async (algo?: string) => {
    const queue = parseQueue(requestQueue);
    if (queue.length === 0) { setError('Request queue cannot be empty'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await runDiskScheduling(algo || algorithm, queue, initialHead, diskSize, direction);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const demo = searchParams.get('demo');
    if (demo === 'scan') {
      const timer = setTimeout(() => {
        run('scan');
      }, 0);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: '24px', maxWidth: 1280, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Disc size={22} color="var(--color-accent-rose)" />
          Disk Scheduling Simulator
        </h1>
        <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.85rem', marginTop: 4 }}>
          Visualize disk head movement and calculate total seek distance
        </p>
      </motion.div>

      {/* Controls */}
      <div className="card" style={{ padding: '20px', marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 100px 100px 100px auto', gap: 14, alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Algorithm</label>
            <select className="input" value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}>
              {ALGORITHMS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Request Queue</label>
            <input className="input mono" value={requestQueue} onChange={(e) => setRequestQueue(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Head</label>
            <input className="input mono" type="number" min={0} value={initialHead} onChange={(e) => setInitialHead(Number(e.target.value))} style={{ textAlign: 'center' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Disk Size</label>
            <input className="input mono" type="number" min={1} value={diskSize} onChange={(e) => setDiskSize(Number(e.target.value))} style={{ textAlign: 'center' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Direction</label>
            <select className="input" value={direction} onChange={(e) => setDirection(e.target.value)}>
              <option value="right">Right →</option>
              <option value="left">← Left</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={() => run()} disabled={loading} style={{ height: 38 }}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            Run
          </button>
        </div>
        {error && <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'rgba(251,113,133,0.1)', color: 'var(--color-accent-rose)', fontSize: '0.8rem' }}>{error}</div>}
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
              <div className="card" style={{ padding: '14px 18px' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Total Head Movement</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#fb7185' }}>{result.total_head_movement}</div>
              </div>
              <div className="card" style={{ padding: '14px 18px' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Avg Seek Distance</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#22d3ee' }}>{result.average_seek_distance}</div>
              </div>
              <div className="card" style={{ padding: '14px 18px' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Algorithm</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-accent-violet)' }}>{result.algorithm}</div>
              </div>
            </div>

            {/* Seek Sequence Visualization */}
            <div className="card" style={{ padding: '20px', marginBottom: 16 }}>
              <h3 style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Seek Sequence & Head Movement</h3>

              {/* Horizontal cylinder visualization */}
              <div style={{ position: 'relative', height: result.seek_sequence.length * 32 + 20, marginBottom: 16 }}>
                {/* Cylinder axis */}
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: 30, right: 20, borderLeft: '1px solid var(--color-border-default)', borderRight: '1px solid var(--color-border-default)' }}>
                  {/* Scale labels */}
                  <div className="mono" style={{ position: 'absolute', top: -16, left: -4, fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>0</div>
                  <div className="mono" style={{ position: 'absolute', top: -16, right: -4, fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{diskSize - 1}</div>
                </div>

                {/* Draw seek sequence lines */}
                <svg style={{ position: 'absolute', top: 10, left: 30, right: 20, width: 'calc(100% - 50px)', height: result.seek_sequence.length * 32 }}>
                  {result.seek_sequence.map((pos, i) => {
                    if (i === 0) return null;
                    const prevPos = result.seek_sequence[i - 1];
                    const x1 = `${(prevPos / (diskSize - 1)) * 100}%`;
                    const y1 = (i - 1) * 32 + 10;
                    const x2 = `${(pos / (diskSize - 1)) * 100}%`;
                    const y2 = i * 32 + 10;
                    return (
                      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#22d3ee" strokeWidth="1.5" strokeOpacity="0.6" />
                    );
                  })}
                  {/* Points */}
                  {result.seek_sequence.map((pos, i) => (
                    <g key={`p-${i}`}>
                      <circle cx={`${(pos / (diskSize - 1)) * 100}%`} cy={i * 32 + 10} r="4" fill={i === 0 ? '#fbbf24' : '#22d3ee'} />
                    </g>
                  ))}
                </svg>

                {/* Labels */}
                {result.seek_sequence.map((pos, i) => (
                  <div key={i} className="mono" style={{ position: 'absolute', right: -2, top: i * 32 + 4, fontSize: '0.65rem', color: 'var(--color-text-muted)', transform: 'translateX(100%)', paddingLeft: 24, whiteSpace: 'nowrap' }}>
                    {pos}
                  </div>
                ))}
              </div>
            </div>

            {/* Seek Sequence Table */}
            <div className="card" style={{ padding: '20px', marginBottom: 16 }}>
              <h3 style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Seek Sequence</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                {result.seek_sequence.map((pos, i) => (
                  <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ padding: '4px 10px', borderRadius: 'var(--radius-md)', background: i === 0 ? 'rgba(251,191,36,0.12)' : 'rgba(34,211,238,0.08)', border: i === 0 ? '1px solid rgba(251,191,36,0.25)' : '1px solid rgba(34,211,238,0.15)', color: i === 0 ? '#fbbf24' : '#22d3ee', fontWeight: 600 }}>
                      {pos}
                    </span>
                    {i < result.seek_sequence.length - 1 && <span style={{ color: 'var(--color-text-muted)' }}>→</span>}
                  </span>
                ))}
              </div>
            </div>

            {/* Event Log */}
            <div className="card" style={{ padding: '16px' }}>
              <button onClick={() => setShowEvents(!showEvents)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', width: '100%', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><List size={14} /> Movement Log ({result.events.length})</span>
                {showEvents ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              <AnimatePresence>
                {showEvents && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                    <div style={{ marginTop: 12, maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {result.events.map((evt, i) => (
                        <div key={i} style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-elevated)', fontSize: '0.76rem' }}>
                          <span style={{ color: 'var(--color-text-secondary)' }}>{evt.description}</span>
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
  );
}
