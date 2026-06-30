# MVP Admin Setup Specification

## Purpose

Replace CS V3 disjointed company code / tax code / plant code configuration with **three simplified admin surfaces** for Command Cloud cross-border and multi-currency setup.

## Admin surfaces

### 1. Tenant Admin (one-time)

**Path:** Settings → Tenant → Monetary & Regional

| Field | Control | Default | Validation |
|-------|---------|---------|------------|
| Operating region | Select | From provisioning | EU, UK, UK-NI, NA, APAC, OTHER |
| Enabled currencies | Multi-select | `[functional of primary entity]` | Min 1; ISO 4217 |
| Default FX source | Select | `ECB_DAILY` | ECB_DAILY, BOE_DAILY, ERP_FEED, NONE |
| Default locale | Select | From region | BCP 47 |
| Corridor packs | Multi-select (auto-suggested) | From region | EU_CONTINENTAL, UK_IRELAND_WINDSOR, UK_EXPORT |

**Auto-suggest rules:**

| operatingRegion | Suggested corridorPacks | Suggested currencies |
|-----------------|-------------------------|----------------------|
| EU | EU_CONTINENTAL | EUR |
| UK-NI | UK_IRELAND_WINDSOR, UK_EXPORT | GBP, EUR |
| UK | UK_EXPORT | GBP |

**Not configurable at tenant level (inferred per transaction):**

- Tax codes, pricing company codes, shipping company codes
- Per-customer FX rates (Phase 3: contract-fixed override)

### 2. Legal Entity Admin

**Path:** Company Admin → Legal Entities → {entity}

| Field | Control | Required |
|-------|---------|----------|
| Entity name | Text | Yes |
| Functional currency | Select (from tenant enabled) | Yes |
| Legal entity country | Select (GB, GB-NI, IE, FR, DE, …) | Yes |
| VAT registration number | Text | Yes for B2B invoicing |
| VAT prefix | Text (XI for GB-NI) | When country = GB-NI |
| Timezone | Select | Default Europe/Dublin for IE/NI |

**Hidden after migration:** Legacy company code (viewable in import audit log only)

### 3. Customer Admin

**Path:** Customers → {customer} → Billing

| Field | Control | Required |
|-------|---------|----------|
| Preferred invoice currency | Select (from tenant enabled) | No |
| VAT registration | Text + country | For B2B |
| Billing country | Select | Recommended |

**Async on save:** VIES (EU) / HMRC (GB/NI) validation with non-blocking warning if unavailable.

## Auto-resolution at quote creation

When user creates a quote (customer + delivery address + products):

1. Resolve `legalEntityId` from user context + dispatch location
2. Set `functionalCurrency` from legal entity
3. Set `transactionCurrency` = customer `preferredInvoiceCurrency` ?? `functionalCurrency`
4. If presentation needed (customer currency ≠ functional): fetch FX rate, compute `presentationAmount`
5. Call Tax Jurisdiction Service → populate `taxJurisdiction` and UI badge
6. **Do not show** Pricing Company Code, Tax Code, or currency override unless user has finance override role

## Single-currency tenant (FR/DE EUR)

Admin configures:

```json
{
  "operatingRegion": "EU",
  "enabledCurrencies": ["EUR"],
  "defaultFxSource": "NONE",
  "defaultLocale": "fr-FR",
  "corridorPacks": ["EU_CONTINENTAL"]
}
```

User experience: identical to today — one amount, no FX UI noise. Schema still stores full MonetaryContext with null FX fields.

## Multi-currency tenant (NI/ROI)

Admin configures:

```json
{
  "operatingRegion": "UK-NI",
  "enabledCurrencies": ["GBP", "EUR"],
  "defaultFxSource": "ECB_DAILY",
  "defaultLocale": "en-IE",
  "corridorPacks": ["UK_IRELAND_WINDSOR", "UK_EXPORT"],
  "windsorFrameworkEligible": true
}
```

NI legal entity: `functionalCurrency: GBP`, `legalEntityCountry: GB-NI`, VAT prefix XI.

User experience: quote to ROI customer shows GBP primary + EUR presentation with rate footnote.

## Reference implementation

TypeScript services in [`src/services/`](../src/services/):

- `monetary-resolver.ts` — quote creation auto-resolution
- `tax-jurisdiction-service.ts` — corridor pack rules
- `fx-service.ts` — rate fetch and snapshot
- `currency-display.ts` — Intl.NumberFormat helpers

## JSON Schema

- [`schemas/tenant-monetary-config.schema.json`](../schemas/tenant-monetary-config.schema.json)
- [`schemas/legal-entity-monetary-config.schema.json`](../schemas/legal-entity-monetary-config.schema.json)
- [`schemas/monetary-context.schema.json`](../schemas/monetary-context.schema.json)

## Related documents

- [Canonical monetary/tax field spec](./canonical-monetary-tax-field-spec.md)
- [Phase 0 discovery](./phase0-csv3-discovery.md)
