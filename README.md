# Command Cloud Cross-Border & Multi-Currency Scoping

Prototypes and specifications for International RMC cross-border transaction support in Command Cloud — cloud-first replacement for Command Series V3 on-prem configuration.

## Overview

This repository implements the **Cross-Border Transactions: CS V3 Evaluation & Cloud-First Scoping Plan**:

- **Simplify setup** — three admin surfaces (Tenant, Legal Entity, Customer) replace CS V3 company/tax code sprawl
- **Multi-currency from MVP** — explicit currency on every monetary record; FX fields null for EUR-only tenants
- **Progressive enhancement** — MVP → corridor compliance → multi-entity → advanced FX

## Reference corridors

| Corridor | Currencies | Primary complexity |
|----------|------------|-------------------|
| France → Germany | EUR | Intra-EU VAT, e-invoicing |
| NI/UK ↔ Republic of Ireland | GBP, EUR | FX + Windsor Framework VAT |

## Documentation

| Document | Description |
|----------|-------------|
| [docs/phase0-csv3-discovery.md](docs/phase0-csv3-discovery.md) | CS V3 evaluation, do-not-replicate list |
| [docs/csv3-import-mapping.md](docs/csv3-import-mapping.md) | Legacy field → Cloud canonical mapping |
| [docs/canonical-monetary-tax-field-spec.md](docs/canonical-monetary-tax-field-spec.md) | Canonical field contract |
| [docs/mvp-admin-setup-spec.md](docs/mvp-admin-setup-spec.md) | Simplified tenant/entity/customer admin |
| [docs/phase1-corridor-compliance.md](docs/phase1-corridor-compliance.md) | EU Continental & UK–Ireland Windsor packs |
| [docs/phase2-multi-entity-billing.md](docs/phase2-multi-entity-billing.md) | Multi-legal-entity billing |
| [docs/phase3-advanced-fx.md](docs/phase3-advanced-fx.md) | Contract rates, overrides, revaluation |
| [docs/billing-invoicing-api-extension.md](docs/billing-invoicing-api-extension.md) | Billing API multi-currency export |

## JSON Schemas

- [`schemas/monetary-context.schema.json`](schemas/monetary-context.schema.json)
- [`schemas/tax-jurisdiction.schema.json`](schemas/tax-jurisdiction.schema.json)
- [`schemas/tenant-monetary-config.schema.json`](schemas/tenant-monetary-config.schema.json)
- [`schemas/billing-invoice-export.schema.json`](schemas/billing-invoice-export.schema.json)

## Reference implementation

TypeScript services in [`src/services/`](src/services/):

- `monetary-resolver.ts` — auto-resolution at quote creation
- `tax-jurisdiction-service.ts` — corridor pack tax rules
- `fx-service.ts` — ECB daily rate snapshot (MVP)
- `currency-display.ts` — locale-aware formatting

## Examples

- [`examples/monetary-context-fr-de.json`](examples/monetary-context-fr-de.json)
- [`examples/monetary-context-ni-roi.json`](examples/monetary-context-ni-roi.json)
- [`examples/billing-invoice-export-ni-roi.json`](examples/billing-invoice-export-ni-roi.json)

## OpenAPI

- [`openapi/billing-invoicing-extensions.yaml`](openapi/billing-invoicing-extensions.yaml)

## Development

```bash
npm install
npm run typecheck
npm test
```

## Related prototype

EU regional gating pattern: [command-series-v3-hauler-license-expiry.md](https://github.com/cprouse1975/cursor_prototypes_local/blob/cursor/hauler-expiry-rules-e605/docs/command-series-v3-hauler-license-expiry.md) on branch `cursor/hauler-expiry-rules-e605`.
