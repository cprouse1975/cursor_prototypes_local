/**
 * Linear pricing calculation for sales UOM.
 *
 * Formula (CARBON-1097 example):
 *   extended = orderQty × (pricePerBasis / basisQty)
 *
 * Example: $1000 per 1000 blocks, order 150 → 150 × (1000/1000) = $150
 *
 * Flat commercial units (LOAD, PAL) use basisQty = 1 (price is per one unit).
 */

export function unitRate(pricePerBasis, basisQty = 1) {
  const basis = Number(basisQty) || 1;
  const price = Number(pricePerBasis) || 0;
  return price / basis;
}

export function extendedPrice(orderQty, pricePerBasis, basisQty = 1) {
  const qty = Number(orderQty) || 0;
  return qty * unitRate(pricePerBasis, basisQty);
}

export function formatMoney(value, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

export function formatQty(value, digits = 2) {
  const n = Number(value);
  if (Number.isNaN(n)) return '—';
  return n.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
}

/**
 * Resolve a pricing-table row for product + sales UOM.
 * Blank UOM on a row = catch-all (matches any unit) with lowest specificity.
 * More matching variables win (UOM-specific beats catch-all).
 */
export function resolvePrice(rows, { productId, uomCode, customerId, locationId }) {
  const candidates = rows.filter((r) => r.productId === productId && r.active !== false);

  const scored = candidates
    .map((row) => {
      if (row.uomCode && row.uomCode !== uomCode) return null;
      if (row.customerId && row.customerId !== customerId) return null;
      if (row.locationId && row.locationId !== locationId) return null;

      let score = 0;
      if (row.uomCode) score += 8;
      if (row.customerId) score += 4;
      if (row.locationId) score += 2;
      return { row, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.row ?? null;
}

/**
 * When charge UOM differs from delivered UOM, soldQuantity carries the charge basis.
 * Billing prefers soldQuantity when present (CARBON-1910 / CARBON-1955–1956).
 */
export function chargeBasis(line) {
  if (line.soldQuantity?.value != null && line.soldQuantity?.uomCode) {
    return {
      quantity: line.soldQuantity.value,
      uomCode: line.soldQuantity.uomCode,
      source: 'soldQuantity',
      delivered: line.quantity,
    };
  }
  return {
    quantity: line.quantity?.value,
    uomCode: line.quantity?.uomCode,
    source: 'quantity',
    delivered: null,
  };
}
