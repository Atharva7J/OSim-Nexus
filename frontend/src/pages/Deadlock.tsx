import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  AlertTriangle,
  Loader2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  List,
  Sparkles,
} from 'lucide-react';
import {
  runBankers,
  runDeadlockDetection,
  type BankerState,
  type DeadlockDetectionResult,
} from '../lib/api';

const BANKER_DEMOS: Record<
  string,
  { avail: number[]; max: number[][]; alloc: number[][]; pids: string[] }
> = {
  safe: {
    avail: [3, 3, 2],
    max: [
      [7, 5, 3],
      [3, 2, 2],
      [9, 0, 2],
      [2, 2, 2],
      [4, 3, 3],
    ],
    alloc: [
      [0, 1, 0],
      [2, 0, 0],
      [3, 0, 2],
      [2, 1, 1],
      [0, 0, 2],
    ],
    pids: ['P0', 'P1', 'P2', 'P3', 'P4'],
  },
  unsafe: {
    avail: [1, 0, 0],
    max: [
      [7, 5, 3],
      [3, 2, 2],
      [9, 0, 2],
      [2, 2, 2],
      [4, 3, 3],
    ],
    alloc: [
      [0, 1, 0],
      [3, 2, 2],
      [6, 0, 2],
      [2, 1, 1],
      [4, 3, 1],
    ],
    pids: ['P0', 'P1', 'P2', 'P3', 'P4'],
  },
};

const DETECTION_DEMOS = {
  cycle: {
    label: 'Deadlock Cycle (P0 ↔ P1)',
    avail: [0, 0, 0],
    alloc: [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ],
    req: [
      [0, 1, 0],
      [1, 0, 0],
      [0, 0, 0],
    ],
    pids: ['P0', 'P1', 'P2'],
  },
  safe: {
    label: 'Deadlock-Free Allocation',
    avail: [0, 0, 0],
    alloc: [
      [1, 0, 0],
      [0, 1, 0],
    ],
    req: [
      [0, 0, 0],
      [1, 0, 0],
    ],
    pids: ['P0', 'P1'],
  },
};

