import { useConfig } from '../context/ConfigContext.jsx';
import ModeBadge from '../components/ModeBadge.jsx';

export default function CompanyPage() {
  const {
    companyMode,
    setCompanyMode,
    modes,
    hybridAutoPrint,
    setHybridAutoPrint,
    hybridThresholdMin,
    setHybridThresholdMin,
    simulateOutage,
    setSimulateOutage,
  } = useConfig();

  return (
    <div className="page">
      <header className="page-header">
        <h1>Company ticket delivery default</h1>
        <p className="lede">
          Proposed location: <code>Settings → Site Settings → Deliveries → Ticket delivery</code> (new section).
        </p>
      </header>

      <section className="card">
        <div className="field-row">
          <label htmlFor="company-mode">Default ticket medium</label>
          <select
            id="company-mode"
            value={companyMode}
            onChange={(e) => setCompanyMode(e.target.value)}
          >
            {Object.values(modes).map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
          <ModeBadge mode={companyMode} />
        </div>
        <p className="hint">{modes[companyMode].description}</p>

        {companyMode === 'hybrid' && (
          <div className="sub-panel">
            <h3>Hybrid health checks (concept)</h3>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={hybridAutoPrint}
                onChange={(e) => setHybridAutoPrint(e.target.checked)}
              />
              Auto-switch affected plants to print when WAN / TrackIt cloud unreachable
            </label>
            <div className="field-row compact">
              <label htmlFor="threshold">Outage threshold (minutes)</label>
              <input
                id="threshold"
                type="number"
                min={1}
                max={60}
                value={hybridThresholdMin}
                onChange={(e) => setHybridThresholdMin(Number(e.target.value))}
              />
            </div>
            <label className="checkbox-row warn">
              <input
                type="checkbox"
                checked={simulateOutage}
                onChange={(e) => setSimulateOutage(e.target.checked)}
              />
              Simulate WAN outage (demo only)
            </label>
          </div>
        )}

        <div className="actions">
          <button type="button" className="btn primary">
            Save settings
          </button>
          <button type="button" className="btn ghost">
            Cancel
          </button>
        </div>
      </section>

      <section className="card muted">
        <h2>Audit &amp; permissions (concept)</h2>
        <ul>
          <li>Only <strong>Company Admin</strong> or <strong>Deliveries Admin</strong> can change company default.</li>
          <li>Each change logs user, timestamp, previous mode, and optional reason code.</li>
          <li>Plants with explicit override ignore company default until cleared.</li>
        </ul>
      </section>
    </div>
  );
}
