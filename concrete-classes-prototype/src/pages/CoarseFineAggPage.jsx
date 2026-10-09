import { useState } from 'react';
import { COARSE_AGG_CLASSES, FINE_AGG_CLASSES, WATER_CLASSES } from '../data/classData';

export default function CoarseFineAggPage() {
  const [tab, setTab] = useState('coarse');
  const [selectedCoarse, setSelectedCoarse] = useState(COARSE_AGG_CLASSES[0]);
  const [selectedFine, setSelectedFine] = useState(FINE_AGG_CLASSES[0]);
  const [selectedWater, setSelectedWater] = useState(WATER_CLASSES[0]);

  return (
    <>
      <header className="page-header">
        <div>
          <div className="badge-row">
            <span className="badge new">New Class Types</span>
            <span className="badge">Aggregate · Water</span>
          </div>
          <h1>Coarse Aggregate, Fine Aggregate &amp; Water Classes</h1>
          <p>
            Three new material class types that govern which physical materials are permitted in
            a mix design. All share the same base schema (<code>baseMaterialClassId</code>,{' '}
            <code>terminalClass</code>). Coarse aggregate additionally links to an Aggregate Size
            class and carries an optional maximum strength ceiling.
          </p>
        </div>
      </header>

      <div className="scenario-switch">
        {[
          { id: 'coarse', label: `Coarse Aggregate (${COARSE_AGG_CLASSES.length})` },
          { id: 'fine', label: `Fine Aggregate (${FINE_AGG_CLASSES.length})` },
          { id: 'water', label: `Water (${WATER_CLASSES.length})` },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            className={tab === t.id ? 'active' : ''}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'coarse' && (
        <>
          <div className="callout" style={{ marginBottom: '1.25rem' }}>
            <strong>Example:</strong> Customer sees <code>Agg Class: 20MM</code> (Aggregate Size
            class). In the mix design, <em>Coarse Agg Class</em> is{' '}
            <code>20MM-LIMESTONE</code> which maps to 20mm Limestone + 10mm Limestone fractions.
          </div>
          <div className="grid-2">
            <div className="panel">
              <div className="panel-hd"><h2>Coarse Aggregate Classes ({COARSE_AGG_CLASSES.length})</h2></div>
              <div style={{ padding: 0 }}>
                {COARSE_AGG_CLASSES.map((cls) => (
                  <button
                    type="button"
                    key={cls.id}
                    className="btn ghost"
                    style={{
                      width: '100%', textAlign: 'left', padding: '.7rem 1.1rem',
                      borderRadius: 0, borderBottom: '1px solid var(--line)',
                      background: selectedCoarse?.id === cls.id ? 'var(--brand-soft)' : 'transparent',
                      display: 'flex', gap: '.5rem', flexDirection: 'column',
                    }}
                    onClick={() => setSelectedCoarse(cls)}
                  >
                    <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--brand-deep)' }}>{cls.code}</span>
                    <span style={{ fontSize: '.82rem', color: 'var(--ink-muted)' }}>{cls.description}</span>
                  </button>
                ))}
              </div>
            </div>
            {selectedCoarse && <CoarseDetail cls={selectedCoarse} />}
          </div>
        </>
      )}

      {tab === 'fine' && (
        <div className="grid-2">
          <div className="panel">
            <div className="panel-hd"><h2>Fine Aggregate Classes ({FINE_AGG_CLASSES.length})</h2></div>
            <div style={{ padding: 0 }}>
              {FINE_AGG_CLASSES.map((cls) => (
                <button
                  type="button"
                  key={cls.id}
                  className="btn ghost"
                  style={{
                    width: '100%', textAlign: 'left', padding: '.7rem 1.1rem',
                    borderRadius: 0, borderBottom: '1px solid var(--line)',
                    background: selectedFine?.id === cls.id ? 'var(--brand-soft)' : 'transparent',
                    display: 'flex', gap: '.5rem', flexDirection: 'column',
                  }}
                  onClick={() => setSelectedFine(cls)}
                >
                  <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--brand-deep)' }}>{cls.code}</span>
                  <span style={{ fontSize: '.82rem', color: 'var(--ink-muted)' }}>{cls.description}</span>
                </button>
              ))}
            </div>
          </div>
          {selectedFine && (
            <div className="panel">
              <div className="panel-hd"><h2 style={{ fontFamily: 'var(--mono)' }}>{selectedFine.code}</h2><span className="badge new">Fine Agg Class</span></div>
              <div className="panel-bd">
                <DetailRow label="Class Code" value={selectedFine.code} mono />
                <DetailRow label="Description" value={selectedFine.description} />
                <DetailRow label="Terminal Class" value={selectedFine.terminalClass ? 'Yes' : 'No'} />
                <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '1rem 0' }} />
                <h3 style={{ margin: '0 0 .6rem', fontSize: '.9rem', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Actual Materials</h3>
                {selectedFine.actualMaterials.map((m, i) => (
                  <div key={i} style={{ padding: '.5rem .8rem', background: 'var(--surface-3)', borderRadius: '8px', marginBottom: '.4rem', fontSize: '.88rem', fontFamily: 'var(--mono)' }}>{m}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'water' && (
        <div className="grid-2">
          <div className="panel">
            <div className="panel-hd"><h2>Water Classes ({WATER_CLASSES.length})</h2></div>
            <div style={{ padding: 0 }}>
              {WATER_CLASSES.map((cls) => (
                <button
                  type="button"
                  key={cls.id}
                  className="btn ghost"
                  style={{
                    width: '100%', textAlign: 'left', padding: '.7rem 1.1rem',
                    borderRadius: 0, borderBottom: '1px solid var(--line)',
                    background: selectedWater?.id === cls.id ? 'var(--brand-soft)' : 'transparent',
                    display: 'flex', gap: '.5rem', flexDirection: 'column',
                  }}
                  onClick={() => setSelectedWater(cls)}
                >
                  <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--brand-deep)' }}>{cls.code}</span>
                  <span style={{ fontSize: '.82rem', color: 'var(--ink-muted)' }}>{cls.description}</span>
                </button>
              ))}
            </div>
          </div>
          {selectedWater && (
            <div className="panel">
              <div className="panel-hd"><h2 style={{ fontFamily: 'var(--mono)' }}>{selectedWater.code}</h2><span className="badge new">Water Class</span></div>
              <div className="panel-bd">
                <DetailRow label="Class Code" value={selectedWater.code} mono />
                <DetailRow label="Description" value={selectedWater.description} />
                <DetailRow label="Terminal Class" value={selectedWater.terminalClass ? 'Yes' : 'No'} />
                <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '1rem 0' }} />
                <h3 style={{ margin: '0 0 .6rem', fontSize: '.9rem', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Actual Materials</h3>
                {selectedWater.actualMaterials.map((m, i) => (
                  <div key={i} style={{ padding: '.5rem .8rem', background: 'var(--surface-3)', borderRadius: '8px', marginBottom: '.4rem', fontSize: '.88rem', fontFamily: 'var(--mono)' }}>{m}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Shared schema */}
      <div className="panel" style={{ marginTop: '1.25rem' }}>
        <div className="panel-hd"><h2>Shared Field Schema — Coarse Agg / Fine Agg / Water</h2></div>
        <table className="data">
          <thead>
            <tr><th>Field</th><th>Applies to</th><th>Type</th><th>Description</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><code>baseMaterialClassId</code></td>
              <td>All three</td>
              <td>ID ref</td>
              <td>Parent class — null for top-level instances</td>
            </tr>
            <tr>
              <td><code>terminalClass</code></td>
              <td>All three</td>
              <td>boolean</td>
              <td>If true, no further sub-classification is permitted</td>
            </tr>
            <tr>
              <td><code>aggregateSizeClassId</code></td>
              <td>Coarse Agg only</td>
              <td>ID ref</td>
              <td>Links to the Aggregate Size class (10MM, 20MM …)</td>
            </tr>
            <tr>
              <td><code>maxStrength</code></td>
              <td>Coarse Agg only</td>
              <td>number (MPa)</td>
              <td>Upper strength ceiling this aggregate is approved for</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

function CoarseDetail({ cls }) {
  return (
    <div className="panel">
      <div className="panel-hd">
        <h2 style={{ fontFamily: 'var(--mono)' }}>{cls.code}</h2>
        <span className="badge new">Coarse Agg Class</span>
      </div>
      <div className="panel-bd">
        <DetailRow label="Class Code" value={cls.code} mono />
        <DetailRow label="Description" value={cls.description} />
        <DetailRow label="Aggregate Size Class" value={cls.aggregateSizeClassId} mono />
        <DetailRow label="Max Strength" value={`${cls.maxStrength} MPa`} />
        <DetailRow label="Terminal Class" value={cls.terminalClass ? 'Yes' : 'No'} />
        <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '1rem 0' }} />
        <h3 style={{ margin: '0 0 .6rem', fontSize: '.9rem', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Actual Materials in Mix Design</h3>
        {cls.actualMaterials.map((m, i) => (
          <div key={i} style={{ padding: '.5rem .8rem', background: 'var(--surface-3)', borderRadius: '8px', marginBottom: '.4rem', fontSize: '.88rem', fontFamily: 'var(--mono)' }}>{m}</div>
        ))}
        {cls.note && <div className="callout" style={{ marginTop: '.85rem' }}>{cls.note}</div>}
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono }) {
  return (
    <div className="field" style={{ marginBottom: '.65rem' }}>
      <label>{label}</label>
      <div style={mono ? { fontFamily: 'var(--mono)', fontWeight: 600, color: 'var(--brand-deep)' } : {}}>{value}</div>
    </div>
  );
}
