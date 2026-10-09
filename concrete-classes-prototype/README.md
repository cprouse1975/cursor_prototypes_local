# Concrete Classes Prototype

Interactive React prototype covering the **Concrete Classes** data model for Cloud Dispatch —
the customer-facing classification system that replaces Command Series V3.

## Background

A *Concrete Class* is a customer-facing label that describes a property of a concrete mix in
terms the customer cares about. The class is the translation layer between what the plant
batches and what appears on a Quote / Ticket / Invoice.

**Example:**
- Customer sees: `Admix Class: AEA+WRA`
- Plant batches: `Sika190 (WRA)` + `AER1465 (AEA)`

## Class Types Covered

| Type | Status | Key extra fields |
|------|--------|-----------------|
| Consistence | Existing | workabilityType, nominalWorkability, baseUom |
| Strength | Existing | strengthValue, strengthUom |
| Aggregate Size | Existing | size (mm) |
| Cement | **New** | baseMaterialClassId, terminalClass, combinedPerformanceCategory |
| Coarse Aggregate | **New** | baseMaterialClassId, terminalClass, aggregateSizeClassId, maxStrength |
| Fine Aggregate | **New** | baseMaterialClassId, terminalClass |
| Water | **New** | baseMaterialClassId, terminalClass |
| Admix | **New** | baseMaterialClassId, terminalClass |
| Chloride | **New** | Shared Cement fields |
| Exposure | **New** | details[]: cementClass, aggSize, minCement, maxW/C |
| Concrete Type | **New** | Identity only |
| Design Method | **New** | designMethodType (01 or 02) |
| Batch Book Type | **New** | Shared Cement fields |
| Mix | Existing | mixFamilyCode, concreteTypeClassId, designMethodClassId |

## Running

```bash
cd concrete-classes-prototype
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## Screens

- **Overview** — Translation model explained with examples
- **Class Library** — Full table of all 14 class types and their schemas
- **Admix Classes** — Interactive list/detail with customer↔plant translation; add new classes
- **Cement Classes** — Cement/combination classes with material mappings
- **Coarse & Fine Agg + Water** — Three related material class types, tabbed
- **Exposure & Chloride** — Exposure constraint details table; chloride limit classes
- **Design Method & Batch Book Type & Concrete Type** — Three supporting class types
- **Mix Class Builder** — Interactive: assign a class to every dimension and see the customer
  document vs plant batch materials side by side