export default function DeadlockPage() {
  const [searchParams] = useSearchParams();
  const demoKey = searchParams.get('demo');
  const demoData = demoKey && BANKER_DEMOS[demoKey] ? BANKER_DEMOS[demoKey] : null;

  const [activeTab, setActiveTab] = useState<'bankers' | 'detection'>('bankers');

  // Banker's Algorithm state
  const [available, setAvailable] = useState(demoData ? demoData.avail.join(', ') : '3, 3, 2');
  const [maximum, setMaximum] = useState(
    demoData
      ? demoData.max.map((r) => r.join(' ')).join('\n')
      : '7 5 3\n3 2 2\n9 0 2\n2 2 2\n4 3 3'
  );
  const [allocation, setAllocation] = useState(
    demoData
      ? demoData.alloc.map((r) => r.join(' ')).join('\n')
      : '0 1 0\n2 0 0\n3 0 2\n2 1 1\n0 0 2'
  );
  const [bankerResult, setBankerResult] = useState<BankerState | null>(null);

  // Deadlock Detection state
  const [detectAvail, setDetectAvail] = useState('0, 0, 0');
  const [detectAlloc, setDetectAlloc] = useState('1 0 0\n0 1 0\n0 0 1');
  const [detectReq, setDetectReq] = useState('0 1 0\n1 0 0\n0 0 0');
  const [detectionResult, setDetectionResult] = useState<DeadlockDetectionResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEvents, setShowEvents] = useState(false);

  const parseVec = (s: string): number[] =>
    s
      .split(/[,\s]+/)
      .map(Number)
      .filter((n) => !isNaN(n));

  const parseMat = (s: string): number[][] =>
    s
      .trim()
      .split('\n')
      .map((row) =>
        row
          .trim()
          .split(/\s+/)
          .map(Number)
          .filter((n) => !isNaN(n))
      );

  const runBankersCheck = async (
    availVec?: number[],
    maxMat?: number[][],
    allocMat?: number[][],
    pidsList?: string[]
  ) => {
    setLoading(true);
    setError('');
    try {
      const avail = availVec || parseVec(available);
      const max = maxMat || parseMat(maximum);
      const alloc = allocMat || parseMat(allocation);
      const pids = pidsList || max.map((_, i) => `P${i}`);
      const res = await runBankers(avail, max, alloc, pids);
      setBankerResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  const runDetectionCheck = async (
    availVec?: number[],
    allocMat?: number[][],
    reqMat?: number[][],
    pidsList?: string[]
  ) => {
    setLoading(true);
    setError('');
    try {
      const avail = availVec || parseVec(detectAvail);
      const alloc = allocMat || parseMat(detectAlloc);
      const req = reqMat || parseMat(detectReq);
      const pids = pidsList || alloc.map((_, i) => `P${i}`);
      const res = await runDeadlockDetection(avail, alloc, req, pids);
      setDetectionResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Detection failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (demoData) {
      const timer = setTimeout(() => {
        runBankersCheck(demoData.avail, demoData.max, demoData.alloc, demoData.pids);
      }, 0);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadBankerPreset = (key: 'safe' | 'unsafe') => {
    const d = BANKER_DEMOS[key];
    setAvailable(d.avail.join(', '));
    setMaximum(d.max.map((r) => r.join(' ')).join('\n'));
    setAllocation(d.alloc.map((r) => r.join(' ')).join('\n'));
    runBankersCheck(d.avail, d.max, d.alloc, d.pids);
  };

  const loadDetectionPreset = (key: 'cycle' | 'safe') => {
    const d = DETECTION_DEMOS[key];
    setDetectAvail(d.avail.join(', '));
    setDetectAlloc(d.alloc.map((r) => r.join(' ')).join('\n'));
    setDetectReq(d.req.map((r) => r.join(' ')).join('\n'));
    runDetectionCheck(d.avail, d.alloc, d.req, d.pids);
  };

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
          <AlertTriangle size={22} color="var(--color-accent-amber)" />
          Deadlock Analysis Lab
        </h1>
        <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.85rem', marginTop: 4 }}>
          Evaluate system safety using Banker's Algorithm and detect resource allocation graph deadlocks
        </p>
      </motion.div>

      {/* Mode Switcher Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        <button
          className={`btn btn-sm ${activeTab === 'bankers' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setActiveTab('bankers');
            setError('');
          }}
        >
          <Shield size={14} />
          Banker's Algorithm (Avoidance / Safety)
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'detection' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setActiveTab('detection');
            setError('');
          }}
        >
          <ShieldAlert size={14} />
          Deadlock Detection (Allocation & Request Matrices)
        </button>
      </div>

      {activeTab === 'bankers' ? (
        /* BANKER'S ALGORITHM TAB */
        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 20, alignItems: 'start' }}>
          <div>
            <div className="card" style={{ padding: '16px', marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: 'var(--color-text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  Presets
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => loadBankerPreset('safe')}>
                    <Sparkles size={12} /> Safe Demo
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => loadBankerPreset('unsafe')}>
                    <AlertTriangle size={12} /> Unsafe Demo
                  </button>
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
                  Available Vector
                </label>
                <input
                  className="input mono"
                  value={available}
                  onChange={(e) => setAvailable(e.target.value)}
                  placeholder="e.g. 3, 3, 2"
                />
              </div>
            </div>

            <div className="card" style={{ padding: '16px', marginBottom: 12 }}>
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
                Maximum Matrix (Rows = P0, P1, ...)
              </label>
              <textarea
                className="input mono"
                rows={5}
                value={maximum}
                onChange={(e) => setMaximum(e.target.value)}
                style={{ resize: 'vertical', fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <div className="card" style={{ padding: '16px', marginBottom: 12 }}>
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
                Allocation Matrix (Rows = P0, P1, ...)
              </label>
              <textarea
                className="input mono"
                rows={5}
                value={allocation}
                onChange={(e) => setAllocation(e.target.value)}
                style={{ resize: 'vertical', fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => runBankersCheck()}
              disabled={loading}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
              Run Safety Check
            </button>
            {error && (
              <div
                style={{
                  marginTop: 10,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(251,113,133,0.1)',
                  color: 'var(--color-accent-rose)',
                  fontSize: '0.8rem',
                }}
              >
                {error}
              </div>
            )}
          </div>

          <div>
            <AnimatePresence mode="wait">
              {bankerResult ? (
                <motion.div key="banker-result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div
                    style={{
                      padding: '20px 24px',
                      borderRadius: 'var(--radius-lg)',
                      background: bankerResult.is_safe ? 'rgba(52, 211, 153, 0.08)' : 'rgba(251, 113, 133, 0.08)',
                      border: `1px solid ${bankerResult.is_safe ? 'rgba(52, 211, 153, 0.25)' : 'rgba(251, 113, 133, 0.25)'}`,
                      marginBottom: 16,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                    }}
                  >
                    {bankerResult.is_safe ? <ShieldCheck size={28} color="#34d399" /> : <ShieldAlert size={28} color="#fb7185" />}
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: bankerResult.is_safe ? '#34d399' : '#fb7185' }}>
                        {bankerResult.is_safe ? 'SAFE STATE' : 'UNSAFE STATE'}
                      </div>
                      {bankerResult.is_safe ? (
                        <div className="mono" style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>
                          Safe Sequence: {bankerResult.safe_sequence.join(' → ')}
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>
                          No safe sequence exists. Granting requests may lead to deadlock.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="card" style={{ padding: '20px', marginBottom: 16 }}>
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
                      Need Matrix (Max − Allocation)
                    </h3>
                    <table style={{ borderCollapse: 'collapse', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', width: '100%' }}>
                      <thead>
                        <tr>
                          <th style={{ padding: '6px 10px', textAlign: 'left', color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>PID</th>
                          {bankerResult.need[0]?.map((_, j) => (
                            <th key={j} style={{ padding: '6px 10px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>
                              R{j}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {bankerResult.need.map((row, i) => (
                          <tr key={i} style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
                            <td style={{ padding: '6px 10px', fontWeight: 600 }}>P{i}</td>
                            {row.map((val, j) => (
                              <td key={j} style={{ padding: '6px 10px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                                {val}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

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
                        <List size={14} /> Algorithm Trace ({bankerResult.events.length} steps)
                      </span>
                      {showEvents ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                    <AnimatePresence>
                      {showEvents && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                          <div style={{ marginTop: 12, maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {bankerResult.events.map((evt, i) => (
                              <div key={i} style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-elevated)', fontSize: '0.76rem' }}>
                                <span className="mono" style={{ color: 'var(--color-text-muted)', marginRight: 8 }}>
                                  t={evt.timestamp}
                                </span>
                                <span style={{ color: 'var(--color-text-secondary)' }}>{evt.description}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ) : (
                <div style={{ padding: '60px 40px', textAlign: 'center', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-border-default)', background: 'var(--color-bg-secondary)' }}>
                  <AlertTriangle size={40} color="var(--color-text-muted)" style={{ margin: '0 auto 16px' }} />
                  <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.9rem', fontWeight: 500 }}>
                    Enter matrices or select a preset to run the Banker's safety check
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        /* DEADLOCK DETECTION TAB */
        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 20, alignItems: 'start' }}>
          <div>
            <div className="card" style={{ padding: '16px', marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: 'var(--color-text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  Detection Presets
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => loadDetectionPreset('cycle')}>
                    <AlertTriangle size={12} /> Cycle
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => loadDetectionPreset('safe')}>
                    <Sparkles size={12} /> No Deadlock
                  </button>
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
                  Available Vector
                </label>
                <input
                  className="input mono"
                  value={detectAvail}
                  onChange={(e) => setDetectAvail(e.target.value)}
                  placeholder="e.g. 0, 0, 0"
                />
              </div>
            </div>

            <div className="card" style={{ padding: '16px', marginBottom: 12 }}>
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
                Allocation Matrix (Currently Held)
              </label>
              <textarea
                className="input mono"
                rows={4}
                value={detectAlloc}
                onChange={(e) => setDetectAlloc(e.target.value)}
                style={{ resize: 'vertical', fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <div className="card" style={{ padding: '16px', marginBottom: 12 }}>
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
                Request Matrix (Currently Requested)
              </label>
              <textarea
                className="input mono"
                rows={4}
                value={detectReq}
                onChange={(e) => setDetectReq(e.target.value)}
                style={{ resize: 'vertical', fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => runDetectionCheck()}
              disabled={loading}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
              Run Deadlock Detection
            </button>
            {error && (
              <div
                style={{
                  marginTop: 10,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(251,113,133,0.1)',
                  color: 'var(--color-accent-rose)',
                  fontSize: '0.8rem',
                }}
              >
                {error}
              </div>
            )}
          </div>

          <div>
            <AnimatePresence mode="wait">
              {detectionResult ? (
                <motion.div key="detection-result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {/* Status Banner */}
                  <div
                    style={{
                      padding: '20px 24px',
                      borderRadius: 'var(--radius-lg)',
                      background: detectionResult.is_deadlocked ? 'rgba(251, 113, 133, 0.08)' : 'rgba(52, 211, 153, 0.08)',
                      border: `1px solid ${detectionResult.is_deadlocked ? 'rgba(251, 113, 133, 0.25)' : 'rgba(52, 211, 153, 0.25)'}`,
                      marginBottom: 16,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                    }}
                  >
                    {detectionResult.is_deadlocked ? <ShieldAlert size={28} color="#fb7185" /> : <ShieldCheck size={28} color="#34d399" />}
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: detectionResult.is_deadlocked ? '#fb7185' : '#34d399' }}>
                        {detectionResult.is_deadlocked ? 'DEADLOCK DETECTED' : 'NO DEADLOCK DETECTED'}
                      </div>
                      {detectionResult.is_deadlocked ? (
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>
                          Processes in deadlock:{' '}
                          <span style={{ fontWeight: 600, color: '#fb7185' }}>
                            {detectionResult.deadlocked_processes.join(', ')}
                          </span>
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>
                          All processes can eventually acquire resources, complete, and release allocations.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary Table of Processes */}
                  <div className="card" style={{ padding: '20px', marginBottom: 16 }}>
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
                      Process Status Matrix
                    </h3>
                    <table style={{ borderCollapse: 'collapse', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', width: '100%' }}>
                      <thead>
                        <tr>
                          <th style={{ padding: '6px 10px', textAlign: 'left', color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>Process</th>
                          <th style={{ padding: '6px 10px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>Allocation</th>
                          <th style={{ padding: '6px 10px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>Request</th>
                          <th style={{ padding: '6px 10px', textAlign: 'right', color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>State</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parseMat(detectAlloc).map((allocRow, i) => {
                          const reqRows = parseMat(detectReq);
                          const reqRow = reqRows[i] || [];
                          const pid = `P${i}`;
                          const isDead = detectionResult.deadlocked_processes.includes(pid);
                          return (
                            <tr key={i} style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
                              <td style={{ padding: '8px 10px', fontWeight: 600 }}>{pid}</td>
                              <td style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                                [{allocRow.join(', ')}]
                              </td>
                              <td style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                                [{reqRow.join(', ')}]
                              </td>
                              <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                                <span
                                  style={{
                                    padding: '2px 8px',
                                    borderRadius: 4,
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    background: isDead ? 'rgba(251, 113, 133, 0.12)' : 'rgba(52, 211, 153, 0.12)',
                                    color: isDead ? '#fb7185' : '#34d399',
                                    border: `1px solid ${isDead ? 'rgba(251, 113, 133, 0.25)' : 'rgba(52, 211, 153, 0.25)'}`,
                                  }}
                                >
                                  {isDead ? 'DEADLOCKED' : 'RESOLVED'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Trace Log */}
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
                        <List size={14} /> Detection Trace ({detectionResult.events.length} steps)
                      </span>
                      {showEvents ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                    <AnimatePresence>
                      {showEvents && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                          <div style={{ marginTop: 12, maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {detectionResult.events.map((evt, i) => (
                              <div key={i} style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-elevated)', fontSize: '0.76rem' }}>
                                <span className="mono" style={{ color: 'var(--color-text-muted)', marginRight: 8 }}>
                                  t={evt.timestamp}
                                </span>
                                <span style={{ color: 'var(--color-text-secondary)' }}>{evt.description}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ) : (
                <div style={{ padding: '60px 40px', textAlign: 'center', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-border-default)', background: 'var(--color-bg-secondary)' }}>
                  <ShieldAlert size={40} color="var(--color-text-muted)" style={{ margin: '0 auto 16px' }} />
                  <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.9rem', fontWeight: 500 }}>
                    Enter matrices or load a detection preset to check for deadlocks
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
