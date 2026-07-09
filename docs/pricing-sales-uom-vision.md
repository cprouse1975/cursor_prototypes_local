# Sales Units of Measure & Dynamic Pricing — Vision

**Prototype:** `pricing-uom-prototype/`  
**Primary epics:** [CARBON-1095](https://command-alkon.atlassian.net/browse/CARBON-1095), [CARBON-1097](https://command-alkon.atlassian.net/browse/CARBON-1097)  
**Design reference:** [Multiple Sales Units of Measure Implementation Proposal](https://command-alkon.atlassian.net/wiki/spaces/CXV4/pages/972619779)  
**Downstream spike:** [CARBON-1910 Downstream UOM Usage and Invoicing Source](https://command-alkon.atlassian.net/wiki/spaces/CXV4/pages/940113945)

---

## Vision

Enable Command Cloud customers to **configure multiple pricing / sales units of measure on a product**, set independent rates in the existing **Dynamic Pricing** screens, and carry that commercial unit through **quote → project → order/ticket → invoice** — including linear bulk math (e.g. $1000 per 1000 → 150 units = $150) and flat commercial units (e.g. per load alongside per tonne).

Sales UOM is a **commercial dimension**. Production / weighbridge quantity may remain in the product base unit. When charge unit ≠ delivered unit, tickets populate `soldQuantity` and billing prefers it.

---

## Key value drivers

| Driver | Outcome |
| --- | --- |
| **Commercial fidelity** | Quote and invoice in the unit the customer agreed (tonne, load, each, per 1000) without duplicate product masters. |
| **Linear, auditable math** | One formula: `extended = qty × (pricePerBasis ÷ basisQty)`. Transparent on quote, ticket, and invoice. |
| **Single pricing source of truth** | Allowed units on the product; **prices only in the pricing table** (confirmed by pricing team). |
| **Dual commercial models** | Commodity linear rates **and** flat commercial units (load/pallet) on the same product. |
| **Ops / finance separation** | Delivered quantity for operations; charge quantity for AR — without breaking scale ticketing. |
| **Faster UK/EU & block readiness** | Unblocks HM / Roadstone / block-brick-tile journeys that cannot run on a single forced UOM. |

---

## Target user journey

```
Product Editor (Sales Units)
    → Dynamic Pricing table (UOM + optional basisQty)
        → Sales Quote (pick sales UOM, live extended price)
            → Project cart (preserve sales UOM + rate)
                → Dispatch order / ticket
                   (production qty + soldQuantity when charge differs)
                    → Billing / invoice (prefer soldQuantity)
```

### Calculation contract

```
unitRate      = pricePerBasis / basisQty
extendedPrice = orderQty × unitRate
```

Examples in the prototype:

- Blocks: `$1000 / 1000`, qty `150` → `$150`
- HM customer blocks: `$920 / 1000`, qty `150` → `$138`
- Aggregate: `$32 / STN`, qty `60` → `$1920`
- Aggregate: `$500 / LOAD`, qty `3` → `$1500`

---

## Design principles (aligned to backlog decisions)

1. **Extend `uomConversions[]` with `isDefault`** — no separate array; no `unitPrice` on product.
2. **Conversion factor optional** — blank for flat commercial units; those units require a dedicated pricing row.
3. **UOM as a pricing variable** (proposed in CARBON-2348) — blank UOM row remains catch-all.
4. **`salesUomCode` deprecated in UI only** — remains in API responses.
5. **Invoicing reads the ticket** — not the quote; `soldQuantity` is the charge bridge.

---

## How to run the prototype

```bash
cd pricing-uom-prototype
npm install
npm run dev
```

Verification of calculation helpers:

```bash
npm run verify
```
