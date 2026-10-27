import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, HardDrive, Plus, Trash2, Loader2 } from 'lucide-react';
import { runMemorySimulation, type MemorySimulationResult, type MemoryBlock } from '../lib/api';

const ALGORITHMS = [
  { value: 'first_fit', label: 'First Fit' },
  { value: 'best_fit', label: 'Best Fit' },
  { value: 'worst_fit', label: 'Worst Fit' },
  { value: 'next_fit', label: 'Next Fit' },
];

const BLOCK_COLORS: Record<string, string> = {};
const PALETTE = ['#22d3ee', '#a78bfa', '#34d399', '#fbbf24', '#fb7185', '#818cf8', '#f472b6', '#38bdf8', '#4ade80', '#e879f9'];
let colorIdx = 0;
function getBlockColor(pid: string | null): string {
  if (!pid) return 'var(--color-bg-elevated)';
  if (!BLOCK_COLORS[pid]) {
    BLOCK_COLORS[pid] = PALETTE[colorIdx % PALETTE.length];
    colorIdx++;
  }
  return BLOCK_COLORS[pid];
}

interface Operation {
  type: 'allocate' | 'deallocate';
  pid: string;
  size: number;
}

export default function MemoryPage() {
  const [totalMemory, setTotalMemory] = useState(1000);
  const [algorithm, setAlgorithm] = useState('first_fit');
  const [ops, setOps] = useState<Operation[]>([
    { type: 'allocate', pid: 'P1', size: 200 },
    { type: 'allocate', pid: 'P2', size: 300 },
    { type: 'allocate', pid: 'P3', size: 150 },
    { type: 'deallocate', pid: 'P2', size: 0 },
    { type: 'allocate', pid: 'P4', size: 250 },
    { type: 'allocate', pid: 'P5', size: 100 },
  ]);
  const [result, setResult] = useState<MemorySimulationResult | null>(null);
  const [selectedStep, setSelectedStep] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const run = async () => {
    setLoading(true);
    setError('');
    try {
      const operations = ops.map((op) =>
        op.type === 'allocate' ? { type: 'allocate', pid: op.pid, size: op.size } : { type: 'deallocate', pid: op.pid }
      );
      const res = await runMemorySimulation(totalMemory, algorithm, operations);
      setResult(res);
      setSelectedStep(res.snapshots.length - 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  const addOp = (type: 'allocate' | 'deallocate') => {
    setOps([...ops, { type, pid: `P${ops.length + 1}`, size: 100 }]);
  };

  const removeOp = (idx: number) => setOps(ops.filter((_, i) => i !== idx));

  const updateOp = (idx: number, field: keyof Operation, value: string | number) => {
    const updated = [...ops];
    updated[idx] = { ...updated[idx], [field]: field === 'size' ? Number(value) : value };
    setOps(updated);
  };

  const currentSnapshot = result && selectedStep >= 0 ? result.snapshots[selectedStep] : null;

  return (
    <div style={{ padding: '24px', maxWidth: 1280, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
          <HardDrive size={22} color="var(--color-accent-violet)" />
          Memory Management Simulator
        </h1>
        <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.85rem', marginTop: 4 }}>
          Simulate contiguous memory allocation with First Fit, Best Fit, Worst Fit, and Next Fit
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Controls */}
        <div>
          <div className="card" style={{ padding: '16px', marginBottom: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Total Memory</label>
                <input className="input mono" type="number" min={1} value={totalMemory} onChange={(e) => setTotalMemory(Number(e.target.value))} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Algorithm</label>
                <select className="input" value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}>
                  {ALGORITHMS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '16px', marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Operations ({ops.length})</span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => addOp('allocate')}><Plus size={12} /> Alloc</button>
                <button className="btn btn-ghost btn-sm" onClick={() => addOp('deallocate')}><Plus size={12} /> Dealloc</button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {ops.map((op, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <select className="input" value={op.type} onChange={(e) => updateOp(i, 'type', e.target.value)} style={{ width: 100, padding: '5px 6px', fontSize: '0.75rem' }}>
                    <option value="allocate">Allocate</option>
                    <option value="deallocate">Deallocate</option>
                  </select>
                  <input className="input mono" value={op.pid} onChange={(e) => updateOp(i, 'pid', e.target.value)} style={{ width: 60, padding: '5px 6px', fontSize: '0.78rem' }} />
                  {op.type === 'allocate' && (
                    <input className="input mono" type="number" min={1} value={op.size} onChange={(e) => updateOp(i, 'size', e.target.value)} style={{ width: 60, padding: '5px 6px', fontSize: '0.78rem', textAlign: 'center' }} placeholder="Size" />
                  )}
                  <button onClick={() => removeOp(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4 }}><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%' }} onClick={run} disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            {loading ? 'Simulating...' : 'Run Simulation'}
          </button>
          {error && <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'rgba(251,113,133,0.1)', color: 'var(--color-accent-rose)', fontSize: '0.8rem' }}>{error}</div>}
        </div>

        {/* Results */}
        <div>
          {currentSnapshot && result ? (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              {/* Step selector */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
                {result.snapshots.map((_, i) => (
                  <button
                    key={i}
                    className={`btn btn-sm ${selectedStep === i ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setSelectedStep(i)}
                  >
                    Step {i + 1}
                  </button>
                ))}
              </div>

              {/* Memory Visualization */}
              <div className="card" style={{ padding: '20px', marginBottom: 16 }}>
                <h3 style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Memory Layout</h3>
                <div style={{ display: 'flex', width: '100%', height: 48, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border-default)' }}>
                  {currentSnapshot.blocks.map((block: MemoryBlock, i: number) => {
                    const widthPct = (block.size / totalMemory) * 100;
                    const color = getBlockColor(block.pid);
                    return (
                      <div
                        key={i}
                        title={block.pid ? `${block.pid}: ${block.size} units @ ${block.start}` : `Free: ${block.size} units @ ${block.start}`}
                        style={{
                          width: `${widthPct}%`,
                          height: '100%',
                          background: block.pid ? `${color}99` : color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'var(--font-mono)',
                          fontSize: widthPct > 5 ? '0.7rem' : '0.6rem',
                          fontWeight: 600,
                          color: block.pid ? 'white' : 'var(--color-text-muted)',
                          borderRight: i < currentSnapshot.blocks.length - 1 ? '1px solid var(--color-bg-primary)' : 'none',
                          transition: 'all 0.3s',
                        }}
                      >
                        {widthPct > 6 ? (block.pid || 'Free') : ''}
                      </div>
                    );
                  })}
                </div>
                {/* Block legend */}
                <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
                  {currentSnapshot.blocks.map((block: MemoryBlock, i: number) => (
                    <span key={i} className="mono" style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
                      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: getBlockColor(block.pid), marginRight: 4 }}></span>
                      {block.pid || 'Free'}: {block.size} @ {block.start}
                    </span>
                  ))}
                </div>
              </div>

              {/* Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[
                  { label: 'Allocated', value: currentSnapshot.allocated_memory, color: '#22d3ee' },
                  { label: 'Free', value: currentSnapshot.free_memory, color: '#34d399' },
                  { label: 'Largest Free', value: currentSnapshot.largest_free_block, color: '#a78bfa' },
                  { label: 'Ext. Fragmentation', value: `${(currentSnapshot.external_fragmentation * 100).toFixed(1)}%`, color: '#fbbf24' },
                ].map((s) => (
                  <div key={s.label} className="card" style={{ padding: '14px 18px' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div style={{ padding: '60px 40px', textAlign: 'center', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-border-default)', background: 'var(--color-bg-secondary)' }}>
              <HardDrive size={40} color="var(--color-text-muted)" style={{ margin: '0 auto 16px' }} />
              <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.9rem', fontWeight: 500 }}>Add allocation operations and run the simulation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
