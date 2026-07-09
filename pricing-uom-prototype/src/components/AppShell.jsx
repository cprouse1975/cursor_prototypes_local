import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { JOURNEY_STEPS } from '../data/demoData';

export default function AppShell() {
  const { pathname } = useLocation();

  const phases = [...new Set(JOURNEY_STEPS.map((s) => s.phase))];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark">
          <strong>Command Cloud</strong>
          <span>Sales UOM &amp; Pricing Prototype</span>
        </div>

        {phases.map((phase) => (
          <div key={phase}>
            <div className="nav-phase">{phase}</div>
            {JOURNEY_STEPS.filter((s) => s.phase === phase).map((step) => (
              <NavLink
                key={step.id}
                to={step.path}
                end={step.path === '/'}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                {step.label}
                {step.tickets.length > 0 && <small>{step.tickets.join(' · ')}</small>}
              </NavLink>
            ))}
          </div>
        ))}
      </aside>

      <main className="main">
        <div className="flow-strip" aria-label="Journey progress">
          {JOURNEY_STEPS.filter((s) => !['vision', 'gaps'].includes(s.id)).map((step, i, arr) => (
            <span key={step.id} style={{ display: 'contents' }}>
              <span className={`flow-step${pathname === step.path ? ' active' : ''}`}>
                {i + 1}. {step.label}
              </span>
              {i < arr.length - 1 && <span className="flow-arrow">→</span>}
            </span>
          ))}
        </div>
        <Outlet />
      </main>
    </div>
  );
}
