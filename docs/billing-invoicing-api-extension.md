# Billing & Invoicing API Extension

## Purpose

Extend Command Cloud Billing & Invoicing API so **every invoice export includes full multi-currency monetary context from MVP** — not as a later add-on.

## Design principles

1. `monetaryContext` mandatory on invoice and line payloads
2. `taxJurisdiction` always present in `compliance` block
3. ERP handoff includes functional + transaction amounts and FX snapshot metadata
4. Legacy CS V3 fields only in `compliance.legacyTaxCode` — never required for processing

## Endpoints (proposed)

### GET /api/v1/invoices/{invoiceId}

Returns invoice with embedded `monetaryContext` per canonical spec.

### GET /api/v1/invoices/{invoiceId}/export

Returns ERP-ready payload conforming to `billing-invoice-export.schema.json`.

### POST /api/v1/invoices/{invoiceId}/e-invoice

Triggers e-invoicing PA submission; uses `compliance.taxJurisdiction` for format selection.

## Response schema

JSON Schema: [`schemas/billing-invoice-export.schema.json`](../schemas/billing-invoice-export.schema.json)

### Top-level fields

| Field | Required | Description |
|-------|----------|-------------|
| `invoiceId` | Yes | |
| `invoiceNumber` | Yes | |
| `invoiceDate` | Yes | ISO date |
| `monetaryContext` | Yes | Document-level MonetaryContext |
| `lines[].monetaryContext` | Yes | Line-level context (same locked rates) |
| `taxSummary` | Yes | net/tax/gross in transaction currency + functional |
| `compliance.taxJurisdiction` | Yes | Resolved jurisdiction |
| `erpHandoff` | Yes | Rate metadata for GL posting |

### ERP handoff block

```json
{
  "erpHandoff": {
    "functionalCurrency": "GBP",
    "transactionCurrency": "GBP",
    "exchangeRate": 1.1682,
    "exchangeRateDate": "2026-06-30",
    "exchangeRateSource": "ECB_DAILY",
    "accountingCategoryCode": "4000"
  }
}
```

When `transactionCurrency === functionalCurrency`, `exchangeRate` is `null`.

## OpenAPI extension

See [`openapi/billing-invoicing-extensions.yaml`](../openapi/billing-invoicing-extensions.yaml).

## Example export (NI → ROI)

See [`examples/billing-invoice-export-ni-roi.json`](../examples/billing-invoice-export-ni-roi.json).

## Versioning

- API version header: `X-Api-Version: 2026-06-30`
- Breaking changes to monetary schema require new API version
- Single-currency tenants receive same schema with null FX — clients must not branch on tenant type

## Related documents

- [Canonical monetary/tax field spec](./canonical-monetary-tax-field-spec.md)
- [Phase 1 corridor compliance](./phase1-corridor-compliance.md)
