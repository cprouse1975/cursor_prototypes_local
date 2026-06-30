# Canonical Monetary & Tax Field Specification

## Purpose

Define the cloud-native canonical field contract for cross-border and multi-currency operations in Command Cloud. This spec follows the hauler license pattern: canonical fields, API boundaries, validation rules, and explicit **do-not-replicate** guidance for CS V3 legacy codes.

## Scope

Applies to all quote-to-cash entities: Quote, Order, Ticket (line), Invoice (line), and master data (Tenant, Legal Entity, Customer).

## Design principles

1. **Multi-currency from MVP** — currency fields mandatory even when EUR/EUR (FX fields null).
2. **Infer, don't configure** — tax jurisdiction auto-resolved; legacy tax codes audit-only.
3. **Import fidelity** — preserve CS V3 amounts; do not preserve CS V3 configuration UX.

## Canonical fields

### MonetaryContext (transactional records)

Attached to every quote, order, ticket line, invoice line.

| Field | Type | Required | UI | Validation |
|-------|------|----------|-----|------------|
| `transactionCurrency` | ISO 4217 string | Yes | Yes | Must be in tenant `enabledCurrencies` |
| `functionalCurrency` | ISO 4217 string | Yes | Yes | From legal entity |
| `presentationCurrency` | ISO 4217 string | No | Yes | Optional; for cross-currency display |
| `amount` | `{ value, currency }` | Yes | Yes | `currency === transactionCurrency` |
| `functionalAmount` | `{ value, currency }` | Yes | Yes | `currency === functionalCurrency` |
| `presentationAmount` | `{ value, currency }` | No | Yes | When presentation currency set |
| `exchangeRate` | number | No | Yes | Required when txn ≠ presentation |
| `exchangeRateSource` | enum | No | Yes | `ECB_DAILY`, `BOE_DAILY`, `CONTRACT_FIXED`, `MANUAL_OVERRIDE` |
| `exchangeRateDate` | date | No | Yes | ISO `YYYY-MM-DD` |
| `exchangeRateLockedAt` | datetime | No | No | Set at quote acceptance |
| `legalEntityId` | string | Yes | Yes | Replaces Pricing Company Code |
| `dispatchLocationId` | string | Yes | Yes | Replaces Shipping Plant Code |
| `taxJurisdiction` | object | Yes | Yes (badge) | See TaxJurisdiction |

JSON Schema: [`schemas/monetary-context.schema.json`](../schemas/monetary-context.schema.json)

### TaxJurisdiction

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `sellerCountry` | string | Yes | FR, DE, GB, GB-NI, IE |
| `buyerCountry` | string | Yes | |
| `deliveryCountry` | string | Yes | |
| `dispatchOriginCountry` | string | No | When plant country ≠ seller |
| `supplyType` | enum | Yes | GOODS, SERVICES, MIXED |
| `vatTreatment` | enum | Yes | See enum in schema |
| `sellerVatPrefix` | string | No | XI for NI |
| `sellerVatId` | string | No | |
| `buyerVatId` | string | No | |
| `windsorFramework` | boolean | No | true for NI↔ROI goods |
| `corridorPack` | enum | No | EU_CONTINENTAL, UK_IRELAND_WINDSOR, UK_EXPORT |
| `resolvedBy` | const | Yes | `TAX_JURISDICTION_SERVICE` |
| `resolvedAt` | datetime | No | |
| `legacyTaxCode` | string | No | Import audit only — **hidden from UI** |

JSON Schema: [`schemas/tax-jurisdiction.schema.json`](../schemas/tax-jurisdiction.schema.json)

### TenantMonetaryConfig

| Field | Type | Required | Admin UI |
|-------|------|----------|----------|
| `operatingRegion` | enum | Yes | Tenant Admin |
| `enabledCurrencies` | string[] | Yes | Tenant Admin |
| `defaultFxSource` | enum | Yes | Tenant Admin |
| `defaultLocale` | string | Yes | Tenant Admin |
| `corridorPacks` | string[] | No | Tenant Admin (auto-suggest from region) |
| `isEuRegion` | boolean | No | Derived / override |
| `windsorFrameworkEligible` | boolean | No | true for UK-NI tenants |

JSON Schema: [`schemas/tenant-monetary-config.schema.json`](../schemas/tenant-monetary-config.schema.json)

### LegalEntityMonetaryConfig

| Field | Type | Required | Admin UI |
|-------|------|----------|----------|
| `legalEntityId` | string | Yes | Legal Entity Admin |
| `functionalCurrency` | ISO 4217 | Yes | Legal Entity Admin |
| `legalEntityCountry` | string | Yes | Legal Entity Admin |
| `vatRegistration` | object | Yes | Legal Entity Admin |
| `vatRegistration.prefix` | string | No | XI for GB-NI |
| `legacyCompanyCode` | string | No | **Hidden** — import only |
| `timezone` | string | No | Default `Europe/Dublin` for IE ops |

JSON Schema: [`schemas/legal-entity-monetary-config.schema.json`](../schemas/legal-entity-monetary-config.schema.json)

### CustomerMonetaryFields

| Field | Type | Required | Admin UI |
|-------|------|----------|----------|
| `preferredInvoiceCurrency` | ISO 4217 | No | Customer Admin |
| `vatRegistration` | object | No | Customer Admin — validated async |
| `billingCountry` | string | No | Customer Admin |

## Lifecycle rules

| Event | Monetary behaviour |
|-------|-------------------|
| Quote creation | Auto-resolve currencies and tax; no manual code pickers |
| Quote acceptance | Lock `exchangeRate` + `exchangeRateLockedAt` when currencies differ |
| Order creation | Copy locked context; re-resolve tax if delivery address changed |
| Ticketing | Amounts in `transactionCurrency` only |
| Invoice | Same locked context; emit e-invoice from `taxJurisdiction` |

## API format

- All monetary values at API boundary use **major units** (decimal).
- All dates: ISO 8601 (`YYYY-MM-DD` or full datetime).
- Currency codes: ISO 4217 uppercase.

## Examples

See [`examples/monetary-context-fr-de.json`](../examples/monetary-context-fr-de.json) and [`examples/monetary-context-ni-roi.json`](../examples/monetary-context-ni-roi.json).

## CS V3 fields — explicit exclusions from Cloud UI

| Legacy field | Cloud handling |
|--------------|----------------|
| Pricing Company Code | `legalEntityId` — import map only |
| Shipping Company Code | Derived — import map only |
| Pricing / Shipping Plant Code | `locationId` / `dispatchLocationId` |
| Tax Code | `legacyTaxCode` + auto `taxJurisdiction` |
| Accounting Category Code | ERP export mapping only |

## Related documents

- [CS V3 import mapping](./csv3-import-mapping.md)
- [MVP admin setup spec](./mvp-admin-setup-spec.md)
- [Billing & Invoicing API extension](./billing-invoicing-api-extension.md)
