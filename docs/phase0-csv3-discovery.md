# Phase 0: Command Series V3 Cross-Border Discovery

## Purpose

Document CS V3 cross-border and currency behaviour (inferred from public docs, legacy user guides, and International RMC context), identify **workarounds to eliminate** in Command Cloud, and define what to **preserve on import** vs **not replicate in Cloud UI**.

## Evidence sources

| Source | Status | Notes |
|--------|--------|-------|
| CS V3 application source | Not available in this repo | Schema validation requires CS V3 repo or SME walkthrough |
| COMMANDexecutive user guide | Reviewed | Pricing Company Code, Shipping Company Code, Tax Code hierarchy |
| Customer training PDFs (Northstone) | Reviewed | Order entry, tax code inheritance, plant codes |
| Hauler license spec (prototype branch) | Available | EU regional gating pattern for Ireland |
| Atlassian Confluence/Jira | Not accessed | Authenticate MCP for internal specs |

## CS V3 inferred model (quote → order → invoice)

Monetary values flow through a **company/plant/customer hierarchy**. Currency is **implicit** per company code — not stored on individual quotes, orders, or invoices.

| Stage | Currency rule (inferred) | Cross-border driver |
|-------|--------------------------|---------------------|
| Quote | Price list from Pricing Company Code + Pricing Plant Code | Tax Code on customer; delivery address for zone/freight |
| Order | Inherits quote; Shipping Plant may differ from Pricing Plant | Same Tax Code |
| Ticket | Amounts in implicit company currency | No conversion |
| Invoice | Posted net/gross per Tax Code | ERP export for GL |

### Key CS V3 fields (legacy)

| Field | Role | Cloud disposition |
|-------|------|-------------------|
| Pricing Company Code | Legal entity price list | **Import only** → `legalEntityId` |
| Shipping Company Code | Dispatch entity | **Import only** → derived from `dispatchLocationId` |
| Pricing Plant Code | Plant-level pricing | **Import only** → `locationId` |
| Shipping Plant Code | Dispatch origin | **Import only** → `dispatchLocationId` |
| Tax Code | VAT treatment | **Import audit reference** → `taxJurisdiction` auto-resolved |
| Accounting Category Code | GL mapping | ERP mapping on export |
| Zone Code | Freight/tax hint | Input to tax jurisdiction service |

## Corridor findings

### France → Germany (EUR)

- Both sides use EUR — complexity is **tax jurisdiction and e-invoicing**, not FX.
- Cross-border B2B typically zero VAT with reverse charge when both VAT-registered.
- Users see EUR throughout; distinction via tax code description and invoice legal text.
- Likely **no currency selector** in CS V3 UI.

**SME validation questions (FR↔DE):**

1. How are Tax Codes maintained for DE delivery addresses — per customer or per zone?
2. Are Pricing Company and Shipping Company codes ever different at border plants?
3. How does ERP receive intra-EU supply data (EC Sales List equivalent)?

### Northern Ireland / UK ↔ Republic of Ireland (GBP/EUR)

- **Two currencies** — highest-priority corridor for Command Cloud multi-currency MVP.
- Windsor Framework: goods NI↔ROI treated as intra-EU for VAT; services use UK rules.
- NI businesses use **XI-prefixed VAT number** on EU-facing documents.
- GB mainland ↔ ROI is **export/import** — must not conflate with NI↔ROI.

**Likely CS V3 workarounds (to eliminate in Cloud):**

| Workaround | Evidence | Cloud replacement |
|------------|----------|-------------------|
| Dual price lists (GBP + EUR) | Inferred gap when NI quotes ROI in EUR | Single price list + Platform FX presentation |
| Manual spreadsheet FX | No platform rate snapshot | FX snapshot at quote acceptance |
| Separate Company Codes per jurisdiction | Inferred for NI vs ROI vs GB | Legal Entity model with `functionalCurrency` |
| Tax Code per cross-border scenario | Manual admin maintenance | Tax Jurisdiction Service |

**SME validation questions (NI/ROI):**

1. Are XI VAT numbers stored distinctly from GB numbers?
2. How much admin time per month maintaining tax codes and company code permutations?
3. FX rate source today — manual table, ERP, or none?
4. EC Sales List / intra-EU acquisition export path to Sage/SAP/Xero?

## Do not replicate list (Cloud UX)

These CS V3 concepts must **not** appear in Command Cloud user-facing UI:

- Pricing Company Code / Shipping Company Code pickers
- Manual Tax Code selection on quote/order (except finance override audit trail)
- Implicit currency (amounts without `transactionCurrency`)
- Dual price lists per currency
- Per-site configuration duplicated across Citrix installs

## Preserve on import list

Per hauler spec import fidelity pattern:

- Historical monetary amounts exactly as stored
- Legacy tax codes as `legacyTaxCode` audit reference
- Company/plant/customer hierarchy as import source metadata
- Customer contract invoice currency preference
- Import batch ID, source system, changed-at audit fields

## Configurations: workaround vs intentional

| Configuration | Likely type | Action |
|---------------|-------------|--------|
| Dual price list GBP/EUR | Workaround | Eliminate; use FX presentation |
| Tax Code "Intra-EU Supply" | Intentional rule | Map to corridor pack rule; auto-resolve |
| Different Pricing vs Shipping plant at border | Intentional | Preserve via Location + Legal Entity model |
| Manual FX rate table | Workaround | Eliminate; Platform FX Service |
| Separate company code per NI/ROI entity | Intentional | Map to Legal Entity with country + currency |

## Phase 0 deliverables checklist

- [x] Document inferred CS V3 model and corridor differences
- [x] Produce do-not-replicate and preserve-on-import lists
- [x] Define SME validation questions for FR↔DE and NI/ROI
- [ ] Execute SME walkthroughs (requires customer access)
- [ ] Validate against CS V3 schema when repo available
- [ ] Search Confluence/Jira when Atlassian MCP authenticated

## Related documents

- [CS V3 import mapping](./csv3-import-mapping.md)
- [Canonical monetary/tax field spec](./canonical-monetary-tax-field-spec.md)
- [MVP admin setup spec](./mvp-admin-setup-spec.md)
