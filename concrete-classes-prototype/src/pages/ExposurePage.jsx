import { useState } from 'react';
import { EXPOSURE_CLASSES, CHLORIDE_CLASSES, CEMENT_CLASSES } from '../data/classData';

export default function ExposurePage() {
  const [tab, setTab] = useState('exposure');
  const [selectedExp, setSelectedExp] = useState(EXPOSURE_CLASSES[4]); // XC4
  const [selectedChl, setSelectedChl] = useState(CHLORIDE_CLASSES[2]); // Cl 0.40

  const cementLabel = (id) => CEMENT_CLASSES.find((c) => c.id === id)?.code ?? id;

  return (
    <>
      <header className="page-header">
        <div>
          <div className="badge-row">
            <span className="badge new">New Class Types</span>
            <span className="badge">EN 206 · BS 8500</span>
          </div>
          <h1>Exposure &amp; Chloride Classes</h1>
          <p>
            <strong>Exposure classes</strong> (XC, XF, DC …) drive minimum specification
            constraints — cement class, aggregate size, minimum cement content, and maximum
            water/cement ratio. <strong>Chloride classes</strong> set the permitted maximum
            chloride ion content.
          </p>
        </div>
      </header>

      <div className="scenario-switch">
        <button type="button" className={tab === 'exposure' ? 'active' : ''} onClick={() => setTab('exposure')}>
          Exposure Classes ({EXPOSURE_CLASSES.length})
        </button>
        <button type="button" className={tab === 'chloride' ? 'active' : ''} onClick={() => setTab('chloride')}>
          Chloride Classes ({CHLORIDE_CLASSES.length})
        </button>
      </div>

      {tab === 'exposure' && (
        <>
          <div className="callout new" style={{ marginBottom: '1.25rem' }}>
            Each Exposure class carries a <strong>details[]</strong> array of constraint rows.
            Each row specifies a permitted cement class, aggregate size, minimum cement content
            (kg/m³), and maximum water/cement ratio for that combination.
          </div>

          <div className="grid-2">
            {/* List */}
            <div className="panel">
              <div className="panel-hd"><h2>Exposure Class Instances</h2></div>
              <div style={{ padding: 0 }}>
                {EXPOSURE_CLASSES.map((cls) => (
                  <button
                    type="button"
                    key={cls.id}
                    className="btn ghost"
                    style={{
                      width: '100%', textAlign: 'left', padding: '.65rem 1.1rem',
                      borderRadius: 0, borderBottom: '1px solid var(--line)',
                      background: selectedExp?.id === cls.id ? 'var(--brand-soft)' : 'transparent',
                      display: 'flex', gap: '.75rem', alignItems: 'center',
                    }}
                    onClick={() => setSelectedExp(cls)}
                  >
                    <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--brand-deep)', minWidth: '3.5rem' }}>{cls.code}</span>
                    <span style={{ fontSize: '.82rem', color: 'var(--ink-muted)' }}>{cls.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Detail */}
            {selectedExp && (
              <div className="panel">
                <div className="panel-hd">
                  <h2 style={{ fontFamily: 'var(--mono)' }}>{selectedExp.code}</h2>
                  <span className="badge new">Exposure Class</span>
                </div>
                <div className="panel-bd">
                  <p style={{ margin: '0 0 1rem', color: 'var(--ink-muted)', fontSize: '.9rem' }}>{selectedExp.description}</p>

                  <h3 style={{ margin: '0 0 .6rem', fontSize: '.9rem', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                    Constraint Details
                  </h3>

                  <table className="data">
                    <thead>
                      <tr>
                        <th>Cement Class</th>
                        <th>Agg Size</th>
                        <th>Min Cement (kg/m³)</th>
                        <th>Max w/c Ratio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedExp.details.map((d, i) => (
                        <tr key={i}>
                          <td><code>{cementLabel(d.cementClassId)}</code></td>
                          <td><code>{d.aggregateSizeClassId}</code></td>
                          <td style={{ fontWeight: 600 }}>{d.minCement}</td>
                          <td style={{ fontWeight: 600 }}>{d.maxWaterCementRatio.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="callout warn" style={{ marginTop: '1rem' }}>
                    Mix designs assigned to this exposure class must satisfy all constraints in
                    the details table before they can be approved.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Full exposure table */}
          <div className="panel" style={{ marginTop: '1.25rem' }}>
            <div className="panel-hd"><h2>All Exposure Classes — Summary</h2></div>
            <table className="data">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Description</th>
                  <th>Min Cement (kg/m³)</th>
                  <th>Max w/c</th>
                  <th>Cement Class</th>
                </tr>
              </thead>
              <tbody>
                {EXPOSURE_CLASSES.map((cls) =>
                  cls.details.map((d, i) => (
                    <tr key={`${cls.id}-${i}`}>
                      {i === 0 && (
                        <td rowSpan={cls.details.length} style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--brand-deep)' }}>
                          {cls.code}
                        </td>
                      )}
                      {i === 0 && (
                        <td rowSpan={cls.details.length} style={{ color: 'var(--ink-muted)', fontSize: '.85rem' }}>
                          {cls.description}
                        </td>
                      )}
                      <td>{d.minCement}</td>
                      <td>{d.maxWaterCementRatio.toFixed(2)}</td>
                      <td><code>{cementLabel(d.cementClassId)}</code></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'chloride' && (
        <>
          <div className="callout" style={{ marginBottom: '1.25rem' }}>
            Chloride classes use the <strong>shared Cement schema fields</strong> (
            <code>baseMaterialClassId</code>, <code>terminalClass</code>,{' '}
            <code>combinedPerformanceCategory</code>). The limit code (e.g. Cl 0.10) is stored
            in <code>combinedPerformanceCategory</code>.
          </div>

          <div className="grid-2">
            <div className="panel">
              <div className="panel-hd"><h2>Chloride Class Instances ({CHLORIDE_CLASSES.length})</h2></div>
              <div style={{ padding: 0 }}>
                {CHLORIDE_CLASSES.map((cls) => (
                  <button
                    type="button"
                    key={cls.id}
                    className="btn ghost"
                    style={{
                      width: '100%', textAlign: 'left', padding: '.7rem 1.1rem',
                      borderRadius: 0, borderBottom: '1px solid var(--line)',
                      background: selectedChl?.id === cls.id ? 'var(--brand-soft)' : 'transparent',
                      display: 'flex', gap: '.75rem', alignItems: 'center',
                    }}
                    onClick={() => setSelectedChl(cls)}
                  >
                    <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--brand-deep)', minWidth: '5rem' }}>{cls.code}</span>
                    <span style={{ fontSize: '.82rem', color: 'var(--ink-muted)' }}>{cls.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedChl && (
              <div className="panel">
                <div className="panel-hd">
                  <h2 style={{ fontFamily: 'var(--mono)' }}>{selectedChl.code}</h2>
                  <span className="badge new">Chloride Class</span>
                </div>
                <div className="panel-bd">
                  <div className="field"><label>Class Code</label><div style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--brand-deep)' }}>{selectedChl.code}</div></div>
                  <div className="field"><label>Description</label><div>{selectedChl.description}</div></div>
                  <div className="field"><label>Chloride Limit Code</label><div style={{ fontFamily: 'var(--mono)' }}>{selectedChl.combinedPerformanceCategory}</div></div>
                  <div className="field"><label>Terminal Class</label><div>{selectedChl.terminalClass ? 'Yes' : 'No'}</div></div>
                  <div className="callout" style={{ marginTop: '.5rem' }}>
                    This limit represents the maximum permitted chloride ion content as a percentage
                    of the mass of cement in the mix.
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
