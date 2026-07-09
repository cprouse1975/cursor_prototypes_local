import { extendedPrice, resolvePrice, chargeBasis, unitRate } from '../src/lib/pricing.js';
import { PRICING_ROWS } from '../src/data/demoData.js';

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

// Hero example: $1000 per 1000, order 150 → $150
assert(extendedPrice(150, 1000, 1000) === 150, '150 blocks @ $1000/1000 should be $150');
assert(unitRate(1000, 1000) === 1, 'unit rate should be $1');

// Per load flat
assert(extendedPrice(3, 500, 1) === 1500, '3 loads @ $500 should be $1500');

// Per tonne
assert(extendedPrice(60, 32, 1) === 1920, '60 STN @ $32 should be $1920');

// UOM-specific beats catch-all
const loadRow = resolvePrice(PRICING_ROWS, {
  productId: 'AGG_20MM',
  uomCode: 'LOAD',
  customerId: 'CUST_RS',
  locationId: 'LOC_CORK',
});
assert(loadRow?.uomCode === 'LOAD', 'should match LOAD row');
assert(loadRow?.price === 500, 'LOAD price should be 500');

const hmBlocks = resolvePrice(PRICING_ROWS, {
  productId: 'BLOCK_STD',
  uomCode: 'TH',
  customerId: 'CUST_HM',
  locationId: 'LOC_DUB',
});
assert(hmBlocks?.price === 920, 'HM customer should get $920/1000');
assert(extendedPrice(150, hmBlocks.price, hmBlocks.basisQty) === 138, 'HM 150 blocks = $138');

// Billing prefers soldQuantity
const charge = chargeBasis({
  quantity: { value: 60, uomCode: 'STN' },
  soldQuantity: { value: 3, uomCode: 'LOAD' },
});
assert(charge.source === 'soldQuantity', 'should prefer soldQuantity');
assert(charge.quantity === 3 && charge.uomCode === 'LOAD', 'charge basis LOAD');

console.log('All pricing calculation checks passed.');
