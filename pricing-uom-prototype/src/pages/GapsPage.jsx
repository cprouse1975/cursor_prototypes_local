const GAPS = [
  {
    area: 'Product setup',
    covered: 'CARBON-1095 Phase 2 — Sales Units tab, uomConversions.isDefault, migration CARBON-2171',
    missing:
      'Clearer UX copy that sales units are for pricing/sales only; guidance when conversion factor is blank; link-out to create pricing rows for new commercial units.',
    severity: 'Medium',
  },
  {
    area: 'Dynamic pricing table',
    covered: 'CARBON-2348 spike (in progress) asks Diego whether UOM becomes a 5th variable',
    missing:
      'No implementation stories yet for pricing UI column, Excel import template, API request uomCode, discount×UOM interaction, or basisQty for “per 1000” linear bulk (CARBON-1097 still conceptual).',
    severity: 'High',
  },
  {
    area: 'Linear / bulk calculation',
    covered: 'CARBON-1097 describes $1000/1000 → 150 = $150',
    missing:
      'No child stories under CARBON-1097 except the architecture spike. Need explicit stories for basis quantity on pricing rows, quote display of “price per basis”, and rounding rules.',
    severity: 'High',
  },
  {
    area: 'Sales quoting',
    covered: 'CARBON-1953 — picker bound to allowed sales units, default pre-select',
    missing:
      'Blocked on CARBON-2348 for pricing behaviour. Need AC for dual display (sales UOM + ops hint), customer-default sales UOM (mentioned in early problem statement, not ticketed), and Block cart section coordination.',
    severity: 'High',
  },
  {
    area: 'Quote → Project',
    covered: 'CARBON-1954 — preserve selected sales UOM',
    missing:
      'Schema work for cart line sales UOM across Concrete/Aggregate/Block/Mortar sections; Jobs cart parity; PDF quote showing sales UOM.',
    severity: 'Medium',
  },
  {
    area: 'Order / production quantity',
    covered: 'CARBON-1955 — stop overwrite to product.uomCode; populate soldQuantity',
    missing:
      'Rules for deriving LOAD count from weighed tonnes (partial loads, min load). Scale ticketing path for unannounced vehicles. RMC explicitly out of MVP but needs stated non-goals.',
    severity: 'High',
  },
  {
    area: 'Invoicing',
    covered: 'CARBON-1956 + CARBON-1910 recommendation to prefer soldQuantity',
    missing:
      'Billable UI showing delivered vs charged; UOM enum extension lockstep; tax base confirmation; manual billable override behaviour; feature-flagged dual-read period.',
    severity: 'High',
  },
  {
    area: 'Per-customer commercial defaults',
    covered: 'Problem statement notes customer-agreed unit',
    missing:
      'No story for customer–product default sales UOM or contract-level unit preference (only product-level default exists).',
    severity: 'Medium',
  },
  {
    area: 'Release packaging',
    covered: 'Diego flagged Phase 2 alone has limited value; CARBON-1957 feature flag',
    missing:
      'Explicit decision record: ship Phase 2+3 together for HM/Roadstone? Dependency board across Pod 54, pricing platform, dispatch, billing.',
    severity: 'High',
  },
];

export default function GapsPage() {
  return (
    <>
      <header className="page-header">
        <div>
          <div className="badge-row" style={{ marginBottom: '0.65rem' }}>
            <span className="badge accent">Backlog review</span>
            <span className="badge">CARBON-1095 · CARBON-1097</span>
          </div>
          <h1>What the backlog covers — and what it doesn&apos;t</h1>
          <p>
            Epics and stories outline the spine of the journey, but several commercial and
            cross-team capabilities still need tickets before this can be sold as an end-to-end
            capability.
          </p>
        </div>
      </header>

      <div className="panel" style={{ marginBottom: '1rem' }}>
        <div className="panel-hd">
          <h2>Mapped backlog spine</h2>
        </div>
        <div className="panel-bd" style={{ padding: 0 }}>
          <table className="data">
            <thead>
              <tr>
                <th>Stage</th>
                <th>Tickets</th>
                <th>Status signal</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Product Sales Units</td>
                <td className="mono">CARBON-1095, 1952, 2169, 2170, 2171, 2247</td>
                <td>Phase 2 foundation — To Do</td>
              </tr>
              <tr>
                <td>Pricing architecture</td>
                <td className="mono">CARBON-1097, 2348</td>
                <td>Spike in progress; 1097 thin on children</td>
              </tr>
              <tr>
                <td>Quote / Project</td>
                <td className="mono">CARBON-1953, 1954</td>
                <td>Open — blocked on 2348 for pricing design</td>
              </tr>
              <tr>
                <td>Order / Ticket / Invoice</td>
                <td className="mono">CARBON-1955, 1956, 1910</td>
                <td>Open — soldQuantity contract critical</td>
              </tr>
              <tr>
                <td>Rollout</td>
                <td className="mono">CARBON-1957</td>
                <td>Feature flag / SKU gate</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid-2">
        {GAPS.map((gap) => (
          <div className="gap-card" key={gap.area}>
            <h3>{gap.area}</h3>
            <p>
              <strong>Covered:</strong> {gap.covered}
            </p>
            <p style={{ marginTop: '0.5rem' }}>
              <strong>Gap:</strong> {gap.missing}
            </p>
            <div className="gap-meta">
              <span className={`badge${gap.severity === 'High' ? ' warn' : ''}`}>
                {gap.severity} priority gap
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="callout" style={{ marginTop: '1rem' }}>
        Full write-up with value drivers and recommended follow-on stories:{' '}
        <span className="mono">docs/pricing-sales-uom-vision.md</span>
      </div>
    </>
  );
}
