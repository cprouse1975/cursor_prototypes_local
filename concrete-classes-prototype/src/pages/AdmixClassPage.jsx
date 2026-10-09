import { useState } from 'react';
import { ADMIX_CLASSES } from '../data/classData';

const DRAFT_TEMPLATE = {
  code: '',
  description: '',
  actualAdmixtures: '',
  note: '',
  terminalClass: true,
};

export default function AdmixClassPage() {
  const [classes, setClasses] = useState(ADMIX_CLASSES);
  const [selected, setSelected] = useState(ADMIX_CLASSES[3]); // AEA+WRA
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState({ ...DRAFT_TEMPLATE });

  const handleAdd = () => {
    if (!draft.code.trim()) return;
    const newClass = {
      id: draft.code.toUpperCase().replace(/\s+/g, '_'),
      code: draft.code.trim().toUpperCase(),
      description: draft.description.trim(),
      baseMaterialClassId: null,
      terminalClass: draft.terminalClass,
      actualAdmixtures: draft.actualAdmixtures
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      note: draft.note.trim() || undefined,
    };
    setClasses((prev) => [...prev, newClass]);
    setSelected(newClass);
    setShowAdd(false);
    setDraft({ ...DRAFT_TEMPLATE });
  };

  return (
    <>
      <header className="page-header">
        <div>
          <div className="badge-row">
            <span className="badge new">New Class Type</span>
            <span className="badge">Quote · Ticket · Invoice</span>
          </div>
          <h1>Admix Classes</h1>
          <p>
            The <strong>Admix Class</strong> is the customer-facing admixture label. The customer
            sees a class name (e.g. <em>AEA+WRA</em>) on their documentation — they never need
            to know the actual product brand names batched by the plant.
          </p>
        </div>
        <button
          type="button"
          className="btn primary"
          onClick={() => setShowAdd(true)}
        >
          + Add Admix Class
        </button>
      </header>

      <div className="callout new" style={{ marginBottom: '1.25rem' }}>
        <strong>Most common examples:</strong> WRA · AEA · AEA+WRA · SUPERPLASTICISER
      </div>

      <div className="grid-2">
        {/* Left — list */}
        <div className="panel">
          <div className="panel-hd">
            <h2>Admix Class Instances ({classes.length})</h2>
          </div>
          <div style={{ padding: 0 }}>
            {classes.map((cls) => (
              <button
                type="button"
                key={cls.id}
                className="btn ghost"
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '.75rem 1.1rem',
                  borderRadius: 0,
                  borderBottom: '1px solid var(--line)',
                  background: selected?.id === cls.id ? 'var(--brand-soft)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '.75rem',
                }}
                onClick={() => setSelected(cls)}
              >
                <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: '1rem', color: 'var(--brand-deep)', minWidth: '8rem' }}>
                  {cls.code}
                </span>
                <span style={{ fontSize: '.82rem', color: 'var(--ink-muted)' }}>
                  {cls.description}
                </span>
                {cls.actualAdmixtures.length > 0 && (
                  <span style={{ marginLeft: 'auto', fontSize: '.75rem', color: 'var(--ink-soft)' }}>
                    {cls.actualAdmixtures.length} product{cls.actualAdmixtures.length !== 1 ? 's' : ''}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right — detail */}
        <div>
          {selected && (
            <div className="panel">
              <div className="panel-hd">
                <h2 style={{ fontFamily: 'var(--mono)' }}>{selected.code}</h2>
                <span className="badge new">Admix Class</span>
              </div>
              <div className="panel-bd">
                <div className="field">
                  <label>Class Code</label>
                  <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--brand-deep)' }}>
                    {selected.code}
                  </div>
                </div>
                <div className="field">
                  <label>Description</label>
                  <div>{selected.description}</div>
                </div>
                <div className="field">
                  <label>Terminal Class</label>
                  <div>{selected.terminalClass ? 'Yes — cannot be sub-classified' : 'No'}</div>
                </div>
                {selected.note && (
                  <div className="callout" style={{ marginBottom: '.85rem' }}>
                    {selected.note}
                  </div>
                )}

                <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '1rem 0' }} />

                <h3 style={{ margin: '0 0 .6rem', fontSize: '.9rem', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                  Translation — Actual Admixtures Batched
                </h3>

                {selected.actualAdmixtures.length === 0 ? (
                  <p style={{ color: 'var(--ink-soft)', fontStyle: 'italic', fontSize: '.88rem' }}>
                    No admixtures — plain concrete
                  </p>
                ) : (
                  selected.actualAdmixtures.map((adm, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '.6rem',
                        padding: '.55rem .8rem',
                        background: 'var(--surface-3)',
                        borderRadius: '8px',
                        marginBottom: '.4rem',
                        fontSize: '.88rem',
                      }}
                    >
                      <span style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: 'var(--ink)' }}>
                        {adm}
                      </span>
                      <span style={{ fontSize: '.75rem', color: 'var(--ink-soft)' }}>
                        (specific product — not shown on customer documents)
                      </span>
                    </div>
                  ))
                )}

                <div className="callout warn" style={{ marginTop: '1rem' }}>
                  <strong>Customer documentation:</strong> Only the class code{' '}
                  <code>{selected.code}</code> appears on Quote / Ticket / Invoice. The
                  product names above are internal plant data.
                </div>
              </div>
            </div>
          )}

          {/* Add new form */}
          {showAdd && (
            <div className="panel" style={{ marginTop: '1rem' }}>
              <div className="panel-hd">
                <h2>New Admix Class</h2>
              </div>
              <div className="panel-bd">
                <div className="field">
                  <label>Class Code *</label>
                  <input
                    value={draft.code}
                    onChange={(e) => setDraft((d) => ({ ...d, code: e.target.value }))}
                    placeholder="e.g. AEA+WRA"
                  />
                  <span className="help">This is what the customer sees</span>
                </div>
                <div className="field">
                  <label>Description</label>
                  <input
                    value={draft.description}
                    onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                    placeholder="Air Entraining Agent + Water Reducing Agent"
                  />
                </div>
                <div className="field">
                  <label>Actual Admixtures (comma-separated)</label>
                  <input
                    value={draft.actualAdmixtures}
                    onChange={(e) => setDraft((d) => ({ ...d, actualAdmixtures: e.target.value }))}
                    placeholder="AER1465, Sika190"
                  />
                  <span className="help">Internal plant products — not shown to customer</span>
                </div>
                <div className="field">
                  <label>Note (optional)</label>
                  <input
                    value={draft.note}
                    onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
                    placeholder="Usage note …"
                  />
                </div>
                <div style={{ display: 'flex', gap: '.5rem' }}>
                  <button type="button" className="btn primary" onClick={handleAdd}>
                    Save
                  </button>
                  <button type="button" className="btn" onClick={() => setShowAdd(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Translation overview */}
      <div className="panel" style={{ marginTop: '1.25rem' }}>
        <div className="panel-hd">
          <h2>Translation Overview — Customer Label → Plant Products</h2>
        </div>
        <div className="panel-bd">
          {classes
            .filter((c) => c.code !== 'NONE')
            .map((cls) => (
              <div key={cls.id} className="translation-row">
                <span className="translation-label">{cls.code}</span>
                <span className="translation-arrow">→</span>
                <span className="translation-materials">
                  {cls.actualAdmixtures.length === 0
                    ? 'No admixtures'
                    : cls.actualAdmixtures.join(' + ')}
                </span>
                {cls.note && <span className="translation-note">{cls.note}</span>}
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
