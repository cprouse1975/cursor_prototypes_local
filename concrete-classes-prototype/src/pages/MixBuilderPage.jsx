import { useState } from 'react';
import {
  EXAMPLE_MIX,
  CONSISTENCE_CLASSES,
  STRENGTH_CLASSES,
  AGG_SIZE_CLASSES,
  CEMENT_CLASSES,
  COARSE_AGG_CLASSES,
  FINE_AGG_CLASSES,
  WATER_CLASSES,
  ADMIX_CLASSES,
  CHLORIDE_CLASSES,
  EXPOSURE_CLASSES,
  CONCRETE_TYPE_CLASSES,
  DESIGN_METHOD_CLASSES,
  BATCH_BOOK_TYPE_CLASSES,
} from '../data/classData';

const findCode = (list, code) => list.find((i) => i.code === code);
const findId = (list, id) => list.find((i) => i.id === id);

export default function MixBuilderPage() {
  const [mix, setMix] = useState({ ...EXAMPLE_MIX.classes });

  const set = (key, val) => setMix((m) => ({ ...m, [key]: val }));

  const admix = findCode(ADMIX_CLASSES, mix.admixClass);
  const cement = findCode(CEMENT_CLASSES, mix.cementClass);
  const coarse = findCode(COARSE_AGG_CLASSES, mix.coarseAggClass);
  const fine = findCode(FINE_AGG_CLASSES, mix.fineAggClass);
  const water = findCode(WATER_CLASSES, mix.waterClass);
  const exposure = findId(EXPOSURE_CLASSES, mix.exposureClass);

  return (
    <>
      <header className="page-header">
        <div>
          <div className="badge-row">
            <span className="badge">Assembly</span>
            <span className="badge accent">Interactive Demo</span>
          </div>
          <h1>Mix Class Builder</h1>
          <p>
            Select a class instance for each dimension. The right panel shows what the customer
            sees on their documents versus what the plant actually batches.
          </p>
        </div>
        <button type="button" className="btn" onClick={() => setMix({ ...EXAMPLE_MIX.classes })}>
          Reset to RC35 example
        </button>
      </header>

      <div className="mix-summary">
        {/* Left — class selectors */}
        <div className="panel">
          <div className="panel-hd"><h2>Assign Classes to Mix</h2></div>
          <div className="panel-bd">
            <ClassSelector label="Concrete Type" value={mix.concreteType} onChange={(v) => set('concreteType', v)}
              options={CONCRETE_TYPE_CLASSES.map((c) => c.code)} />
            <ClassSelector label="Strength Class" value={mix.strength} onChange={(v) => set('strength', v)}
              options={STRENGTH_CLASSES.map((c) => c.code)} />
            <ClassSelector label="Consistence Class" value={mix.consistence} onChange={(v) => set('consistence', v)}
              options={CONSISTENCE_CLASSES.map((c) => c.code)} />
            <ClassSelector label="Cement Class" value={mix.cementClass} onChange={(v) => set('cementClass', v)}
              options={CEMENT_CLASSES.map((c) => c.code)} isNew />
            <ClassSelector label="Coarse Aggregate Class" value={mix.coarseAggClass} onChange={(v) => set('coarseAggClass', v)}
              options={COARSE_AGG_CLASSES.map((c) => c.code)} isNew />
            <ClassSelector label="Fine Aggregate Class" value={mix.fineAggClass} onChange={(v) => set('fineAggClass', v)}
              options={FINE_AGG_CLASSES.map((c) => c.code)} isNew />
            <ClassSelector label="Water Class" value={mix.waterClass} onChange={(v) => set('waterClass', v)}
              options={WATER_CLASSES.map((c) => c.code)} isNew />
            <ClassSelector label="Admix Class" value={mix.admixClass} onChange={(v) => set('admixClass', v)}
              options={ADMIX_CLASSES.map((c) => c.code)} isNew highlight />
            <ClassSelector label="Chloride Class" value={mix.chlorideClass} onChange={(v) => set('chlorideClass', v)}
              options={CHLORIDE_CLASSES.map((c) => c.code)} isNew />
            <ClassSelector label="Exposure Class" value={mix.exposureClass} onChange={(v) => set('exposureClass', v)}
              options={EXPOSURE_CLASSES.map((c) => c.id)} isNew />
            <ClassSelector label="Design Method" value={mix.designMethod} onChange={(v) => set('designMethod', v)}
              options={DESIGN_METHOD_CLASSES.map((c) => c.id)} isNew />
            <ClassSelector label="Batch Book Type" value={mix.batchBookType} onChange={(v) => set('batchBookType', v)}
              options={BATCH_BOOK_TYPE_CLASSES.map((c) => c.code)} isNew />
          </div>
        </div>

        {/* Right — customer view and plant view */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Customer view */}
          <div className="panel">
            <div className="panel-hd" style={{ background: 'var(--brand-soft)' }}>
              <h2 style={{ color: 'var(--brand-deep)' }}>📄 Customer Document</h2>
              <span className="badge">Quote · Ticket · Invoice</span>
            </div>
            <div className="panel-bd">
              <p style={{ margin: '0 0 .85rem', fontSize: '.82rem', color: 'var(--ink-muted)' }}>
                What the customer reads — class codes only, no plant product names.
              </p>
              {[
                { label: 'Concrete Type', val: mix.concreteType },
                { label: 'Strength Class', val: mix.strength },
                { label: 'Consistence', val: mix.consistence },
                { label: 'Cement Class', val: mix.cementClass, isNew: true },
                { label: 'Coarse Aggregate', val: mix.coarseAggClass, isNew: true },
                { label: 'Fine Aggregate', val: mix.fineAggClass, isNew: true },
                { label: 'Water', val: mix.waterClass, isNew: true },
                { label: 'Admix Class', val: mix.admixClass, isNew: true, highlight: true },
                { label: 'Chloride Class', val: mix.chlorideClass, isNew: true },
                { label: 'Exposure Class', val: mix.exposureClass, isNew: true },
              ].map((row) => (
                <div key={row.label} className="mix-class-row">
                  <span className="mix-class-key">{row.label}</span>
                  <span className="mix-class-val" style={row.highlight ? { color: 'var(--new)', background: 'var(--new-soft)', padding: '.1rem .4rem', borderRadius: '4px' } : {}}>
                    {row.val || '—'}
                    {row.isNew && !row.highlight && <span className="badge new" style={{ marginLeft: '.4rem', fontSize: '.65rem' }}>new</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Plant view — translation */}
          <div className="panel">
            <div className="panel-hd" style={{ background: 'var(--warn-soft)' }}>
              <h2 style={{ color: '#6d4d00' }}>🏭 Plant — Actual Batch Materials</h2>
              <span className="badge warn">Internal only</span>
            </div>
            <div className="panel-bd">
              <p style={{ margin: '0 0 .85rem', fontSize: '.82rem', color: 'var(--ink-muted)' }}>
                What is actually batched — resolved from class definitions. Not shown to customer.
              </p>

              <TranslationBlock
                label={`Admix Class "${mix.admixClass}"`}
                materials={admix?.actualAdmixtures ?? []}
                empty="No admixtures"
                color="new"
              />
              <TranslationBlock
                label={`Cement Class "${mix.cementClass}"`}
                materials={cement?.actualMaterials ?? []}
                color="brand"
              />
              <TranslationBlock
                label={`Coarse Agg Class "${mix.coarseAggClass}"`}
                materials={coarse?.actualMaterials ?? []}
                color="ok"
              />
              <TranslationBlock
                label={`Fine Agg Class "${mix.fineAggClass}"`}
                materials={fine?.actualMaterials ?? []}
                color="ok"
              />
              <TranslationBlock
                label={`Water Class "${mix.waterClass}"`}
                materials={water?.actualMaterials ?? []}
                color="brand"
              />

              {exposure && (
                <div style={{ marginTop: '.75rem' }}>
                  <div style={{ fontSize: '.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ink-soft)', marginBottom: '.35rem' }}>
                    Exposure Constraints ({mix.exposureClass})
                  </div>
                  {exposure.details.map((d, i) => (
                    <div key={i} style={{ fontSize: '.82rem', color: 'var(--ink-muted)', padding: '.35rem .6rem', background: 'var(--surface-3)', borderRadius: '6px', marginBottom: '.25rem' }}>
                      Min cement: <strong>{d.minCement} kg/m³</strong> · Max w/c: <strong>{d.maxWaterCementRatio}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ClassSelector({ label, value, onChange, options, isNew, highlight }) {
  return (
    <div className="field">
      <label style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
        {label}
        {isNew && <span className="badge new" style={{ fontSize: '.62rem' }}>new</span>}
        {highlight && <span className="badge accent" style={{ fontSize: '.62rem' }}>customer-facing</span>}
      </label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function TranslationBlock({ label, materials, empty = 'None defined', color }) {
  const colors = {
    new: { bg: 'var(--new-soft)', border: '#c9b8ef', text: 'var(--new)' },
    brand: { bg: 'var(--brand-soft)', border: '#b7d7e6', text: 'var(--brand-deep)' },
    ok: { bg: 'var(--ok-soft)', border: '#a8d9bf', text: 'var(--ok)' },
  }[color] ?? { bg: 'var(--surface-3)', border: 'var(--line)', text: 'var(--ink-muted)' };

  return (
    <div style={{ marginBottom: '.75rem', border: `1px solid ${colors.border}`, borderRadius: '8px', overflow: 'hidden' }}>
      <div style={{ padding: '.4rem .75rem', background: colors.bg, fontSize: '.75rem', fontWeight: 700, color: colors.text }}>
        {label}
      </div>
      <div style={{ padding: '.5rem .75rem' }}>
        {materials.length === 0 ? (
          <span style={{ fontSize: '.82rem', color: 'var(--ink-soft)', fontStyle: 'italic' }}>{empty}</span>
        ) : (
          materials.map((m, i) => (
            <div key={i} style={{ fontSize: '.85rem', fontFamily: 'var(--mono)', padding: '.2rem 0', color: 'var(--ink)' }}>
              • {m}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
