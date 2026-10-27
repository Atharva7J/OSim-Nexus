import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Cpu,
  HardDrive,
  Layers,
  Lock,
  AlertTriangle,
  Disc,
  FlaskConical,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Overview' },
  { to: '/cpu', icon: Cpu, label: 'CPU Scheduling' },
  { to: '/memory', icon: HardDrive, label: 'Memory Management' },
  { to: '/paging', icon: Layers, label: 'Page Replacement' },
  { to: '/sync', icon: Lock, label: 'Synchronization' },
  { to: '/deadlock', icon: AlertTriangle, label: 'Deadlock' },
  { to: '/disk', icon: Disc, label: 'Disk Scheduling' },
  { to: '/lab', icon: FlaskConical, label: 'Algorithm Lab' },
  { to: '/docs', icon: BookOpen, label: 'Documentation' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 60 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg-secondary)',
        borderRight: '1px solid var(--color-border-default)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        flexShrink: 0,
        position: 'relative',
        zIndex: 40,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: collapsed ? '16px 12px' : '20px 20px',
          borderBottom: '1px solid var(--color-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          minHeight: 64,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'linear-gradient(135deg, var(--color-accent-cyan-dim), var(--color-accent-violet-dim))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Cpu size={18} color="white" />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
              OSim Nexus
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)', fontWeight: 500, marginTop: 1 }}>
              OS Simulation Lab
            </div>
          </motion.div>
        )}
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: collapsed ? '10px 14px' : '9px 12px',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: isActive ? 600 : 450,
              color: isActive ? 'var(--color-accent-cyan)' : 'var(--color-text-secondary)',
              background: isActive ? 'rgba(34, 211, 238, 0.08)' : 'transparent',
              transition: 'all 0.15s ease',
              justifyContent: collapsed ? 'center' : 'flex-start',
              position: 'relative',
            })}
            title={label}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '20%',
                      bottom: '20%',
                      width: 3,
                      borderRadius: 2,
                      background: 'var(--color-accent-cyan)',
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <Icon size={18} style={{ flexShrink: 0 }} />
                {!collapsed && <span>{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          margin: '8px',
          padding: '8px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border-default)',
          background: 'var(--color-bg-elevated)',
          color: 'var(--color-text-tertiary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s',
        }}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </motion.aside>
  );
}
