import { useLocation } from 'react-router-dom';
import { Search, RotateCcw, HelpCircle } from 'lucide-react';

const routeLabels: Record<string, { title: string; breadcrumb: string[] }> = {
  '/': { title: 'Overview', breadcrumb: ['Dashboard'] },
  '/cpu': { title: 'CPU Scheduling', breadcrumb: ['Simulations', 'CPU Scheduling'] },
  '/memory': { title: 'Memory Management', breadcrumb: ['Simulations', 'Memory Management'] },
  '/paging': { title: 'Page Replacement', breadcrumb: ['Simulations', 'Page Replacement'] },
  '/sync': { title: 'Synchronization', breadcrumb: ['Simulations', 'Synchronization'] },
  '/deadlock': { title: 'Deadlock', breadcrumb: ['Simulations', 'Deadlock'] },
  '/disk': { title: 'Disk Scheduling', breadcrumb: ['Simulations', 'Disk Scheduling'] },
  '/lab': { title: 'Algorithm Lab', breadcrumb: ['Tools', 'Algorithm Lab'] },
  '/docs': { title: 'Documentation', breadcrumb: ['Resources', 'Documentation'] },
};

export default function TopBar() {
  const location = useLocation();
  const route = routeLabels[location.pathname] || { title: 'OSim Nexus', breadcrumb: [] };

  return (
    <header
      style={{
        height: 52,
        background: 'var(--color-bg-secondary)',
        borderBottom: '1px solid var(--color-border-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        flexShrink: 0,
        zIndex: 30,
      }}
    >
      {/* Left: Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {route.breadcrumb.map((crumb, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {i > 0 && <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>/</span>}
              <span
                style={{
                  fontSize: '0.8rem',
                  color: i === route.breadcrumb.length - 1 ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                  fontWeight: i === route.breadcrumb.length - 1 ? 600 : 400,
                }}
              >
                {crumb}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* Search / Command Palette Hint */}
        <button
          className="btn btn-ghost btn-sm"
          style={{ gap: 8, color: 'var(--color-text-tertiary)' }}
          title="Search (Ctrl+K)"
        >
          <Search size={14} />
          <span style={{ fontSize: '0.75rem' }}>Search</span>
          <kbd
            style={{
              fontSize: '0.65rem',
              padding: '1px 5px',
              borderRadius: 4,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border-default)',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            ⌘K
          </kbd>
        </button>

        <button className="btn btn-ghost btn-sm" title="Reset">
          <RotateCcw size={14} />
        </button>

        <button className="btn btn-ghost btn-sm" title="Help">
          <HelpCircle size={14} />
        </button>
      </div>
    </header>
  );
}
