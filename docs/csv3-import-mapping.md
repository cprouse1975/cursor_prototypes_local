# CS V3 → Command Cloud Import Mapping

## Purpose

Map legacy Command Series V3 fields to Command Cloud canonical monetary/tax model. Legacy fields are stored for audit and migration traceability but **must not appear in Cloud UI** after migration.

## Import rules (mandatory)

1. Preserve source monetary values exactly — no silent currency conversion.
2. Preserve source tax codes as `legacyTaxCode` — Cloud resolves `taxJurisdiction` afresh from addresses post-migration.
3. Reject/flag malformed VAT IDs and dates for correction in import logs — no silent coercion.
4. Persist audit metadata: `importSource`, `importBatchId`, `importedAt`, `legacyRecordId`.

## Field mapping

| CS V3 field | Cloud canonical field | UI visible | Notes |
|-------------|----------------------|------------|-------|
| Company Code | `legalEntity.legacyCompanyCode` | No | Map to Legal Entity record |
| Pricing Company Code | `legalEntityId` (pricing) | No | Resolved from company code lookup table |
| Shipping Company Code | `dispatchLegalEntityId` | No | Often same as pricing; derive when equal |
| Pricing Plant Code | `locationId` | No | Map to Location |
| Shipping Plant Code | `dispatchLocationId` | No | Map to Location |
| Tax Code | `legacyTaxCode` | No | Audit only; `taxJurisdiction` auto-resolved |
| Tax Code Description | `legacyTaxCodeDescription` | No | Audit only |
| Accounting Category Code | `erpMapping.accountingCategoryCode` | No | ERP export only |
| Zone Code | `deliveryZoneCode` | No | Input to tax/freight resolution |
| Customer Code | `customerId` | Yes | Standard customer reference |
| Quote Code | `quoteId` / `legacyQuoteCode` | Yes | |
| (implicit company currency) | `functionalCurrency` | Yes | Must be explicit on Legal Entity |
| (none) | `transactionCurrency` | Yes | From customer preference or functional currency |
| (none) | `taxJurisdiction` | Yes | Auto-resolved post-import for new transactions |
| (manual FX spreadsheet) | `exchangeRate`, `exchangeRateSource` | Yes | Only if source provides; else null |

## VAT registration mapping

| CS V3 pattern | Cloud field | Example |
|---------------|-------------|---------|
| Customer VAT field | `customer.vatRegistration` | `{ country: "DE", number: "123456789" }` |
| NI XI prefix (if stored) | `legalEntity.vatRegistration.prefix` | `"XI"` |
| Country from address | `vatRegistration.country` | ISO 3166-1 alpha-2 or `GB-NI` |

## Corridor-specific import notes

### FR ↔ DE

- Default both sides to `functionalCurrency: EUR` if not explicit in source.
- Flag records where Tax Code suggests cross-border but delivery country is domestic.

### NI ↔ ROI

- Map NI entities to `legalEntityCountry: GB-NI` when company code indicates Northern Ireland.
- Preserve GBP/EUR amounts separately if source stores both; never merge without audit log.
- Flag missing XI prefix on NI entities trading with IE customers.

## Unmappable record handling

| Condition | Action |
|-----------|--------|
| Unknown company code | Import record; flag `REQUIRES_ADMIN_MAPPING` |
| Unknown tax code | Import with `legacyTaxCode`; flag for corridor pack review |
| Currency mismatch (amount vs company) | Import amounts as-is; flag `CURRENCY_AUDIT_REQUIRED` |
| Malformed VAT ID | Reject row; log in import error report |

## Example import payload (Cloud ingestion)

```json
{
  "importBatchId": "batch-2026-06-30-001",
  "importSource": "COMMAND_SERIES_V3",
  "record": {
    "legacyCompanyCode": "801",
    "legacyPricingCompanyCode": "801",
    "legacyShippingPlantCode": "801",
    "legacyTaxCode": "IE-INTRA-EU",
    "legacyTaxCodeDescription": "Intra-EU B2B Zero Rated",
    "customerId": "C12345",
    "amount": { "value": 795.00, "currency": "GBP" },
    "functionalCurrency": "GBP",
    "transactionCurrency": "GBP"
  },
  "audit": {
    "importedAt": "2026-06-30T12:00:00Z",
    "requiresAdminReview": false
  }
}
```

## Related documents

- [Phase 0 discovery](./phase0-csv3-discovery.md)
- [Canonical monetary/tax field spec](./canonical-monetary-tax-field-spec.md)
