import { DESIGN_METHOD_CLASSES, BATCH_BOOK_TYPE_CLASSES, CONCRETE_TYPE_CLASSES } from '../data/classData';

export default function DesignMethodPage() {
  return (
    <>
      <header className="page-header">
        <div>
          <div className="badge-row">
            <span className="badge new">New Class Types</span>
            <span className="badge">EN 206 · Batch Control</span>
          </div>
          <h1>Design Method, Batch Book Type &amp; Concrete Type</h1>
          <p>
            Three supporting class types that classify <em>how</em> a mix is designed and
            controlled, rather than specifying its material properties.
          </p>
        </div>
      </header>

      <div className="grid-3" style={{ gap: '1.25rem', marginBottom: '1.25rem' }}>

        {/* Design Method */}
        <div className="panel">
          <div className="panel-hd">
            <h2>Design Method</h2>
            <span className="badge new">New</span>
          </div>
          <div className="panel-bd" style={{ paddingBottom: '.5rem' }}>
            <p style={{ margin: '0 0 .85rem', fontSize: '.88rem', color: 'var(--ink-muted)', lineHeight: 1.45 }}>
              Identifies whether a mix uses Design Method 1 (performance-specified designed
              concrete) or Method 2 (composition-specified prescribed concrete) per EN 206.
              Controls which mix-design workflow and batch-book rules apply.
            </p>
            <div className="field">
              <label>Extra field</label>
              <div><code>designMethodType</code> — <span style={{ color: 'var(--ink-muted)', fontSize: '.82rem' }}>01 or 02</span></div>
            </div>
            {DESIGN_METHOD_CLASSES.map((cls) => (
              <div key={cls.id} style={{ padding: '.65rem .85rem', background: 'var(--surface-3)', borderRadius: '8px', marginBottom: '.5rem' }}>
                <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--brand-deep)', marginBottom: '.2rem' }}>
                  {cls.code}
                  <span style={{ fontFamily: 'var(--font)', fontWeight: 400, color: 'var(--ink-soft)', fontSize: '.78rem', marginLeft: '.5rem' }}>
                    type: {cls.designMethodType}
                  </span>
                </div>
                <div style={{ fontSize: '.82rem', color: 'var(--ink-muted)' }}>{cls.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Batch Book Type */}
        <div className="panel">
          <div className="panel-hd">
            <h2>Batch Book Type</h2>
            <span className="badge new">New</span>
          </div>
          <div className="panel-bd" style={{ paddingBottom: '.5rem' }}>
            <p style={{ margin: '0 0 .85rem', fontSize: '.88rem', color: 'var(--ink-muted)', lineHeight: 1.45 }}>
              Identifies which family of batch books a mix may use. Uses the shared Cement
              class fields — <code>baseMaterialClassId</code>, <code>terminalClass</code>, and{' '}
              <code>combinedPerformanceCategory</code> (storing the batch book family name).
            </p>
            <div className="field">
              <label>Extra fields (shared with Cement schema)</label>
              <div style={{ fontSize: '.82rem', display: 'flex', flexDirection: 'column', gap: '.2rem' }}>
                <div><code>baseMaterialClassId</code></div>
                <div><code>terminalClass</code></div>
                <div><code>combinedPerformanceCategory</code> — family name</div>
              </div>
            </div>
            {BATCH_BOOK_TYPE_CLASSES.map((cls) => (
              <div key={cls.id} style={{ padding: '.65rem .85rem', background: 'var(--surface-3)', borderRadius: '8px', marginBottom: '.5rem' }}>
                <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--brand-deep)', marginBottom: '.2rem' }}>{cls.code}</div>
                <div style={{ fontSize: '.82rem', color: 'var(--ink-muted)' }}>{cls.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Concrete Type */}
        <div className="panel">
          <div className="panel-hd">
            <h2>Concrete Type</h2>
            <span className="badge new">New</span>
          </div>
          <div className="panel-bd" style={{ paddingBottom: '.5rem' }}>
            <p style={{ margin: '0 0 .85rem', fontSize: '.88rem', color: 'var(--ink-muted)', lineHeight: 1.45 }}>
              Classifies the concrete type or group (e.g. Reinforced Concrete, Self-Compacting).
              This is an <strong>identity-only</strong> class — no additional numeric or
              reference fields beyond the standard class header.
            </p>
            <div className="callout ok" style={{ marginBottom: '.85rem', fontSize: '.82rem' }}>
              No extra fields — identity only.
            </div>
            {CONCRETE_TYPE_CLASSES.map((cls) => (
              <div key={cls.id} style={{ padding: '.65rem .85rem', background: 'var(--surface-3)', borderRadius: '8px', marginBottom: '.5rem' }}>
                <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--brand-deep)', marginBottom: '.2rem' }}>{cls.code}</div>
                <div style={{ fontSize: '.82rem', color: 'var(--ink-muted)' }}>{cls.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Schema table */}
      <div className="panel">
        <div className="panel-hd"><h2>Field Schema Comparison</h2></div>
        <table className="data">
          <thead>
            <tr>
              <th>Class Type</th>
              <th>Extra fields</th>
              <th>Shares schema with</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Design Method</strong></td>
              <td><code>designMethodType</code> (01 or 02)</td>
              <td>—</td>
              <td>Controls which mix-design workflow applies</td>
            </tr>
            <tr>
              <td><strong>Batch Book Type</strong></td>
              <td>
                <code>baseMaterialClassId</code>, <code>terminalClass</code>,{' '}
                <code>combinedPerformanceCategory</code>
              </td>
              <td>Cement, Chloride</td>
              <td>
                <code>combinedPerformanceCategory</code> holds the batch book family name
              </td>
            </tr>
            <tr>
              <td><strong>Concrete Type</strong></td>
              <td>None — identity only</td>
              <td>—</td>
              <td>Standard class header fields only (code, description)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
