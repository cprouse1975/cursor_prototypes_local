# Backlog coverage & gaps — Sales UOM / Dynamic Pricing

Review date: 2026-07-09  
Sources: CARBON-1095, CARBON-1097, child stories, Confluence proposal + CARBON-1910 spike.

---

## What the backlog already covers

### Epic CARBON-1095 — Multiple sales units of measure

| Ticket | Role |
| --- | --- |
| CARBON-1952 | Product Editor Sales Units tab |
| CARBON-2169 | Remove legacy `salesUomCode` from Product Profile UI |
| CARBON-2170 | Expose sales unit data on product selection APIs |
| CARBON-2171 | Migration hard gate before Phase 3 |
| CARBON-2247 | Ticket PDF guard for identity / null conversion entries |
| CARBON-1953 | Quote: select & price by sales UOM |
| CARBON-1954 | Project: preserve selected sales UOM |
| CARBON-1955 | Dispatch: preserve UOM; populate `soldQuantity` |
| CARBON-1956 | Billing: reprice / invoice on sales UOM |
| CARBON-1957 | Feature flag / SKU gate |
| CARBON-1910 | Downstream UOM + invoicing source spike (complete) |
| CARBON-1096 / 1915 / 2168 / 2298 | Spikes, design, tech debt, audit |

### Epic CARBON-1097 — Unit and bulk / cumulative pricing

| Ticket | Role |
| --- | --- |
| CARBON-1097 | Epic describing unit + bulk (per 1000) linear pricing across editor, pricing, quote, order, invoice |
| CARBON-2348 | Spike: UOM as pricing variable (in progress) — **only substantive child found** |

---

## Gaps vs the full capability we need

These are **not fully ticketed** (or are blocked without follow-on stories) relative to the journey in the prototype.

### 1. Pricing table implementation (High)

CARBON-2348 investigates architecture; there are **no build stories** yet for:

- UOM column on pricing table UI + Excel import
- `uomCode` on `calculate-product-prices` / list-matching APIs
- Discount rows × UOM behaviour
- Catch-all fallback rules when UOM-specific row is missing
- **`basisQty` / “price per N”** for linear bulk (the $1000 per 1000 model in CARBON-1097)

**Recommend:** After CARBON-2348, create a Phase 3 pricing epic slice with UI, API, import, and calc AC.

### 2. CARBON-1097 has almost no delivery stories (High)

The epic describes the hero calculation and system-wide application, but work is not broken into implementable stories beyond the spike. Risk: bulk/linear pricing stays aspirational while 1095 ships unit pickers that cannot price correctly.

**Recommend:** Split 1097 into: data model (`basisQty`), pricing admin UI, quote display, order/invoice calc parity, QA scenarios.

### 3. Customer- / contract-level default sales UOM (Medium)

Problem statements mention customers agreeing a unit, but the model only has **product-level** `isDefault`. No story for customer–product or project default sales UOM.

### 4. LOAD derivation rules (High)

CARBON-1955 / 1910 call out charge ≠ delivered, but **no design ticket** for:

- Deriving load count from weighed tonnes
- Partial loads
- Interaction with existing Minimum Load / Load Rates schedules
- Scale ticketing / background order path

### 5. Quote & project schema completeness (Medium)

1953/1954 exist, but still need explicit AC for:

- Cart section coverage (Aggregate, Block, Mortar, etc.)
- Jobs cart parity
- Quote PDF sales UOM
- Stopping project UI from displaying only `product.uomCode`

### 6. Billing presentation & enums (High)

1956 + 1910 recommend preferring `soldQuantity`. Still need stories for:

- Billable / invoice UI: delivered vs charged
- Lockstep UOM enum extension (unknown UOM → non-billable today)
- Tax base = charge amount confirmation
- Feature-flagged dual-read period with dispatch

### 7. Release packaging decision (High)

Diego flagged **Phase 2 without Phase 3 pricing support delivers limited value**. Needs a recorded decision (with Caroline / pricing) to ship 1095 Phase 2+3 together for HM/Roadstone, plus a cross-team dependency board (setup, pricing platform, quote, dispatch, billing).

### 8. “Pricing / sales only” framing (Low–Medium)

Intent is that multiple UOMs apply to pricing/sales, not necessarily to rewrite all production UOM behaviour. Product copy, training, and non-goals (especially RMC) should be explicit in Phase 3/4 stories.

---

## Suggested follow-on stories (backlog candidates)

1. **Pricing table: add UOM variable + basis quantity** (depends on CARBON-2348)
2. **Pricing API: accept `uomCode` and return matched row + unit rate**
3. **Quote line: show basis pricing breakdown** (`$1000 / 1000 → $1.00 ea`)
4. **Customer–product default sales UOM** (optional Phase 3.1)
5. **Dispatch: LOAD charge derivation rules** (stakeholder workshop → story)
6. **Billing ingress: prefer `soldQuantity` + delivered audit fields**
7. **E2E QA:** blocks linear bulk; aggregate STN; aggregate LOAD with weighed delivery
8. **ADR: Phase 2+3 release packaging for first SKUs**

---

## Prototype mapping

| Screen | Demonstrates |
| --- | --- |
| Vision | Value drivers + formula |
| Product Editor | CARBON-1952 Sales Units |
| Pricing Table | UOM variable + linear calc live preview |
| Quote | CARBON-1953 picker + extended price |
| Project | CARBON-1954 preservation + known overwrite gap |
| Order / Ticket | CARBON-1955 `soldQuantity` |
| Invoice | CARBON-1956 / 1910 charge basis |
| Backlog Gaps | This analysis in-product |
