import { motion, type Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Cpu,
  HardDrive,
  Layers,
  Lock,
  AlertTriangle,
  Disc,
  ArrowRight,
  Play,
  Zap,
  BookOpen,
  FlaskConical,
  TrendingUp,
} from 'lucide-react';

const modules = [
  {
    to: '/cpu',
    icon: Cpu,
    title: 'CPU Scheduling',
    description: 'FCFS, SJF, SRTF, Round Robin, Priority scheduling with Gantt charts and metrics',
    color: '#22d3ee',
    bg: 'rgba(34, 211, 238, 0.08)',
    border: 'rgba(34, 211, 238, 0.2)',
    algorithms: 6,
  },
  {
    to: '/memory',
    icon: HardDrive,
    title: 'Memory Management',
    description: 'First Fit, Best Fit, Worst Fit, Next Fit allocation with fragmentation analysis',
    color: '#a78bfa',
    bg: 'rgba(167, 139, 250, 0.08)',
    border: 'rgba(167, 139, 250, 0.2)',
    algorithms: 4,
  },
  {
    to: '/paging',
    icon: Layers,
    title: 'Page Replacement',
    description: 'FIFO, LRU, Optimal, Second Chance with frame visualization and hit/fault analysis',
    color: '#818cf8',
    bg: 'rgba(129, 140, 248, 0.08)',
    border: 'rgba(129, 140, 248, 0.2)',
    algorithms: 4,
  },
  {
    to: '/sync',
    icon: Lock,
    title: 'Synchronization',
    description: 'Producer-Consumer and Dining Philosophers deterministic simulations',
    color: '#34d399',
    bg: 'rgba(52, 211, 153, 0.08)',
    border: 'rgba(52, 211, 153, 0.2)',
    algorithms: 2,
  },
  {
    to: '/deadlock',
    icon: AlertTriangle,
    title: 'Deadlock',
    description: "Banker's Algorithm safety check, deadlock detection, and resource allocation graphs",
    color: '#fbbf24',
    bg: 'rgba(251, 191, 36, 0.08)',
    border: 'rgba(251, 191, 36, 0.2)',
    algorithms: 2,
  },
  {
    to: '/disk',
    icon: Disc,
    title: 'Disk Scheduling',
    description: 'FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK with seek sequence visualization',
    color: '#fb7185',
    bg: 'rgba(251, 113, 133, 0.08)',
    border: 'rgba(251, 113, 133, 0.2)',
    algorithms: 6,
  },
];

const quickDemos = [
  { label: 'Round Robin Demo', to: '/cpu', params: 'demo=rr', color: '#22d3ee' },
  { label: 'SRTF Demo', to: '/cpu', params: 'demo=srtf', color: '#22d3ee' },
  { label: 'LRU Demo', to: '/paging', params: 'demo=lru', color: '#818cf8' },
  { label: "Banker's Demo", to: '/deadlock', params: 'demo=safe', color: '#fbbf24' },
  { label: 'SCAN Demo', to: '/disk', params: 'demo=scan', color: '#fb7185' },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Dashboard() {
  return (
    <div style={{ padding: '32px', maxWidth: 1280, margin: '0 auto' }}>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: 40 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, var(--color-accent-cyan-dim), var(--color-accent-violet-dim))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow-cyan)',
            }}
          >
            <Zap size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              OSim Nexus
            </h1>
            <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.85rem', fontWeight: 400, marginTop: 2 }}>
              Interactive Operating Systems Simulation & Visualization Lab
            </p>
          </div>
        </div>
        <p
          style={{
            maxWidth: 640,
            color: 'var(--color-text-secondary)',
            fontSize: '0.9rem',
            lineHeight: 1.6,
            marginTop: 16,
          }}
        >
          Explore process scheduling, memory management, paging, synchronization, deadlock, and disk
          scheduling through deterministic interactive simulations with real-time visualization.
        </p>
      </motion.div>

      {/* Quick Demos */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ marginBottom: 32 }}
      >
        <h2
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--color-text-tertiary)',
            marginBottom: 12,
          }}
        >
          Quick Start
        </h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {quickDemos.map((demo) => (
            <Link
              key={demo.label}
              to={`${demo.to}?${demo.params}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 999,
                background: `${demo.color}10`,
                border: `1px solid ${demo.color}30`,
                color: demo.color,
                textDecoration: 'none',
                fontSize: '0.78rem',
                fontWeight: 500,
                transition: 'all 0.15s',
              }}
            >
              <Play size={12} />
              {demo.label}
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Module Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: 16,
          marginBottom: 40,
        }}
      >
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <motion.div key={mod.to} variants={itemVariants}>
              <Link
                to={mod.to}
                style={{
                  display: 'block',
                  textDecoration: 'none',
                  padding: '20px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--color-bg-secondary)',
                  border: `1px solid var(--color-border-default)`,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = mod.border;
                  el.style.boxShadow = `0 4px 20px ${mod.color}15`;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = 'var(--color-border-default)';
                  el.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: mod.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 14,
                    }}
                  >
                    <Icon size={18} color={mod.color} />
                  </div>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      color: mod.color,
                      background: mod.bg,
                      padding: '3px 8px',
                      borderRadius: 999,
                      fontWeight: 600,
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {mod.algorithms} algo{mod.algorithms > 1 ? 's' : ''}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    marginBottom: 6,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {mod.title}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', lineHeight: 1.5 }}>
                  {mod.description}
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    marginTop: 16,
                    fontSize: '0.78rem',
                    color: mod.color,
                    fontWeight: 500,
                  }}
                >
                  Open Module <ArrowRight size={14} />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Stats Strip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginBottom: 40,
        }}
      >
        {[
          { label: 'Total Algorithms', value: '24', icon: FlaskConical, color: '#22d3ee' },
          { label: 'Simulation Modules', value: '6', icon: Cpu, color: '#a78bfa' },
          { label: 'Visualization Types', value: '12+', icon: TrendingUp, color: '#818cf8' },
          { label: 'OS Concepts', value: '30+', icon: BookOpen, color: '#34d399' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              style={{
                padding: '16px 20px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border-default)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Icon size={14} color={stat.color} />
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {stat.label}
                </span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: stat.color }}>
                {stat.value}
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Architecture Preview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-default)',
        }}
      >
        <h2 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 16 }}>System Architecture</h2>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
          }}
        >
          {[
            { label: 'React UI', color: '#22d3ee' },
            { label: '→', color: 'var(--color-text-muted)' },
            { label: 'API Layer', color: '#a78bfa' },
            { label: '→', color: 'var(--color-text-muted)' },
            { label: 'FastAPI', color: '#818cf8' },
            { label: '→', color: 'var(--color-text-muted)' },
            { label: 'Simulation Engines', color: '#34d399' },
          ].map((item, i) =>
            item.label === '→' ? (
              <span key={i} style={{ color: item.color }}>→</span>
            ) : (
              <span
                key={i}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: `${item.color}12`,
                  border: `1px solid ${item.color}25`,
                  color: item.color,
                  fontWeight: 500,
                }}
              >
                {item.label}
              </span>
            )
          )}
        </div>
      </motion.div>
    </div>
  );
}
