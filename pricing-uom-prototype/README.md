# Pricing Sales UOM Prototype

Interactive prototype for **multiple sales units of measure** and **linear / per-unit dynamic pricing** across Product Editor → Pricing Table → Quote → Project → Order/Ticket → Invoice.

## Run

```bash
npm install
npm run dev
```

## Verify calculations

```bash
npm run verify
```

Confirms the hero case: `$1000 per 1000` × `150` blocks = `$150`, plus per-load / per-tonne and pricing-row resolution.

## Docs

- `../docs/pricing-sales-uom-vision.md` — vision & value drivers
- `../docs/pricing-sales-uom-backlog-gaps.md` — Jira/Confluence coverage vs gaps

## Related backlog

- [CARBON-1095](https://command-alkon.atlassian.net/browse/CARBON-1095) Multiple sales UOM
- [CARBON-1097](https://command-alkon.atlassian.net/browse/CARBON-1097) Unit & bulk pricing
- [CARBON-2348](https://command-alkon.atlassian.net/browse/CARBON-2348) UOM as pricing variable spike
