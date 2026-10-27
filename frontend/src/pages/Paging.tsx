import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Layers, Loader2, ChevronDown, ChevronRight, List } from 'lucide-react';
import { runPaging, type PageReplacementResult } from '../lib/api';

const ALGORITHMS = [
  { value: 'fifo', label: 'FIFO' },
  { value: 'lru', label: 'LRU (Least Recently Used)' },
  { value: 'optimal', label: 'Optimal (Bélády)' },
  { value: 'second_chance', label: 'Second Chance (Clock)' },
];

const DEMOS: Record<string, { algo: string; ref: number[]; frames: number }> = {
  fifo: { algo: 'fifo', ref: [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1], frames: 3 },
  lru: { algo: 'lru', ref: [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1], frames: 3 },
  optimal: { algo: 'optimal', ref: [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1], frames: 3 },
};

export default function PagingPage() {
  const [searchParams] = useSearchParams();
  const demoKey = searchParams.get('demo');
  const demoData = demoKey && DEMOS[demoKey] ? DEMOS[demoKey] : null;

  const [algorithm, setAlgorithm] = useState(demoData ? demoData.algo : 'fifo');
  const [refString, setRefString] = useState(
    demoData ? demoData.ref.join(', ') : '7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1'
  );
  const [numFrames, setNumFrames] = useState(demoData ? demoData.frames : 3);
  const [result, setResult] = useState<PageReplacementResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEvents, setShowEvents] = useState(false);

  const parseRef = (s: string): number[] =>
    s.split(/[,\s]+/).map(Number).filter((n) => !isNaN(n));

  const run = async (algo?: string, ref?: number[], frames?: number) => {
    const rs = ref || parseRef(refString);
    const nf = frames || numFrames;
    const al = algo || algorithm;
    if (rs.length === 0) { setError('Reference string cannot be empty'); return; }
    if (nf < 1) { setError('Number of frames must be at least 1'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await runPaging(al, rs, nf);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (demoData) {
      const timer = setTimeout(() => {
        run(demoData.algo, demoData.ref, demoData.frames);
      }, 0);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: '24px', maxWidth: 1280, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Layers size={22} color="var(--color-accent-indigo)" />
          Page Replacement Simulator
        </h1>
        <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.85rem', marginTop: 4 }}>
          Visualize page replacement algorithms with frame state tracking and fault analysis
        </p>
      </motion.div>

      {/* Controls */}
      <div className="card" style={{ padding: '20px', marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 100px auto', gap: 16, alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Algorithm</label>
            <select className="input" value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}>
              {ALGORITHMS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Reference String</label>
            <input className="input mono" value={refString} onChange={(e) => setRefString(e.target.value)} placeholder="e.g. 7, 0, 1, 2, 0, 3, 0, 4" />
          </div>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Frames</label>
            <input className="input mono" type="number" min={1} value={numFrames} onChange={(e) => setNumFrames(Number(e.target.value))} style={{ textAlign: 'center' }} />
          </div>
          <button className="btn btn-primary" onClick={() => run()} disabled={loading} style={{ height: 38 }}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            Run
          </button>
        </div>
        {algorithm === 'optimal' && (
          <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'rgba(251, 191, 36, 0.08)', border: '1px solid rgba(251, 191, 36, 0.15)', fontSize: '0.78rem', color: 'var(--color-accent-amber)' }}>
            ℹ️ Optimal requires future knowledge of the reference string and is primarily a theoretical benchmark.
          </div>
        )}
        {error && <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'rgba(251,113,133,0.1)', color: 'var(--color-accent-rose)', fontSize: '0.8rem' }}>{error}</div>}
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Metrics Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Page Faults', value: result.page_faults, color: '#fb7185' },
                { label: 'Page Hits', value: result.page_hits, color: '#34d399' },
                { label: 'Hit Ratio', value: `${(result.hit_ratio * 100).toFixed(1)}%`, color: '#22d3ee' },
                { label: 'Fault Ratio', value: `${(result.fault_ratio * 100).toFixed(1)}%`, color: '#fbbf24' },
              ].map((s) => (
                <div key={s.label} className="card" style={{ padding: '14px 18px' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Frame Table */}
            <div className="card" style={{ padding: '20px', marginBottom: 16, overflowX: 'auto' }}>
              <h3 style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
                Frame State Over Time
              </h3>
              <table style={{ borderCollapse: 'collapse', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '6px 10px', textAlign: 'left', color: 'var(--color-text-muted)', fontSize: '0.7rem', fontWeight: 600 }}>Step</th>
                    {result.reference_string.map((page, i) => (
                      <th key={i} style={{ padding: '6px 10px', textAlign: 'center', minWidth: 36 }}>
                        <div style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{page}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: result.num_frames }, (_, f) => (
                    <tr key={f} style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
                      <td style={{ padding: '6px 10px', color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>F{f}</td>
                      {result.frames_over_time.map((frame, step) => {
                        const val = frame[f];
                        const prevVal = step > 0 ? result.frames_over_time[step - 1][f] : null;
                        const changed = val !== prevVal;
                        const isFault = result.events[step]?.event_type === 'PAGE_FAULT' || result.events[step]?.event_type === 'PAGE_REPLACEMENT';
                        return (
                          <td
                            key={step}
                            style={{
                              padding: '6px 10px',
                              textAlign: 'center',
                              color: val !== null ? (changed ? '#22d3ee' : 'var(--color-text-secondary)') : 'var(--color-text-muted)',
                              fontWeight: changed ? 700 : 400,
                              background: changed && isFault ? 'rgba(251, 113, 133, 0.06)' : 'transparent',
                            }}
                          >
                            {val !== null ? val : '—'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {/* Fault/Hit row */}
                  <tr style={{ borderTop: '2px solid var(--color-border-default)' }}>
                    <td style={{ padding: '6px 10px', color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>Result</td>
                    {result.events.map((evt, i) => {
                      const isFault = evt.event_type === 'PAGE_FAULT' || evt.event_type === 'PAGE_REPLACEMENT';
                      return (
                        <td key={i} style={{ padding: '6px 10px', textAlign: 'center', fontWeight: 600, fontSize: '0.7rem', color: isFault ? '#fb7185' : '#34d399' }}>
                          {isFault ? 'F' : 'H'}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Event Log */}
            <div className="card" style={{ padding: '16px' }}>
              <button onClick={() => setShowEvents(!showEvents)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', width: '100%', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><List size={14} /> Event Log ({result.events.length})</span>
                {showEvents ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              <AnimatePresence>
                {showEvents && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                    <div style={{ marginTop: 12, maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {result.events.map((evt, i) => (
                        <div key={i} style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-elevated)', fontSize: '0.76rem', display: 'flex', gap: 8 }}>
                          <span className="mono" style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem', minWidth: 44 }}>Step {i}</span>
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
