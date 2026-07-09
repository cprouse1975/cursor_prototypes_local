import { Link } from 'react-router-dom';
import { formatMoney } from '../lib/pricing';

const CART = [
  {
    product: 'Standard Concrete Block',
    sku: 'BLK-STD-190',
    salesUom: 'TH',
    salesUomLabel: 'Per 1000',
    qty: 150,
    unitPrice: 0.92,
    extended: 138,
    priceLabel: 'HM customer — $920 per 1000',
    preservedFrom: 'Quote Q-10482',
  },
  {
    product: '20mm Crushed Aggregate',
    sku: 'AGG-20-STN',
    salesUom: 'LOAD',
    salesUomLabel: 'Per Load',
    qty: 3,
    unitPrice: 500,
    extended: 1500,
    priceLabel: 'Per load flat rate',
    preservedFrom: 'Quote Q-10482',
  },
];

export default function ProjectPage() {
  return (
    <>
      <header className="page-header">
        <div>
          <div className="badge-row" style={{ marginBottom: '0.65rem' }}>
            <span className="badge">Phase 3 · Handoff</span>
            <span className="badge">CARBON-1954</span>
          </div>
          <h1>Project cart — preserve selected sales UOM</h1>
          <p>
            When a quote is won, the selected sales UOM and priced unit rate must carry into the
            project cart. Today dispatch project UI often reverts to product base UOM — that overwrite
            is a known gap called out in CARBON-1910.
          </p>
        </div>
        <Link className="btn primary" to="/order">
          Next: Order / Ticket →
        </Link>
      </header>

      <div className="panel">
        <div className="panel-hd">
          <h2>Project PRJ-7781 · Cart</h2>
          <span className="badge ok">UOM preserved from quote</span>
        </div>
        <div className="panel-bd" style={{ padding: 0 }}>
          <table className="data">
            <thead>
              <tr>
                <th>Product</th>
                <th>Sales UOM</th>
                <th>Qty</th>
                <th>Unit price</th>
                <th>Extended</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {CART.map((line) => (
                <tr key={line.sku}>
                  <td>
                    <strong>{line.product}</strong>
                    <div className="mono" style={{ color: 'var(--ink-soft)' }}>
                      {line.sku}
                    </div>
                  </td>
                  <td>
                    <strong>{line.salesUomLabel}</strong>{' '}
                    <span className="mono">({line.salesUom})</span>
                  </td>
                  <td className="mono">{line.qty}</td>
                  <td className="mono">{formatMoney(line.unitPrice)}</td>
                  <td className="mono">{formatMoney(line.extended)}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>
                    {line.preservedFrom}
                    <div>{line.priceLabel}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="callout warn" style={{ marginTop: '1rem' }}>
        <strong>Backlog gap:</strong> Project cart schema today has no first-class sales UOM column in
        all paths. Order creation (<span className="mono">generate-order-line-item.js</span>) currently
        overwrites <span className="mono">orderedQuantity.uomCode</span> with{' '}
        <span className="mono">product.uomCode</span>. CARBON-1954 / CARBON-1955 close this handoff.
      </div>
    </>
  );
}
