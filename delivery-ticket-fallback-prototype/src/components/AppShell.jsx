import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { NAV } from '../data/demoData';
import { useConfig } from '../context/ConfigContext.jsx';
import ModeBadge from './ModeBadge.jsx';

export default function AppShell() {
  const { pathname } = useLocation();
  const { companyMode, modes, simulateOutage } = useConfig();
  const phases = [...new Set(NAV.map((s) => s.phase))];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark">
          <strong>TrackIt · Deliveries</strong>
          <span>Printed ticket fallback (concept)</span>
        </div>

        <div className="sidebar-status">
          <span className="label">Company default</span>
          <ModeBadge mode={companyMode} />
          {companyMode === 'hybrid' && simulateOutage && (
            <span className="outage-pill">Simulated WAN outage</span>
          )}
        </div>

        {phases.map((phase) => (
          <div key={phase}>
            <div className="nav-phase">{phase}</div>
            {NAV.filter((s) => s.phase === phase).map((step) => (
              <NavLink
                key={step.id}
                to={step.path}
                end={step.path === '/'}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                {step.label}
              </NavLink>
            ))}
          </div>
        ))}
      </aside>

      <main className="main">
        <div className="flow-strip" aria-label="Prototype sections">
          {NAV.map((step, i) => (
            <span key={step.id} style={{ display: 'contents' }}>
              <span className={`flow-step${pathname === step.path || (step.path === '/' && pathname === '/') ? ' active' : ''}`}>
                {i + 1}. {step.label}
              </span>
              {i < NAV.length - 1 && <span className="flow-arrow">→</span>}
            </span>
          ))}
        </div>
        <Outlet />
        <footer className="proto-footer">
          Concept only — not shipped product. Modes: {Object.values(modes).map((m) => m.short).join(', ')}.
        </footer>
      </main>
    </div>
  );
}
