import { useState } from 'react';
import { CEMENT_CLASSES } from '../data/classData';

export default function CementClassPage() {
  const [selected, setSelected] = useState(CEMENT_CLASSES[3]); // CIIIA

  return (
    <>
      <header className="page-header">
        <div>
          <div className="badge-row">
            <span className="badge new">New Class Type</span>
            <span className="badge">Binder / Combination</span>
          </div>
          <h1>Cement Classes</h1>
          <p>
            A <strong>Cement Class</strong> describes the binder type or combination class
            (CEM I, CEM II/A, CEM III/A …). The customer sees the class name — the actual
            cementitious materials and proportions are defined in the mix design.
          </p>
        </div>
      </header>

      <div className="callout" style={{ marginBottom: '1.25rem' }}>
        <strong>Example:</strong> Customer sees <code>Cement Class: CEM III/A</code> on their
        ticket. In the mix design this is 50% OPC + 50% GGBS — two separate materials batched
        by the plant.
      </div>

      <div className="grid-2">
        {/* List */}
        <div className="panel">
          <div className="panel-hd"><h2>Cement Class Instances ({CEMENT_CLASSES.length})</h2></div>
          <div style={{ padding: 0 }}>
            {CEMENT_CLASSES.map((cls) => (
              <button
                type="button"
                key={cls.id}
                className="btn ghost"
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '.7rem 1.1rem',
                  borderRadius: 0,
                  borderBottom: '1px solid var(--line)',
                  background: selected?.id === cls.id ? 'var(--brand-soft)' : 'transparent',
                  display: 'flex',
                  gap: '.75rem',
                  alignItems: 'center',
                }}
                onClick={() => setSelected(cls)}
              >
                <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--brand-deep)', minWidth: '6rem' }}>
                  {cls.code}
                </span>
                <span style={{ fontSize: '.82rem', color: 'var(--ink-muted)', flex: 1 }}>
                  {cls.description}
                </span>
                {cls.terminalClass && (
                  <span style={{ fontSize: '.7rem', background: 'var(--ok-soft)', color: 'var(--ok)', borderRadius: '4px', padding: '.1rem .35rem' }}>
                    Terminal
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Detail */}
        {selected && (
          <div className="panel">
            <div className="panel-hd">
              <h2 style={{ fontFamily: 'var(--mono)' }}>{selected.code}</h2>
              <span className="badge new">Cement Class</span>
            </div>
            <div className="panel-bd">
              <div className="field"><label>Class Code</label><div style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--brand-deep)' }}>{selected.code}</div></div>
              <div className="field"><label>Description</label><div>{selected.description}</div></div>
              <div className="field">
                <label>Combined Performance Category</label>
                <div style={{ fontFamily: 'var(--mono)' }}>{selected.combinedPerformanceCategory}</div>
              </div>
              <div className="field">
                <label>Terminal Class</label>
                <div>{selected.terminalClass ? 'Yes — cannot be sub-classified further' : 'No — sub-classes may exist'}</div>
              </div>
              <div className="field">
                <label>Base Material Class</label>
                <div style={{ color: 'var(--ink-soft)', fontStyle: 'italic' }}>
                  {selected.baseMaterialClassId || 'None (top-level class)'}
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '1rem 0' }} />

              <h3 style={{ margin: '0 0 .6rem', fontSize: '.9rem', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                Actual Materials in Mix Design
              </h3>

              {selected.actualMaterials.map((mat, i) => (
                <div key={i} style={{ padding: '.5rem .8rem', background: 'var(--surface-3)', borderRadius: '8px', marginBottom: '.4rem', fontSize: '.88rem', fontFamily: 'var(--mono)' }}>
                  {mat}
                </div>
              ))}

              {selected.note && (
                <div className="callout" style={{ marginTop: '.85rem' }}>{selected.note}</div>
              )}

              <div className="callout warn" style={{ marginTop: '1rem' }}>
                <strong>Customer documentation:</strong> Only <code>{selected.code}</code> appears
                on documents. The material breakdown is internal.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Field schema */}
      <div className="panel" style={{ marginTop: '1.25rem' }}>
        <div className="panel-hd"><h2>Cement Class — Field Schema</h2></div>
        <table className="data">
          <thead>
            <tr><th>Field</th><th>Type</th><th>Description</th><th>Shared with</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><code>baseMaterialClassId</code></td>
              <td>ID ref</td>
              <td>Parent class in a hierarchy (null for top-level)</td>
              <td>Coarse Agg, Fine Agg, Water, Admix, Chloride, Batch Book Type</td>
            </tr>
            <tr>
              <td><code>terminalClass</code></td>
              <td>boolean</td>
              <td>If true, no sub-classes may be created under this instance</td>
              <td>Coarse Agg, Fine Agg, Water, Admix, Chloride, Batch Book Type</td>
            </tr>
            <tr>
              <td><code>combinedPerformanceCategory</code></td>
              <td>string</td>
              <td>EN 197 / BS 8500 combination designation (e.g. CEM III/A)</td>
              <td>Chloride (limit code), Batch Book Type (family)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
