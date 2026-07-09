import { Link } from 'react-router-dom';

export default function VisionPage() {
  return (
    <>
      <header className="page-header">
        <div>
          <div className="badge-row" style={{ marginBottom: '0.65rem' }}>
            <span className="badge">Prototype</span>
            <span className="badge accent">CARBON-1095 · CARBON-1097</span>
          </div>
          <h1>Price and sell in the unit the customer agreed</h1>
          <p>
            Today every product has one unit of measure. Customers who buy aggregate per tonne, blocks
            per thousand, or material per load still get quoted and invoiced in the product&apos;s base
            unit. This prototype shows how Product Editor, Dynamic Pricing, quoting, projects, ordering,
            and invoicing work together when a product can carry multiple sales units — for pricing and
            sales only — with linear price calculation end to end.
          </p>
        </div>
      </header>

      <div className="grid-3" style={{ marginBottom: '1rem' }}>
        <div className="stat">
          <label>Value driver 1</label>
          <strong style={{ fontSize: '1rem' }}>Commercial fidelity</strong>
          <div className="hint">
            Quote and invoice in the customer-agreed unit (tonne, load, per 1000) without inventing
            duplicate products.
          </div>
        </div>
        <div className="stat">
          <label>Value driver 2</label>
          <strong style={{ fontSize: '1rem' }}>Linear, transparent math</strong>
          <div className="hint">
            $1000 / 1000 blocks × 150 ordered = $150. Same formula for per-tonne and per-load rates.
          </div>
        </div>
        <div className="stat">
          <label>Value driver 3</label>
          <strong style={{ fontSize: '1rem' }}>One pricing source of truth</strong>
          <div className="hint">
            Sales units live on the product; prices live in the Dynamic Pricing table with UOM as a
            variable — not on the product record.
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-hd">
          <h2>Vision — what we are developing</h2>
        </div>
        <div className="panel-bd">
          <div className="grid-2">
            <div>
              <p style={{ marginTop: 0, color: 'var(--ink-muted)', lineHeight: 1.5 }}>
                Extend Command Cloud so a single product can declare multiple <em>sales</em> units of
                measure (each, per 1000, tonne, load, pallet). Operations may still weigh or count in the
                base / production unit. Pricing and billing use the selected sales unit, including cases
                where charge quantity differs from delivered quantity (<span className="mono">soldQuantity</span>).
              </p>
              <div className="formula" style={{ marginTop: '1rem' }}>
                extendedPrice = orderQty × (pricePerBasis ÷ basisQty)
                <br />
                <br />
                # Blocks: 150 × (1000 ÷ 1000) = 150
                <br />
                # Aggregate load: 3 LOAD × (500 ÷ 1) = 1500
                <br />
                # Aggregate tonne: 60 STN × (32 ÷ 1) = 1920
              </div>
            </div>
            <div>
              <div className="callout">
                <strong>Two pricing models, one engine</strong>
                <br />
                <br />
                <strong>Derived / linear bulk</strong> — commodity units with a basis (per 1000, per
                tonne). Conversion factors support ops; price comes from the pricing table.
                <br />
                <br />
                <strong>Fixed commercial</strong> — per load / pallet with no mathematical link to base
                UOM. Conversion factor optional/blank; dedicated pricing row required.
              </div>
              <div className="callout warn" style={{ marginTop: '0.75rem' }}>
                Phase 2 (product Sales Units) without Phase 3 (UOM on pricing + quote) delivers limited
                customer value — flagged by pricing (Diego) in CARBON-2348.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-hd">
          <h2>Walk the journey</h2>
          <Link className="btn primary" to="/product-editor">
            Start at Product Editor →
          </Link>
        </div>
        <div className="panel-bd">
          <ol style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--ink-muted)', lineHeight: 1.7 }}>
            <li>
              <Link to="/product-editor">Product Editor — Sales Units</Link>: allow EA + Per 1000 on
              blocks; STN + LOAD on aggregate.
            </li>
            <li>
              <Link to="/pricing-table">Dynamic Pricing table</Link>: set $1000 per 1000, and separate
              per-tonne / per-load rows.
            </li>
            <li>
              <Link to="/quote">Sales Quote</Link>: pick sales UOM; watch linear extended price update.
            </li>
            <li>
              <Link to="/project">Project</Link>: preserve selected sales UOM into the project cart.
            </li>
            <li>
              <Link to="/order">Order / Ticket</Link>: production qty vs charge qty (<span className="mono">soldQuantity</span>).
            </li>
            <li>
              <Link to="/invoice">Invoice</Link>: bill on charge basis, show delivered for audit.
            </li>
          </ol>
        </div>
      </div>
    </>
  );
}
