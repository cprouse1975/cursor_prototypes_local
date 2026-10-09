import { NavLink, Outlet } from 'react-router-dom';
import { NAV_STEPS } from '../data/classData';

export default function AppShell() {
  const phases = [...new Set(NAV_STEPS.map((s) => s.phase))];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark">
          <strong>Command Cloud</strong>
          <span>Concrete Classes Prototype</span>
        </div>

        {phases.map((phase) => (
          <div key={phase}>
            <div className="nav-phase">{phase}</div>
            {NAV_STEPS.filter((s) => s.phase === phase).map((step) => (
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

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,.1)', fontSize: '.75rem', color: 'rgba(232,241,246,.4)', lineHeight: 1.5 }}>
          <div style={{ marginBottom: '.3rem' }}>
            <span className="dot existing" />Existing class
          </div>
          <div>
            <span className="dot new" />New class (Rod's requirements)
          </div>
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
