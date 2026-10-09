import { Link } from 'react-router-dom';
import { CLASS_TYPES } from '../data/classData';

const TYPE_LINKS = {
  ADMIX: '/admix',
  CEMENT: '/cement',
  COARSE_AGG: '/coarse-fine',
  FINE_AGG: '/coarse-fine',
  EXPOSURE: '/exposure',
  CHLORIDE: '/exposure',
  DESIGN_METHOD: '/design-method',
  BATCH_BOOK_TYPE: '/design-method',
};

export default function ClassLibraryPage() {
  return (
    <>
      <header className="page-header">
        <div>
          <div className="badge-row">
            <span className="badge">Setup · Admin</span>
            <span className="badge new">11 new · 3 existing</span>
          </div>
          <h1>Concrete Class Library</h1>
          <p>
            All 14 class types that can be configured in Cloud Dispatch. Each class type has
            a set of instances (e.g. the <em>Admix</em> type has instances AEA, WRA, AEA+WRA …).
            Mix designs reference one instance from each relevant type.
          </p>
        </div>
      </header>

      <div className="panel">
        <div className="panel-hd">
          <h2>All Class Types</h2>
          <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', fontSize: '.8rem', color: 'var(--ink-muted)' }}>
            <span><span className="dot existing" />Existing</span>
            <span><span className="dot new" />New</span>
          </div>
        </div>
        <table className="data">
          <thead>
            <tr>
              <th>Type</th>
              <th>Status</th>
              <th>What it classifies</th>
              <th>Extra fields on the class</th>
              <th>Example</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {CLASS_TYPES.map((t) => (
              <tr key={t.id}>
                <td>
                  <strong>{t.label}</strong>
                </td>
                <td>
                  {t.status === 'existing' ? (
                    <span className="badge ok">Existing</span>
                  ) : (
                    <span className="badge new">New</span>
                  )}
                </td>
                <td style={{ color: 'var(--ink-muted)', fontSize: '.85rem', maxWidth: '22rem', lineHeight: 1.35 }}>
                  {t.description}
                </td>
                <td style={{ fontSize: '.8rem' }}>
                  {t.extraFields.length === 0 ? (
                    <em style={{ color: 'var(--ink-soft)' }}>Identity only</em>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
                      {t.extraFields.map((f) => (
                        <div key={f.key}>
                          <code>{f.key}</code>
                          <span style={{ color: 'var(--ink-soft)', marginLeft: '.35rem' }}>{f.hint}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </td>
                <td>
                  {t.example && (
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '.82rem', color: 'var(--brand-deep)', fontWeight: 600 }}>
                      {t.example}
                    </span>
                  )}
                </td>
                <td>
                  {TYPE_LINKS[t.id] && (
                    <Link className="btn sm" to={TYPE_LINKS[t.id]}>
                      View →
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="callout" style={{ marginTop: '1.25rem' }}>
        <strong>Shared field pattern:</strong> Cement, Coarse Aggregate, Fine Aggregate, Water,
        Admix, Chloride, and Batch Book Type all share the fields{' '}
        <code>baseMaterialClassId</code> and <code>terminalClass</code>. Chloride and Batch Book
        Type also reuse <code>combinedPerformanceCategory</code> from the Cement schema.
      </div>
    </>
  );
}
