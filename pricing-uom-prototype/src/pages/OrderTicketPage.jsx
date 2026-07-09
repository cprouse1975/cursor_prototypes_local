import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatMoney, formatQty } from '../lib/pricing';

/**
 * Demonstrates delivered vs charge quantity.
 * Aggregate: delivered 60 STN, charged as 3 LOAD @ $500.
 * Blocks: delivered/charged same UOM (150 EA priced via per-1000 rate).
 */
export default function OrderTicketPage() {
  const [mode, setMode] = useState('load');

  const line = useMemo(() => {
    if (mode === 'load') {
      return {
        product: '20mm Crushed Aggregate',
        sku: 'AGG-20-STN',
        productionQty: { value: 60, uomCode: 'STN' },
        soldQuantity: { value: 3, uomCode: 'LOAD' },
        unitPrice: 500,
        priceLabel: 'Per load flat rate',
        note: 'Charge UOM ≠ delivered UOM — populate soldQuantity at ticket pricing time',
      };
    }
    return {
      product: 'Standard Concrete Block',
      sku: 'BLK-STD-190',
      productionQty: { value: 150, uomCode: 'EA' },
      soldQuantity: { value: 150, uomCode: 'TH' },
      unitPrice: 0.92,
      priceLabel: 'HM — $920 per 1000 (linear)',
      note: 'Sales UOM is Per 1000; quantity is still counted in pieces for production',
    };
  }, [mode]);

  const extended = line.soldQuantity.value * line.unitPrice;

  return (
    <>
      <header className="page-header">
        <div>
          <div className="badge-row" style={{ marginBottom: '0.65rem' }}>
            <span className="badge">Phase 4 · Operations</span>
            <span className="badge">CARBON-1955</span>
          </div>
          <h1>Order / Ticket — production qty vs charge qty</h1>
          <p>
            Dispatch may weigh or count in the production unit while pricing uses the sales unit.
            When they differ, ticket lines set <span className="mono">soldQuantity</span> as the
            charge basis and keep delivered quantity for operations and audit.
          </p>
        </div>
        <Link className="btn primary" to="/invoice">
          Next: Invoice →
        </Link>
      </header>

      <div className="scenario-switch" style={{ marginBottom: '1rem' }}>
        <button
          type="button"
          className={mode === 'load' ? 'active' : ''}
          onClick={() => setMode('load')}
        >
          Aggregate: 60 STN delivered / 3 LOAD charged
        </button>
        <button
          type="button"
          className={mode === 'blocks' ? 'active' : ''}
          onClick={() => setMode('blocks')}
        >
          Blocks: 150 pieces @ per-1000 rate
        </button>
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-hd">
            <h2>Order ORD-55201 · Ticket TKT-90112</h2>
          </div>
          <div className="panel-bd" style={{ padding: 0 }}>
            <table className="data">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Product</td>
                  <td>
                    <strong>{line.product}</strong>{' '}
                    <span className="mono">({line.sku})</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    Delivered quantity
                    <div className="help">
                      <span className="mono">quantity</span>
                    </div>
                  </td>
                  <td className="mono">
                    {formatQty(line.productionQty.value)} {line.productionQty.uomCode}
                  </td>
                </tr>
                <tr className="highlight">
                  <td>
                    Charge quantity
                    <div className="help">
                      <span className="mono">soldQuantity</span>
                    </div>
                  </td>
                  <td className="mono">
                    <strong>
                      {formatQty(line.soldQuantity.value)} {line.soldQuantity.uomCode}
                    </strong>
                  </td>
                </tr>
                <tr>
                  <td>Unit price (per charge UOM)</td>
                  <td className="mono">{formatMoney(line.unitPrice)}</td>
                </tr>
                <tr>
                  <td>Extended price</td>
                  <td className="mono">
                    <strong>{formatMoney(extended)}</strong>
                  </td>
                </tr>
                <tr>
                  <td>Price source</td>
                  <td>{line.priceLabel}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="callout">
            <strong>Pricing payload change</strong>
            <br />
            Today <span className="mono">calculate-product-prices</span> receives numeric quantity
            only. Phase 4 sends sales UOM so the engine can match UOM-specific rows.
          </div>
          <div className="formula" style={{ marginTop: '0.85rem' }}>
            extendedPrice = soldQuantity.value × unitPrice
            <br />
            {line.soldQuantity.value} × {line.unitPrice} = {extended.toFixed(2)}
          </div>
          <div className="callout warn" style={{ marginTop: '0.85rem' }}>
            {line.note}
          </div>
        </div>
      </div>
    </>
  );
}
