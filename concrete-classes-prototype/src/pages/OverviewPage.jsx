import { Link } from 'react-router-dom';
import { CLASS_TYPES } from '../data/classData';

export default function OverviewPage() {
  const existingCount = CLASS_TYPES.filter((t) => t.status === 'existing').length;
  const newCount = CLASS_TYPES.filter((t) => t.status === 'new').length;

  return (
    <>
      <header className="page-header">
        <div>
          <div className="badge-row">
            <span className="badge">Cloud Dispatch</span>
            <span className="badge new">Rod's Requirements</span>
          </div>
          <h1>Concrete Classes — Overview</h1>
          <p>
            A <strong>Concrete Class</strong> is a customer-facing label that describes a specific
            property of a concrete mix. Classes are the translation layer between what the plant
            batches and what the customer sees on their Quote, Ticket, or Invoice.
          </p>
        </div>
        <Link className="btn primary" to="/class-library">
          Class Library →
        </Link>
      </header>

      {/* Translation concept */}
      <div className="panel" style={{ marginBottom: '1.25rem' }}>
        <div className="panel-hd">
          <h2>The Translation Model</h2>
        </div>
        <div className="panel-bd">
          <p style={{ marginTop: 0, color: 'var(--ink-muted)', fontSize: '.9rem', lineHeight: 1.5 }}>
            The customer only needs to know that the concrete meets their requirements — they do not
            need to see the technical product names. Concrete Classes act as a bridge:
          </p>

          <div className="grid-3" style={{ gap: '1rem', marginBottom: '1.25rem' }}>
            <TranslationExample
              customerSees="Admix Class: AEA+WRA"
              inThePlant="Sika190 (WRA) + AER1465 (AEA) are dosed at the batcher"
              type="admix"
            />
            <TranslationExample
              customerSees="Cement Class: CEM III/A"
              inThePlant="50% OPC + 50% GGBS — two separate cementitious materials batched"
              type="cement"
            />
            <TranslationExample
              customerSees="Agg Class: 20MM"
              inThePlant="20mm Limestone + 10mm Limestone — two stone fractions combined"
              type="agg"
            />
          </div>

          <div className="callout ok">
            <strong>Key principle:</strong> The class name is stable and customer-facing. The
            actual materials can change (supplier switch, trial mix) without changing what appears
            on the customer's documentation.
          </div>
        </div>
      </div>

      {/* Class inventory summary */}
      <div className="panel">
        <div className="panel-hd">
          <h2>Class Type Inventory</h2>
          <div style={{ display: 'flex', gap: '.5rem' }}>
            <span className="badge ok">{existingCount} existing</span>
            <span className="badge new">{newCount} new (Rod's requirements)</span>
          </div>
        </div>
        <div className="panel-bd">
          <div className="grid-2" style={{ gap: '2rem' }}>
            <div>
              <h3 style={{ margin: '0 0 .75rem', fontSize: '.9rem', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                <span className="dot existing" />Existing Classes
              </h3>
              {CLASS_TYPES.filter((t) => t.status === 'existing').map((t) => (
                <ClassRow key={t.id} type={t} />
              ))}
            </div>
            <div>
              <h3 style={{ margin: '0 0 .75rem', fontSize: '.9rem', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                <span className="dot new" />New Classes — Rod's Requirements
              </h3>
              {CLASS_TYPES.filter((t) => t.status === 'new').map((t) => (
                <ClassRow key={t.id} type={t} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="callout warn" style={{ marginTop: '1.25rem' }}>
        <strong>Note from Rod:</strong> "I reserve the right to change my mind!" — Andy has a
        meeting scheduled on the 19th to discuss the full class list in more depth.
      </div>
    </>
  );
}

function TranslationExample({ customerSees, inThePlant, type }) {
  const colors = {
    admix: { bg: 'var(--new-soft)', border: '#c9b8ef', label: 'var(--new)' },
    cement: { bg: 'var(--brand-soft)', border: '#b7d7e6', label: 'var(--brand-deep)' },
    agg: { bg: 'var(--ok-soft)', border: '#a8d9bf', label: 'var(--ok)' },
  }[type];

  return (
    <div style={{ border: `1px solid ${colors.border}`, borderRadius: '10px', padding: '1rem', background: colors.bg }}>
      <div style={{ fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: colors.label, marginBottom: '.4rem' }}>
        Customer sees
      </div>
      <div style={{ fontWeight: 700, fontFamily: 'var(--mono)', fontSize: '.95rem', marginBottom: '.75rem', color: 'var(--ink)' }}>
        {customerSees}
      </div>
      <div style={{ fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--ink-soft)', marginBottom: '.4rem' }}>
        ↓ In the plant
      </div>
      <div style={{ fontSize: '.82rem', color: 'var(--ink-muted)', lineHeight: 1.4 }}>
        {inThePlant}
      </div>
    </div>
  );
}

function ClassRow({ type }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '.6rem', padding: '.45rem 0', borderBottom: '1px solid var(--line)', fontSize: '.88rem' }}>
      <span style={{ fontWeight: 600, minWidth: '10rem' }}>{type.label}</span>
      <span style={{ color: 'var(--ink-muted)', fontSize: '.82rem', flex: 1, lineHeight: 1.35 }}>
        {type.description}
      </span>
      {type.example && (
        <span style={{ fontFamily: 'var(--mono)', fontSize: '.78rem', color: 'var(--brand)', whiteSpace: 'nowrap' }}>
          e.g. {type.example}
        </span>
      )}
    </div>
  );
}
