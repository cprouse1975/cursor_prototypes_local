import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PRODUCTS, UOMS, uomLabel } from '../data/demoData';

export default function ProductEditorPage() {
  const [productId, setProductId] = useState('BLOCK_STD');
  const [units, setUnits] = useState(() =>
    structuredClone(PRODUCTS.BLOCK_STD.uomConversions),
  );
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState({ uomCodeTo: 'TH', conversionFactor: '1000' });

  const product = PRODUCTS[productId];

  const switchProduct = (id) => {
    setProductId(id);
    setUnits(structuredClone(PRODUCTS[id].uomConversions));
    setShowAdd(false);
  };

  const availableToAdd = useMemo(() => {
    const used = new Set(units.map((u) => u.uomCodeTo));
    return UOMS.filter((u) => !used.has(u.code) && u.code !== product.baseUom);
  }, [units, product.baseUom]);

  const setDefault = (code) => {
    setUnits((prev) => prev.map((u) => ({ ...u, isDefault: u.uomCodeTo === code })));
  };

  const removeUnit = (code) => {
    setUnits((prev) => prev.filter((u) => u.uomCodeTo !== code || u.isBase));
  };

  const addUnit = () => {
    if (!draft.uomCodeTo) return;
    const factor =
      draft.conversionFactor === '' || draft.conversionFactor == null
        ? null
        : Number(draft.conversionFactor);
    setUnits((prev) => [
      ...prev,
      {
        uomCodeFrom: product.baseUom,
        uomCodeTo: draft.uomCodeTo,
        conversionFactor: Number.isFinite(factor) ? factor : null,
        isDefault: false,
        isBase: false,
        note:
          factor == null
            ? 'Flat commercial unit — requires dedicated pricing table entry'
            : undefined,
      },
    ]);
    setShowAdd(false);
    setDraft({ uomCodeTo: availableToAdd[0]?.code ?? '', conversionFactor: '' });
  };

  return (
    <>
      <header className="page-header">
        <div>
          <div className="badge-row" style={{ marginBottom: '0.65rem' }}>
            <span className="badge">Phase 2 · Setup</span>
            <span className="badge">CARBON-1952</span>
            <span className="badge warn">Prices not set here</span>
          </div>
          <h1>Product Editor — Sales Units</h1>
          <p>
            Replaces the Conversions tab. Admins declare which units a product may be sold in for
            pricing / sales, mark a default, and optionally store a conversion factor for operational
            use. Prices are configured in the Dynamic Pricing table.
          </p>
        </div>
        <Link className="btn primary" to="/pricing-table">
          Next: Pricing Table →
        </Link>
      </header>

      <div className="scenario-switch" style={{ marginBottom: '1rem' }}>
        <button
          type="button"
          className={productId === 'BLOCK_STD' ? 'active' : ''}
          onClick={() => switchProduct('BLOCK_STD')}
        >
          Blocks (EA / Per 1000)
        </button>
        <button
          type="button"
          className={productId === 'AGG_20MM' ? 'active' : ''}
          onClick={() => switchProduct('AGG_20MM')}
        >
          Aggregate (STN / LOAD)
        </button>
      </div>

      <div className="panel">
        <div className="tabs">
          <button type="button" className="tab">
            Product Profile
          </button>
          <button type="button" className="tab active">
            Sales Units
          </button>
          <button type="button" className="tab">
            Locations
          </button>
        </div>
        <div className="panel-hd">
          <div>
            <h2>
              {product.name}{' '}
              <span className="mono" style={{ color: 'var(--ink-soft)', fontWeight: 400 }}>
                {product.sku}
              </span>
            </h2>
            <div className="help" style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
              Base UOM: <strong>{uomLabel(product.baseUom)}</strong> ({product.baseUom}) — change on
              Product Profile only
            </div>
          </div>
          <button type="button" className="btn primary" onClick={() => setShowAdd(true)}>
            + Add Sales Unit
          </button>
        </div>
        <div className="panel-bd" style={{ padding: 0 }}>
          <table className="data">
            <thead>
              <tr>
                <th>Unit of measure</th>
                <th>Default</th>
                <th>Conv. factor</th>
                <th>Converts from</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {units.map((row) => (
                <tr key={row.uomCodeTo} className={row.isDefault ? 'highlight' : ''}>
                  <td>
                    <strong>{uomLabel(row.uomCodeTo)}</strong>{' '}
                    <span className="mono">({row.uomCodeTo})</span>
                    {row.isBase && (
                      <div className="note-inline">Base unit — read-only</div>
                    )}
                  </td>
                  <td>
                    <label className="pill-radio">
                      <input
                        type="radio"
                        name="defaultUom"
                        checked={row.isDefault}
                        onChange={() => setDefault(row.uomCodeTo)}
                      />
                      Default
                    </label>
                  </td>
                  <td className="mono">
                    {row.conversionFactor == null ? (
                      <span className="note-inline">Optional / blank</span>
                    ) : (
                      row.conversionFactor
                    )}
                  </td>
                  <td className="mono">{row.uomCodeFrom}</td>
                  <td style={{ maxWidth: 220, fontSize: '0.82rem', color: 'var(--ink-muted)' }}>
                    {row.note || (row.isBase ? 'Identity entry persisted on save' : '—')}
                  </td>
                  <td>
                    {!row.isBase && (
                      <button type="button" className="btn ghost" onClick={() => removeUnit(row.uomCodeTo)}>
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <div className="panel">
          <div className="panel-hd">
            <h2>Add Sales Unit</h2>
            <button type="button" className="btn" onClick={() => setShowAdd(false)}>
              Cancel
            </button>
          </div>
          <div className="panel-bd">
            <div className="grid-2">
              <div className="field">
                <label htmlFor="uom">Unit of measure</label>
                <select
                  id="uom"
                  value={draft.uomCodeTo}
                  onChange={(e) => setDraft((d) => ({ ...d, uomCodeTo: e.target.value }))}
                >
                  {availableToAdd.map((u) => (
                    <option key={u.code} value={u.code}>
                      {u.label} ({u.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="factor">Conversion factor (optional)</label>
                <input
                  id="factor"
                  value={draft.conversionFactor}
                  onChange={(e) => setDraft((d) => ({ ...d, conversionFactor: e.target.value }))}
                  placeholder="Leave blank for flat commercial units"
                />
                <div className="help">
                  Required for ops conversions (e.g. YDQ↔STN). Leave blank for LOAD / pallet flat rates.
                </div>
              </div>
            </div>
            <button type="button" className="btn primary" onClick={addUnit} disabled={!availableToAdd.length}>
              Save sales unit
            </button>
          </div>
        </div>
      )}

      <div className="callout" style={{ marginTop: '1rem' }}>
        Extends existing <span className="mono">uomConversions[]</span> with <span className="mono">isDefault</span>{' '}
        only — no <span className="mono">unitPrice</span> on the product (Diego / pricing team). Legacy{' '}
        <span className="mono">salesUomCode</span> is removed from this UI but remains deprecated in the API
        (CARBON-2169).
      </div>
    </>
  );
}
