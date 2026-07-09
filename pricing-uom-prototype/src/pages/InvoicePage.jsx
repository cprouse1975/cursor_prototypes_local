import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { chargeBasis, formatMoney, formatQty } from '../lib/pricing';

const LINES = {
  load: {
    productId: 'AGG_20MM',
    product: '20mm Crushed Aggregate',
    quantity: { value: 60, uomCode: 'STN' },
    soldQuantity: { value: 3, uomCode: 'LOAD' },
    unitPrice: 500,
    priceSource: 'pricing-table:LOAD',
  },
  blocks: {
    productId: 'BLOCK_STD',
    product: 'Standard Concrete Block',
    quantity: { value: 150, uomCode: 'EA' },
    soldQuantity: { value: 150, uomCode: 'TH' },
    unitPrice: 0.92,
    priceSource: 'pricing-table:TH+CUST_HM',
  },
};

export default function InvoicePage() {
  const [mode, setMode] = useState('load');
  const raw = LINES[mode];

  const billable = useMemo(() => {
    const charge = chargeBasis(raw);
    return {
      ...raw,
      billQty: charge.quantity,
      billUom: charge.uomCode,
      chargeSource: charge.source,
      delivered: charge.delivered,
      extended: charge.quantity * raw.unitPrice,
    };
  }, [raw]);

  return (
    <>
      <header className="page-header">
        <div>
          <div className="badge-row" style={{ marginBottom: '0.65rem' }}>
            <span className="badge">Phase 4 · Financial</span>
            <span className="badge">CARBON-1956 · CARBON-1910</span>
          </div>
          <h1>Invoice — charge on sales UOM</h1>
          <p>
            Invoicing source of truth today is the dispatch ticket. Billing must prefer{' '}
            <span className="mono">soldQuantity</span> when present so customers are invoiced in the
            agreed sales unit, while delivered quantity remains available for audit.
          </p>
        </div>
        <Link className="btn primary" to="/gaps">
          Review backlog gaps →
        </Link>
      </header>

      <div className="scenario-switch" style={{ marginBottom: '1rem' }}>
        <button
          type="button"
          className={mode === 'load' ? 'active' : ''}
          onClick={() => setMode('load')}
        >
          Invoice LOAD charge (delivered STN)
        </button>
        <button
          type="button"
          className={mode === 'blocks' ? 'active' : ''}
          onClick={() => setMode('blocks')}
        >
          Invoice blocks linear bulk
        </button>
      </div>

      <div className="panel">
        <div className="panel-hd">
          <h2>Invoice INV-33019</h2>
          <span className="badge ok">Charge basis: {billable.chargeSource}</span>
        </div>
        <div className="panel-bd" style={{ padding: 0 }}>
          <table className="data">
            <thead>
              <tr>
                <th>Description</th>
                <th>Delivered</th>
                <th>Billed qty</th>
                <th>UOM</th>
                <th>Unit price</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="highlight">
                <td>
                  <strong>{billable.product}</strong>
                  <div className="help">{billable.priceSource}</div>
                </td>
                <td className="mono">
                  {billable.delivered
                    ? `${formatQty(billable.delivered.value)} ${billable.delivered.uomCode}`
                    : `${formatQty(billable.quantity.value)} ${billable.quantity.uomCode}`}
                </td>
                <td className="mono">{formatQty(billable.billQty)}</td>
                <td className="mono">{billable.billUom}</td>
                <td className="mono">{formatMoney(billable.unitPrice)}</td>
                <td className="mono">
                  <strong>{formatMoney(billable.extended)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: '1rem' }}>
        <div className="formula">
          // Proposed billing ingress (CARBON-1910)
          <br />
          const chargeQty = soldQuantity?.value ?? quantity.value;
          <br />
          const chargeUom = soldQuantity?.uomCode ?? quantity.uomCode;
          <br />
          amount = chargeQty × unitPrice;
          <br />
          <br />
          // This invoice
          <br />
          {billable.billQty} × {billable.unitPrice} = {billable.extended.toFixed(2)}
        </div>
        <div className="callout warn">
          <strong>Highest-risk integration point:</strong> Dispatch must populate{' '}
          <span className="mono">soldQuantity</span> and Billing must consume it in the same release
          window. Until then, billing continues to invoice delivered weight even if sales intended a
          load rate.
        </div>
      </div>
    </>
  );
}
