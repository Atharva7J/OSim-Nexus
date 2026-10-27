import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Lock,
  Loader2,
  RotateCcw,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Utensils,
  ArrowRight,
} from 'lucide-react';
import {
  runProducerConsumer,
  runDiningPhilosophers,
  type ProducerConsumerResult,
  type DiningPhilosophersResult,
} from '../lib/api';

export default function SyncPage() {
  const [tab, setTab] = useState<'pc' | 'dp'>('pc');

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
          <Lock size={22} color="var(--color-accent-emerald)" />
          Process Synchronization Lab
        </h1>
        <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.85rem', marginTop: 4 }}>
          Live step-interactive simulations of classic OS concurrency problems powered by backend deterministic semaphore engines
        </p>
      </motion.div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        <button
          className={`btn btn-sm ${tab === 'pc' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTab('pc')}
        >
          Producer-Consumer (Bounded Buffer)
        </button>
        <button
          className={`btn btn-sm ${tab === 'dp' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTab('dp')}
        >
          Dining Philosophers (Resource Contention)
        </button>
      </div>

      {tab === 'pc' ? <ProducerConsumerInteractive /> : <DiningPhilosophersInteractive />}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PRODUCER-CONSUMER (BOUNDED BUFFER) INTERACTIVE
   ────────────────────────────────────────────────────────────────────────── */
function ProducerConsumerInteractive() {
  const [bufferSize, setBufferSize] = useState(4);
  const [nextItemNum, setNextItemNum] = useState(1);
  const [customItem, setCustomItem] = useState('');
  const [actionHistory, setActionHistory] = useState<{ actor: string; action: string; item?: string }[]>([]);
  const [result, setResult] = useState<ProducerConsumerResult | null>(null);
  const [selectedStep, setSelectedStep] = useState<number>(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Execute actions sequence against backend
  const executeSequence = async (
    actions: { actor: string; action: string; item?: string }[],
    size: number
  ) => {
    setLoading(true);
    setError('');
    try {
      if (actions.length === 0) {
        setResult(null);
        setSelectedStep(-1);
        return;
      }
      const res = await runProducerConsumer(actions, size);
      setResult(res);
      setSelectedStep(res.steps.length - 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleProduce = () => {
    const itemName = customItem.trim() || `Item-${nextItemNum}`;
    const newActions = [...actionHistory, { actor: 'Producer', action: 'produce', item: itemName }];
    setActionHistory(newActions);
    setNextItemNum((prev) => prev + 1);
    setCustomItem('');
    executeSequence(newActions, bufferSize);
  };

  const handleConsume = () => {
    const newActions = [...actionHistory, { actor: 'Consumer', action: 'consume' }];
    setActionHistory(newActions);
    executeSequence(newActions, bufferSize);
  };

  const handleReset = () => {
    setActionHistory([]);
    setResult(null);
    setSelectedStep(-1);
    setNextItemNum(1);
    setCustomItem('');
  };

  // Presets
  const loadPreset = (type: 'balanced' | 'overflow' | 'underflow') => {
    let preset: { actor: string; action: string; item?: string }[] = [];
    if (type === 'balanced') {
      preset = [
        { actor: 'Producer', action: 'produce', item: 'P-1' },
        { actor: 'Producer', action: 'produce', item: 'P-2' },
        { actor: 'Consumer', action: 'consume' },
        { actor: 'Producer', action: 'produce', item: 'P-3' },
        { actor: 'Consumer', action: 'consume' },
      ];
    } else if (type === 'overflow') {
      preset = [
        { actor: 'Producer', action: 'produce', item: 'A' },
        { actor: 'Producer', action: 'produce', item: 'B' },
        { actor: 'Producer', action: 'produce', item: 'C' },
        { actor: 'Producer', action: 'produce', item: 'D' },
        { actor: 'Producer', action: 'produce', item: 'OVERFLOW_E' },
      ];
    } else if (type === 'underflow') {
      preset = [
        { actor: 'Producer', action: 'produce', item: 'SingleItem' },
        { actor: 'Consumer', action: 'consume' },
        { actor: 'Consumer', action: 'consume' },
      ];
    }
    setActionHistory(preset);
    executeSequence(preset, bufferSize);
  };

  const currentStepData =
    result && selectedStep >= 0 && selectedStep < result.steps.length
      ? result.steps[selectedStep]
      : null;

  const currentBuffer = currentStepData ? currentStepData.buffer_state : [];
  const currentSemaphores = currentStepData
    ? currentStepData.semaphores
    : { empty: bufferSize, full: 0, mutex: 1 };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20, alignItems: 'start' }}>
      {/* Controls Column */}
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
              Buffer Settings
            </span>
            <button className="btn btn-ghost btn-sm" onClick={handleReset} title="Reset">
              <RotateCcw size={12} /> Reset
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Buffer Capacity ($N$):
            </label>
            <input
              className="input mono"
              type="number"
              min={1}
              max={10}
              value={bufferSize}
              onChange={(e) => {
                const s = Math.max(1, Number(e.target.value));
                setBufferSize(s);
                if (actionHistory.length > 0) executeSequence(actionHistory, s);
              }}
              style={{ width: 70 }}
            />
          </div>
        </div>

        {/* Live Step Actions */}
        <div className="card" style={{ padding: '16px', marginBottom: 12 }}>
          <label
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              color: 'var(--color-text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              display: 'block',
              marginBottom: 10,
            }}
          >
            Live Actions
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                className="input"
                placeholder={`Item name (default: Item-${nextItemNum})`}
                value={customItem}
                onChange={(e) => setCustomItem(e.target.value)}
                style={{ fontSize: '0.78rem' }}
                onKeyDown={(e) => e.key === 'Enter' && handleProduce()}
              />
              <button
                className="btn btn-primary btn-sm"
                onClick={handleProduce}
                disabled={loading}
                style={{ whiteSpace: 'nowrap' }}
              >
                {loading ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
                Produce
              </button>
            </div>

            <button
              className="btn btn-secondary btn-sm"
              onClick={handleConsume}
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Consume Next Item
            </button>
          </div>
        </div>

        {/* Workflow Presets */}
        <div className="card" style={{ padding: '16px' }}>
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
            Scenarios & Edge Cases
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => loadPreset('balanced')}>
              <Sparkles size={12} /> Alternating Flow (Produce & Consume)
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => loadPreset('overflow')}>
              <AlertCircle size={12} color="#fb7185" /> Buffer Overflow (Capacity Exceeded)
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => loadPreset('underflow')}>
              <AlertCircle size={12} color="#fbbf24" /> Buffer Underflow (Empty Buffer)
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              marginTop: 12,
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

      {/* Visualization Column */}
      <div>
        {/* Semaphore Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
          <div className="card" style={{ padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Semaphore: empty
            </div>
            <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: currentSemaphores.empty === 0 ? '#fb7185' : '#34d399', marginTop: 2 }}>
              {currentSemaphores.empty}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
              {currentSemaphores.empty === 0 ? 'Full (Producers Block)' : `${currentSemaphores.empty} slot(s) free`}
            </div>
          </div>

          <div className="card" style={{ padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Semaphore: full
            </div>
            <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: currentSemaphores.full > 0 ? '#22d3ee' : 'var(--color-text-muted)', marginTop: 2 }}>
              {currentSemaphores.full}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
              {currentSemaphores.full === 0 ? 'Empty (Consumers Block)' : `${currentSemaphores.full} item(s) available`}
            </div>
          </div>

          <div className="card" style={{ padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Semaphore: mutex
            </div>
            <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#a78bfa', marginTop: 2 }}>
              {currentSemaphores.mutex}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
              Binary lock (1 = Unlocked)
            </div>
          </div>
        </div>

        {/* Visual Buffer Shelf */}
        <div className="card" style={{ padding: '20px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Bounded Buffer Memory State (Slots: {bufferSize})
            </h3>
            <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Usage: {currentBuffer.length} / {bufferSize}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${bufferSize}, 1fr)`, gap: 10 }}>
            {Array.from({ length: bufferSize }).map((_, idx) => {
              const item = currentBuffer[idx];
              const isOccupied = item !== undefined;

              return (
                <div
                  key={idx}
                  style={{
                    height: 72,
                    borderRadius: 'var(--radius-md)',
                    border: isOccupied
                      ? '1px solid rgba(34, 211, 238, 0.4)'
                      : '1px dashed var(--color-border-default)',
                    background: isOccupied
                      ? 'linear-gradient(135deg, rgba(34, 211, 238, 0.12), rgba(129, 140, 248, 0.12))'
                      : 'var(--color-bg-elevated)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 6,
                    position: 'relative',
                  }}
                >
                  <span
                    className="mono"
                    style={{
                      position: 'absolute',
                      top: 4,
                      left: 6,
                      fontSize: '0.62rem',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    [{idx}]
                  </span>
                  {isOccupied ? (
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} style={{ textAlign: 'center' }}>
                      <div
                        className="mono"
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: '#22d3ee',
                          wordBreak: 'break-all',
                        }}
                      >
                        {item}
                      </div>
                      <span style={{ fontSize: '0.62rem', color: '#34d399' }}>Stored</span>
                    </motion.div>
                  ) : (
                    <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                      Empty
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Status Banner & Stepper */}
        {currentStepData && (
          <div
            style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-lg)',
              background:
                currentStepData.action === 'blocked'
                  ? 'rgba(251, 113, 133, 0.08)'
                  : 'rgba(52, 211, 153, 0.08)',
              border: `1px solid ${
                currentStepData.action === 'blocked'
                  ? 'rgba(251, 113, 133, 0.25)'
                  : 'rgba(52, 211, 153, 0.25)'
              }`,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {currentStepData.action === 'blocked' ? (
                <AlertCircle size={24} color="#fb7185" />
              ) : (
                <CheckCircle2 size={24} color="#34d399" />
              )}
              <div>
                <div
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: currentStepData.action === 'blocked' ? '#fb7185' : '#34d399',
                  }}
                >
                  Step {currentStepData.step + 1}: {currentStepData.actor} —{' '}
                  {currentStepData.action.toUpperCase()}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>
                  {currentStepData.description}
                </div>
              </div>
            </div>

            {result && result.steps.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedStep((s) => Math.max(0, s - 1))}
                  disabled={selectedStep <= 0}
                  title="Previous Step"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {selectedStep + 1}/{result.steps.length}
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedStep((s) => Math.min(result.steps.length - 1, s + 1))}
                  disabled={selectedStep >= result.steps.length - 1}
                  title="Next Step"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step Trace History */}
        {result && result.steps.length > 0 && (
          <div className="card" style={{ padding: '16px' }}>
            <h4
              style={{
                fontSize: '0.74rem',
                fontWeight: 600,
                color: 'var(--color-text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 10,
              }}
            >
              Step Execution History
            </h4>
            <div style={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {result.steps.map((st, i) => (
                <div
                  key={st.step}
                  onClick={() => setSelectedStep(i)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: i === selectedStep ? 'var(--color-bg-hover)' : 'var(--color-bg-elevated)',
                    border: i === selectedStep ? '1px solid var(--color-border-default)' : '1px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.78rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="mono" style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>
                      #{i + 1}
                    </span>
                    <span
                      style={{
                        fontWeight: 600,
                        color:
                          st.action === 'blocked'
                            ? '#fb7185'
                            : st.action === 'produce'
                            ? '#34d399'
                            : '#22d3ee',
                      }}
                    >
                      {st.actor} ({st.action})
                    </span>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.74rem' }}>
                      {st.description}
                    </span>
                  </div>
                  <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                    [e:{st.semaphores.empty}, f:{st.semaphores.full}]
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   DINING PHILOSOPHERS INTERACTIVE
   ────────────────────────────────────────────────────────────────────────── */
function DiningPhilosophersInteractive() {
  const [numPhil, setNumPhil] = useState(5);
  const [actionHistory, setActionHistory] = useState<{ philosopher: number; action: string }[]>([]);
  const [result, setResult] = useState<DiningPhilosophersResult | null>(null);
  const [selectedStep, setSelectedStep] = useState<number>(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const executeSequence = async (
    actions: { philosopher: number; action: string }[],
    n: number
  ) => {
    setLoading(true);
    setError('');
    try {
      if (actions.length === 0) {
        setResult(null);
        setSelectedStep(-1);
        return;
      }
      const res = await runDiningPhilosophers(n, actions);
      setResult(res);
      setSelectedStep(res.steps.length - 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePhilosopherAction = (philosopherIdx: number, action: 'pickup' | 'putdown') => {
    const newActions = [...actionHistory, { philosopher: philosopherIdx, action }];
    setActionHistory(newActions);
    executeSequence(newActions, numPhil);
  };

  const handleReset = () => {
    setActionHistory([]);
    setResult(null);
    setSelectedStep(-1);
  };

  // Presets
  const loadPreset = (type: 'alternating' | 'contention' | 'round') => {
    let preset: { philosopher: number; action: string }[] = [];
    if (type === 'alternating') {
      // P0 and P2 eat concurrently
      preset = [
        { philosopher: 0, action: 'pickup' },
        { philosopher: 2, action: 'pickup' },
      ];
    } else if (type === 'contention') {
      // P0 picks up both forks, then P1 tries to pick up (blocked by fork 1)
      preset = [
        { philosopher: 0, action: 'pickup' },
        { philosopher: 1, action: 'pickup' },
        { philosopher: 4, action: 'pickup' },
      ];
    } else if (type === 'round') {
      // P0 eats, puts down; then P1 eats, puts down
      preset = [
        { philosopher: 0, action: 'pickup' },
        { philosopher: 0, action: 'putdown' },
        { philosopher: 1, action: 'pickup' },
        { philosopher: 1, action: 'putdown' },
      ];
    }
    setActionHistory(preset);
    executeSequence(preset, numPhil);
  };

  const currentStepData =
    result && selectedStep >= 0 && selectedStep < result.steps.length
      ? result.steps[selectedStep]
      : null;

  const philosopherStates = currentStepData
    ? currentStepData.philosophers
    : Array(numPhil).fill('THINKING');

  const forkHolders = currentStepData
    ? currentStepData.forks
    : Array(numPhil).fill(null);

  const stateColors: Record<string, { bg: string; border: string; text: string }> = {
    THINKING: { bg: 'rgba(129, 140, 248, 0.1)', border: 'rgba(129, 140, 248, 0.25)', text: '#818cf8' },
    HUNGRY: { bg: 'rgba(251, 191, 36, 0.1)', border: 'rgba(251, 191, 36, 0.3)', text: '#fbbf24' },
    EATING: { bg: 'rgba(52, 211, 153, 0.15)', border: 'rgba(52, 211, 153, 0.4)', text: '#34d399' },
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20, alignItems: 'start' }}>
      {/* Controls Column */}
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
              Dining Table Setup
            </span>
            <button className="btn btn-ghost btn-sm" onClick={handleReset} title="Reset Table">
              <RotateCcw size={12} /> Reset
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Philosophers ($N$):
            </label>
            <input
              className="input mono"
              type="number"
              min={2}
              max={8}
              value={numPhil}
              onChange={(e) => {
                const n = Math.max(2, Math.min(8, Number(e.target.value)));
                setNumPhil(n);
                handleReset();
              }}
              style={{ width: 70 }}
            />
          </div>
        </div>

        {/* Individual Philosopher Controls */}
        <div className="card" style={{ padding: '16px', marginBottom: 12 }}>
          <label
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              color: 'var(--color-text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              display: 'block',
              marginBottom: 10,
            }}
          >
            Direct Philosopher Controls
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array.from({ length: numPhil }).map((_, i) => {
              const state = philosopherStates[i] || 'THINKING';
              const isEating = state === 'EATING';

              return (
                <div
                  key={i}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-bg-elevated)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="mono" style={{ fontWeight: 700, fontSize: '0.8rem' }}>
                      P{i}
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: stateColors[state]?.text || 'var(--color-text-muted)',
                      }}
                    >
                      {state}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handlePhilosopherAction(i, 'pickup')}
                      disabled={loading || isEating}
                      style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                    >
                      Pick Up
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handlePhilosopherAction(i, 'putdown')}
                      disabled={loading || !isEating}
                      style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                    >
                      Put Down
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Presets */}
        <div className="card" style={{ padding: '16px' }}>
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
            Scenarios & Contention
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => loadPreset('alternating')}>
              <Sparkles size={12} /> Concurrent Eating (P0 & P2)
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => loadPreset('contention')}>
              <AlertCircle size={12} color="#fbbf24" /> Fork Contention (Neighbor Blocked)
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => loadPreset('round')}>
              <ArrowRight size={12} /> Sequential Dining Round
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              marginTop: 12,
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

      {/* Visualization Column */}
      <div>
        {/* Table & Fork State Card */}
        <div className="card" style={{ padding: '20px', marginBottom: 16 }}>
          <h3
            style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--color-text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 16,
            }}
          >
            Dining Table & Resource Status
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(numPhil, 5)}, 1fr)`, gap: 12 }}>
            {Array.from({ length: numPhil }).map((_, i) => {
              const state = philosopherStates[i] || 'THINKING';
              const leftFork = i;
              const rightFork = (i + 1) % numPhil;
              const style = stateColors[state] || stateColors.THINKING;

              return (
                <div
                  key={i}
                  style={{
                    padding: '14px 10px',
                    borderRadius: 'var(--radius-md)',
                    background: style.bg,
                    border: `1px solid ${style.border}`,
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: 'var(--color-bg-primary)',
                      border: `2px solid ${style.text}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <Utensils size={18} color={style.text} />
                  </div>

                  <span className="mono" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                    P{i}
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: style.text,
                      marginTop: 2,
                    }}
                  >
                    {state}
                  </span>

                  <div
                    style={{
                      marginTop: 8,
                      fontSize: '0.65rem',
                      color: 'var(--color-text-muted)',
                      borderTop: '1px solid var(--color-border-subtle)',
                      paddingTop: 6,
                      width: '100%',
                    }}
                  >
                    Needs: F{leftFork} & F{rightFork}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Forks Breakdown Bar */}
          <div
            style={{
              marginTop: 18,
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-bg-elevated)',
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>
              Shared Fork Resource States:
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {forkHolders.map((holder, fIdx) => (
                <div
                  key={fIdx}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: holder ? 'rgba(52, 211, 153, 0.12)' : 'var(--color-bg-secondary)',
                    border: `1px solid ${holder ? 'rgba(52, 211, 153, 0.3)' : 'var(--color-border-default)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.75rem',
                  }}
                >
                  <span style={{ fontSize: '0.85rem' }}>🍴</span>
                  <span className="mono" style={{ fontWeight: 600 }}>Fork {fIdx}:</span>
                  <span
                    className="mono"
                    style={{
                      color: holder ? '#34d399' : 'var(--color-text-muted)',
                      fontWeight: holder ? 700 : 400,
                    }}
                  >
                    {holder ? `Held by ${holder}` : 'Available'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step Status Banner & Stepper */}
        {currentStepData && (
          <div
            style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border-default)',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 14,
            }}
          >
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Step {currentStepData.step + 1}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>
                {currentStepData.description}
              </div>
            </div>

            {result && result.steps.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedStep((s) => Math.max(0, s - 1))}
                  disabled={selectedStep <= 0}
                  title="Previous Step"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {selectedStep + 1}/{result.steps.length}
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedStep((s) => Math.min(result.steps.length - 1, s + 1))}
                  disabled={selectedStep >= result.steps.length - 1}
                  title="Next Step"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step Trace History */}
        {result && result.steps.length > 0 && (
          <div className="card" style={{ padding: '16px' }}>
            <h4
              style={{
                fontSize: '0.74rem',
                fontWeight: 600,
                color: 'var(--color-text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 10,
              }}
            >
              Transition Sequence History
            </h4>
            <div style={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {result.steps.map((st, i) => (
                <div
                  key={st.step}
                  onClick={() => setSelectedStep(i)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: i === selectedStep ? 'var(--color-bg-hover)' : 'var(--color-bg-elevated)',
                    border: i === selectedStep ? '1px solid var(--color-border-default)' : '1px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.78rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="mono" style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>
                      #{i + 1}
                    </span>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.76rem' }}>
                      {st.description}
                    </span>
                  </div>
                  <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                    [{st.philosophers.join(', ')}]
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
