/** Demo catalogue aligned to CARBON-1095 / CARBON-1097 scenarios */

export const UOMS = [
  { code: 'EA', label: 'Each' },
  { code: 'TH', label: 'Per 1000' },
  { code: 'STN', label: 'Short Ton' },
  { code: 'YDQ', label: 'Cubic Yard' },
  { code: 'LOAD', label: 'Per Load' },
  { code: 'PAL', label: 'Pallet' },
];

export const uomLabel = (code) => UOMS.find((u) => u.code === code)?.label ?? code;

export const PRODUCTS = {
  BLOCK_STD: {
    id: 'BLOCK_STD',
    name: 'Standard Concrete Block',
    sku: 'BLK-STD-190',
    type: 'BLOCK',
    baseUom: 'EA',
    currency: 'USD',
    /** Extended uomConversions[] — Phase 2 model (CARBON-1095) */
    uomConversions: [
      { uomCodeFrom: 'EA', uomCodeTo: 'EA', conversionFactor: 1, isDefault: true, isBase: true },
      {
        uomCodeFrom: 'EA',
        uomCodeTo: 'TH',
        conversionFactor: 1000,
        isDefault: false,
        isBase: false,
        note: 'Commercial bulk unit — price set in pricing table as $ per 1000',
      },
    ],
  },
  AGG_20MM: {
    id: 'AGG_20MM',
    name: '20mm Crushed Aggregate',
    sku: 'AGG-20-STN',
    type: 'AGGREGATE',
    baseUom: 'STN',
    currency: 'USD',
    uomConversions: [
      { uomCodeFrom: 'STN', uomCodeTo: 'STN', conversionFactor: 1, isDefault: true, isBase: true },
      {
        uomCodeFrom: 'STN',
        uomCodeTo: 'YDQ',
        conversionFactor: 0.765,
        isDefault: false,
        isBase: false,
      },
      {
        uomCodeFrom: 'STN',
        uomCodeTo: 'LOAD',
        conversionFactor: null,
        isDefault: false,
        isBase: false,
        note: 'Flat commercial unit — no conversion factor; requires dedicated pricing row',
      },
    ],
  },
};

/**
 * Dynamic pricing table rows with UOM as a 5th variable (proposed — CARBON-2348).
 * basisQty supports linear bulk pricing: price is "per basisQty of uomCode".
 * For TH (per 1000), basisQty=1000 and price=1000 → $1.00 each.
 * For LOAD, basisQty=1 and price=500 → $500 per load.
 */
export const PRICING_ROWS = [
  {
    id: 'p1',
    productId: 'BLOCK_STD',
    uomCode: 'EA',
    customerId: null,
    locationId: null,
    price: 1.05,
    basisQty: 1,
    currency: 'USD',
    validFrom: '2026-01-01',
    label: 'Catch-all each',
  },
  {
    id: 'p2',
    productId: 'BLOCK_STD',
    uomCode: 'TH',
    customerId: null,
    locationId: null,
    price: 1000,
    basisQty: 1000,
    currency: 'USD',
    validFrom: '2026-01-01',
    label: '$1000 per 1000 blocks',
  },
  {
    id: 'p3',
    productId: 'BLOCK_STD',
    uomCode: 'TH',
    customerId: 'CUST_HM',
    locationId: null,
    price: 920,
    basisQty: 1000,
    currency: 'USD',
    validFrom: '2026-01-01',
    label: 'HM customer — $920 per 1000',
  },
  {
    id: 'p4',
    productId: 'AGG_20MM',
    uomCode: null,
    customerId: null,
    locationId: null,
    price: 28.5,
    basisQty: 1,
    currency: 'USD',
    validFrom: '2026-01-01',
    label: 'Catch-all (base STN)',
  },
  {
    id: 'p5',
    productId: 'AGG_20MM',
    uomCode: 'STN',
    customerId: null,
    locationId: null,
    price: 32.0,
    basisQty: 1,
    currency: 'USD',
    validFrom: '2026-01-01',
    label: 'Per tonne',
  },
  {
    id: 'p6',
    productId: 'AGG_20MM',
    uomCode: 'LOAD',
    customerId: null,
    locationId: null,
    price: 500,
    basisQty: 1,
    currency: 'USD',
    validFrom: '2026-01-01',
    label: 'Per load flat rate',
  },
  {
    id: 'p7',
    productId: 'AGG_20MM',
    uomCode: 'YDQ',
    customerId: null,
    locationId: null,
    price: 24.5,
    basisQty: 1,
    currency: 'USD',
    validFrom: '2026-01-01',
    label: 'Per cubic yard',
  },
];

export const CUSTOMERS = [
  { id: 'CUST_HM', name: 'HM Global Construction' },
  { id: 'CUST_RS', name: 'Roadstone Aggregates Ltd' },
];

export const LOCATIONS = [
  { id: 'LOC_DUB', name: 'Dublin Plant' },
  { id: 'LOC_CORK', name: 'Cork Quarry' },
];

export const JOURNEY_STEPS = [
  {
    id: 'vision',
    path: '/',
    label: 'Vision',
    phase: 'Context',
    tickets: ['CARBON-1095', 'CARBON-1097'],
  },
  {
    id: 'product',
    path: '/product-editor',
    label: 'Product Editor',
    phase: 'Phase 2',
    tickets: ['CARBON-1952', 'CARBON-2169'],
  },
  {
    id: 'pricing',
    path: '/pricing-table',
    label: 'Pricing Table',
    phase: 'Phase 3',
    tickets: ['CARBON-1097', 'CARBON-2348'],
  },
  {
    id: 'quote',
    path: '/quote',
    label: 'Sales Quote',
    phase: 'Phase 3',
    tickets: ['CARBON-1953'],
  },
  {
    id: 'project',
    path: '/project',
    label: 'Project',
    phase: 'Phase 3',
    tickets: ['CARBON-1954'],
  },
  {
    id: 'order',
    path: '/order',
    label: 'Order / Ticket',
    phase: 'Phase 4',
    tickets: ['CARBON-1955'],
  },
  {
    id: 'invoice',
    path: '/invoice',
    label: 'Invoice',
    phase: 'Phase 4',
    tickets: ['CARBON-1956', 'CARBON-1910'],
  },
  {
    id: 'gaps',
    path: '/gaps',
    label: 'Backlog Gaps',
    phase: 'Review',
    tickets: [],
  },
];
