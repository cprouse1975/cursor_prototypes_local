export const TICKET_MODES = {
  digital: {
    id: 'digital',
    label: 'Digital (Deliveries)',
    short: 'Digital',
    description: 'Driver receives ticket and EPOD on the TrackIt tablet. Default for connected operations.',
  },
  printed: {
    id: 'printed',
    label: 'Printed at batch plant',
    short: 'Printed',
    description: 'COMMANDbatch (or plant ticket printer) prints the delivery ticket at load-out; driver carries paper.',
  },
  hybrid: {
    id: 'hybrid',
    label: 'Hybrid — auto-fallback',
    short: 'Hybrid',
    description: 'Digital when healthy; automatically switch affected plants to print when connectivity checks fail.',
  },
};

export const PLANTS = [
  { id: 'p01', code: '01', name: 'North Valley Plant', region: 'Metro', override: 'inherit' },
  { id: 'p02', code: '02', name: 'River Batch Plant', region: 'Metro', override: 'inherit' },
  { id: 'p03', code: '03', name: 'East Yard', region: 'Regional', override: 'inherit' },
  { id: 'p04', code: '04', name: 'South Quarry Plant', region: 'Regional', override: 'printed' },
];

export const NAV = [
  { id: 'overview', phase: 'Research', label: 'Overview', path: '/' },
  { id: 'company', phase: 'Proposed config', label: 'Company default', path: '/company' },
  { id: 'plants', phase: 'Proposed config', label: 'Plant overrides', path: '/plants' },
  { id: 'batch', phase: 'Operations', label: 'Batch plant flow', path: '/batch' },
  { id: 'dispatch', phase: 'Operations', label: 'Dispatch view', path: '/dispatch' },
];

export const SAMPLE_TICKET = {
  number: 'T-482901',
  order: 'ORD-11822',
  customer: 'Summit Construction LLC',
  job: 'Harbor Tower — Phase 2',
  mix: '4000 PSI · 5" slump',
  qty: '10.0 CY',
  truck: 'Mixer 14',
  driver: 'J. Martinez',
  dest: '1200 Pier Ave, Bayview',
  plant: 'North Valley Plant',
};
