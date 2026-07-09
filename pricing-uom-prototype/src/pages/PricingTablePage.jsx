import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PRICING_ROWS, PRODUCTS, uomLabel } from '../data/demoData';
import { extendedPrice, formatMoney, unitRate } from '../lib/pricing';

export default function PricingTablePage() {
  const [rows] = useState(PRICING_ROWS);
  const [productFilter, setProductFilter] = useState('BLOCK_STD');
  const [demoQty, setDemoQty] = useState(150);
  const [demoUom, setDemoUom] = useState('TH');

  const filtered = rows.filter((r) => r.productId === productFilter);
  const product = PRODUCTS[productFilter];

  const activeRow = useMemo(() => {
    const specific = filtered.find((r) => r.uomCode === demoUom);
    const catchAll = filtered.find((r) => !r.uomCode);
    return specific || catchAll || null;
  }, [filtered, demoUom]);

  const calc = activeRow
    ? {
        rate: unitRate(activeRow.price, activeRow.basisQty),
        extended: extendedPrice(demoQty, activeRow.price, activeRow.basisQty),
      }
    : null;

  const switchProduct = (id) => {
    setProductFilter(id);
    if (id === 'BLOCK_STD') {
      setDemoUom('TH');
      setDemoQty(150);
    } else {
      setDemoUom('LOAD');
      setDemoQty(3);
    }
  };

  return (
    <>
      <header className="page-header">
        <div>
          <div className="badge-row" style={{ marginBottom: '0.65rem' }}>
            <span className="badge">Phase 3 · Pricing</span>
            <span className="badge accent">CARBON-1097 · CARBON-2348</span>
            <span className="badge warn">UOM as pricing variable (proposed)</span>
          </div>
          <h1>Dynamic Pricing — price per sales unit</h1>
          <p>
            Prices stay in the pricing table. Adding UOM as a variable (alongside Customer, Location,
            Tier, Sales Team) lets admins set independent rates for tonne, load, each, or per 1000 —
            including linear bulk basis quantities.
          </p>
        </div>
        <Link className="btn primary" to="/quote">
          Next: Sales Quote →
        </Link>
      </header>

      <div className="scenario-switch" style={{ marginBottom: '1rem' }}>
        <button
          type="button"
          className={productFilter === 'BLOCK_STD' ? 'active' : ''}
          onClick={() => switchProduct('BLOCK_STD')}
        >
          {PRODUCTS.BLOCK_STD.name}
        </button>
        <button
          type="button"
          className={productFilter === 'AGG_20MM' ? 'active' : ''}
          onClick={() => switchProduct('AGG_20MM')}
        >
          {PRODUCTS.AGG_20MM.name}
        </button>
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-hd">
            <h2>Pricing table rows</h2>
            <span className="badge">Blank UOM = catch-all</span>
          </div>
          <div className="panel-bd" style={{ padding: 0 }}>
            <table className="data">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>UOM</th>
                  <th>Customer</th>
                  <th>Price</th>
                  <th>Basis qty</th>
                  <th>Effective rate</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr
                    key={row.id}
                    className={activeRow?.id === row.id ? 'highlight' : ''}
                  >
                    <td>{PRODUCTS[row.productId].sku}</td>
                    <td className="mono">{row.uomCode ? uomLabel(row.uomCode) : '— (any)'}</td>
                    <td className="mono">{row.customerId || '—'}</td>
                    <td className="mono">{formatMoney(row.price, row.currency)}</td>
                    <td className="mono">{row.basisQty}</td>
                    <td className="mono">
                      {formatMoney(unitRate(row.price, row.basisQty), row.currency)} / unit
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <div className="panel-hd">
            <h2>Linear calculation preview</h2>
          </div>
          <div className="panel-bd">
            <div className="field">
              <label htmlFor="demoUom">Sales UOM</label>
              <select
                id="demoUom"
                value={demoUom}
                onChange={(e) => setDemoUom(e.target.value)}
              >
                {product.uomConversions.map((u) => (
                  <option key={u.uomCodeTo} value={u.uomCodeTo}>
                    {uomLabel(u.uomCodeTo)} ({u.uomCodeTo})
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="demoQty">Order quantity (in sales UOM)</label>
              <input
                id="demoQty"
                type="number"
                min="0"
                value={demoQty}
                onChange={(e) => setDemoQty(Number(e.target.value))}
              />
              <div className="help">
                For Per 1000, enter block count (e.g. 150). For LOAD, enter number of loads.
              </div>
            </div>

            {calc && activeRow ? (
              <>
                <div className="formula">
                  extended = qty × (price ÷ basis)
                  <br />
                  {demoQty} × ({activeRow.price} ÷ {activeRow.basisQty}) ={' '}
                  {calc.extended.toFixed(2)}
                </div>
                <div className="grid-3" style={{ marginTop: '0.85rem' }}>
                  <div className="stat">
                    <label>Matched row</label>
                    <strong style={{ fontSize: '0.95rem' }}>{activeRow.label}</strong>
                  </div>
                  <div className="stat">
                    <label>Unit rate</label>
                    <strong>{formatMoney(calc.rate)}</strong>
                  </div>
                  <div className="stat">
                    <label>Extended</label>
                    <strong>{formatMoney(calc.extended)}</strong>
                  </div>
                </div>
              </>
            ) : (
              <div className="callout warn">
                No pricing row for this UOM. Flat commercial units cannot be derived — add a dedicated
                row before quoting.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="callout ok" style={{ marginTop: '1rem' }}>
        <strong>Hero example:</strong> priced at $1000 per 1000 → order 150 blocks →{' '}
        <span className="mono">150 × (1000 ÷ 1000) = $150</span>. Same linear rule applies when
        aggregates are priced per tonne and separately per load.
      </div>
    </>
  );
}
