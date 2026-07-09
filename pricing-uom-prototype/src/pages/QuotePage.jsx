import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CUSTOMERS,
  LOCATIONS,
  PRICING_ROWS,
  PRODUCTS,
  uomLabel,
} from '../data/demoData';
import { extendedPrice, formatMoney, resolvePrice, unitRate } from '../lib/pricing';

const SCENARIOS = {
  blocks: {
    label: 'Blocks — 150 @ per 1000',
    productId: 'BLOCK_STD',
    uomCode: 'TH',
    qty: 150,
    customerId: 'CUST_HM',
    locationId: 'LOC_DUB',
  },
  tonne: {
    label: 'Aggregate — 60 STN',
    productId: 'AGG_20MM',
    uomCode: 'STN',
    qty: 60,
    customerId: 'CUST_RS',
    locationId: 'LOC_CORK',
  },
  load: {
    label: 'Aggregate — 3 LOAD',
    productId: 'AGG_20MM',
    uomCode: 'LOAD',
    qty: 3,
    customerId: 'CUST_RS',
    locationId: 'LOC_CORK',
  },
};

export default function QuotePage() {
  const [scenarioKey, setScenarioKey] = useState('blocks');
  const scenario = SCENARIOS[scenarioKey];
  const product = PRODUCTS[scenario.productId];

  const [uomCode, setUomCode] = useState(scenario.uomCode);
  const [qty, setQty] = useState(scenario.qty);
  const [customerId, setCustomerId] = useState(scenario.customerId);
  const [locationId, setLocationId] = useState(scenario.locationId);

  const applyScenario = (key) => {
    const s = SCENARIOS[key];
    setScenarioKey(key);
    setUomCode(s.uomCode);
    setQty(s.qty);
    setCustomerId(s.customerId);
    setLocationId(s.locationId);
  };

  const priceRow = useMemo(
    () =>
      resolvePrice(PRICING_ROWS, {
        productId: product.id,
        uomCode,
        customerId,
        locationId,
      }),
    [product.id, uomCode, customerId, locationId],
  );

  const line = priceRow
    ? {
        unit: unitRate(priceRow.price, priceRow.basisQty),
        extended: extendedPrice(qty, priceRow.price, priceRow.basisQty),
      }
    : null;

  const conversion = product.uomConversions.find((u) => u.uomCodeTo === uomCode);

  return (
    <>
      <header className="page-header">
        <div>
          <div className="badge-row" style={{ marginBottom: '0.65rem' }}>
            <span className="badge">Phase 3 · Sales</span>
            <span className="badge">CARBON-1953</span>
          </div>
          <h1>Sales Quote — select sales UOM</h1>
          <p>
            Quote lines bind the UOM picker to the product&apos;s allowed sales units. Default
            pre-selects <span className="mono">isDefault: true</span>. Pricing resolves with UOM as a
            matching variable.
          </p>
        </div>
        <Link className="btn primary" to="/project">
          Next: Project →
        </Link>
      </header>

      <div className="scenario-switch" style={{ marginBottom: '1rem' }}>
        {Object.entries(SCENARIOS).map(([key, s]) => (
          <button
            key={key}
            type="button"
            className={scenarioKey === key ? 'active' : ''}
            onClick={() => applyScenario(key)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="panel">
        <div className="panel-hd">
          <h2>Quote Q-10482 · Draft</h2>
          <span className="badge ok">Dynamic pricing</span>
        </div>
        <div className="panel-bd">
          <div className="grid-3">
            <div className="field">
              <label>Customer</label>
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                {CUSTOMERS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Ship-from location</label>
              <select value={locationId} onChange={(e) => setLocationId(e.target.value)}>
                {LOCATIONS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Product</label>
              <input value={`${product.name} (${product.sku})`} readOnly />
            </div>
          </div>

          <table className="data">
            <thead>
              <tr>
                <th>Product</th>
                <th>Sales UOM</th>
                <th>Qty</th>
                <th>Unit price</th>
                <th>Extended</th>
                <th>Price source</th>
              </tr>
            </thead>
            <tbody>
              <tr className="highlight">
                <td>
                  <strong>{product.name}</strong>
                  <div className="mono" style={{ color: 'var(--ink-soft)' }}>
                    {product.sku}
                  </div>
                </td>
                <td>
                  <select value={uomCode} onChange={(e) => setUomCode(e.target.value)}>
                    {product.uomConversions.map((u) => (
                      <option key={u.uomCodeTo} value={u.uomCodeTo}>
                        {uomLabel(u.uomCodeTo)}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    style={{ width: 100 }}
                  />
                  {conversion?.conversionFactor != null && !conversion.isBase && (
                    <div className="help">
                      Ops hint: ≈ {(qty / conversion.conversionFactor).toFixed(2)} {product.baseUom}{' '}
                      base
                    </div>
                  )}
                  {conversion?.conversionFactor == null && (
                    <div className="note-inline">Flat commercial unit</div>
                  )}
                </td>
                <td className="mono">
                  {line ? formatMoney(line.unit) : '—'}
                  {priceRow && (
                    <div className="help">
                      from {formatMoney(priceRow.price)} / {priceRow.basisQty} {uomCode}
                    </div>
                  )}
                </td>
                <td className="mono">
                  <strong>{line ? formatMoney(line.extended) : '—'}</strong>
                </td>
                <td style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>
                  {priceRow ? priceRow.label : 'No match'}
                </td>
              </tr>
            </tbody>
          </table>

          {line && priceRow && (
            <div className="formula" style={{ marginTop: '1rem' }}>
              {qty} × ({priceRow.price} ÷ {priceRow.basisQty}) = {line.extended.toFixed(2)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
