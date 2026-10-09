# Concrete Class Requirements Review

## Context

Rod's requirements describe "Concrete Classes" as a customer-facing translation layer over the detailed mix design. A mix/product may use specific technical materials, but quotes, tickets, invoices, and customer-facing product information should expose the class that matters to the customer.

Examples:

- Admix class `AEA+WRA` may translate to batched technical admixtures such as `Sika190` and `AER1465`.
- Cement class `CIIIA` may translate to a cement combination such as 50% `CEMI` and 50% `GGBS`.
- Aggregate class `20MM` may translate to technical aggregate constituents such as `20mm Limestone` and `10mm Limestone`.

The product should therefore model both:

1. The technical materials used in the mix design.
2. The customer-visible classes that describe what the supplied concrete is.

This checkout does not currently contain product code or schema definitions for concrete classes, so this review records the missing domain classes and expected fields for implementation.

## Missing concrete class types

| Class type | What it classifies | Required fields / structure | Notes |
| --- | --- | --- | --- |
| Consistence | Slump or flow code, such as `S1` or `S3` | `workabilityType`, `nominalWorkability`, `baseUom` | `workabilityType` should distinguish slump (`01`) from flow (`02`). |
| Strength | Strength class | `strengthValue`, `strengthUom` | Represents customer-visible strength, such as `C30`. |
| Aggregate size | Nominal stone size | `size` | Store in millimetres. |
| Cement | Cement or cement-combination class | `baseMaterialClassId`, `terminalClass`, `combinedPerformanceCategory` | Should support blended classes such as `CIIIA`. |
| Coarse aggregate | Coarse aggregate class | `baseMaterialClassId`, `terminalClass`, `aggregateSizeClassId`, `maxStrength` | Links to aggregate size class and may restrict applicable strength. |
| Fine aggregate | Fine aggregate class | `baseMaterialClassId`, `terminalClass` | Customer-facing sand/fine aggregate classification. |
| Water | Water class | `baseMaterialClassId`, `terminalClass` | Uses shared material-class mapping fields. |
| Admix | Admixture class | `baseMaterialClassId`, `terminalClass` | Customer-visible admixture information, e.g. `WRA`, `AEA`, `AEA+WRA`, `SUPERPLASTICIZER`. |
| Chloride | Chloride limit class, such as `Cl 0.10` | Shared cement fields only | Needs confirmation whether "shared cement fields" means the exact same field set as cement or only common base/terminal fields. |
| Exposure | Exposure / DC class | `details[]` with cement class, aggregate size, minimum cement, maximum water/cement ratio | Details are constraints, not just labels. |
| Concrete type | Concrete type or group | Identity fields only | Classification/grouping class. |
| Design method | Design method 1 or 2 | `designMethodType` | Values are expected to be `01` or `02`. |
| Batch book type | Family of batch books a mix may use | Shared cement fields only | Needs confirmation of exact shared field set. |
| Mix | Commercial mix family, such as `C30`, `RC35`, or `1:1.5:3` | Mix class header fields plus Block 3 fields | Rod notes that Block 1 still stores the class header fields listed under Mix Class; Block 3 details are not included in the supplied requirement excerpt. |

## Proposed common model shape

All concrete class types should share a small identity/header shape so the product can treat them consistently:

- `id`
- `code`
- `description` or `displayName`
- `classType`
- `active`
- audit fields, if the product has a standard audit model

Class-specific fields should then be stored by type. This avoids overloading one generic table/object with nullable fields for every class type while preserving a consistent lookup and display model.

## Translation relationships to support

The product should be able to express these relationships:

- Product/mix -> customer-visible concrete classes.
- Product/mix -> technical material constituents.
- Customer-visible class -> one or more underlying material classes or terminal classes where needed.
- Exposure/DC class -> detail rows containing cement class, aggregate size, minimum cement content, and maximum water/cement ratio.
- Coarse aggregate class -> aggregate size class and maximum strength constraint.

The Admix class is specifically customer-facing. It should not be treated as a direct substitute for the technical admixtures in the batch formula.

## Initial Admix class examples

The requirements identify these common customer-visible admixture classes:

- `WRA`
- `AEA`
- `AEA+WRA`
- `SUPERPLASTICIZER`

These should be seedable/reference data values once the Admix class type exists.

## Open questions before implementation

1. What exact fields are included in the "Mix Class" header and "Block 3" for Mix classes?
2. For Chloride and Batch book type, does "Shared cement fields only" mean the full Cement field set including `combinedPerformanceCategory`, or only the shared `baseMaterialClassId` and `terminalClass` fields?
3. Are `workabilityType` and `designMethodType` controlled-code values that must be stored as strings (`01`, `02`) rather than integers?
4. Should `terminalClass` be a boolean, a linked class identifier, or a terminal classification code?
5. Is `baseMaterialClassId` expected to reference a shared material-class catalogue, a product material group, or a Command Series migration identifier?
6. Do customer documents require only class codes, or both codes and descriptions?
7. Which of these classes are plant/company specific versus globally shared reference data?

## Implementation checklist

- Add class type definitions for all missing concrete class types listed above.
- Add class-specific field definitions and validation rules.
- Add reference-data seeding for common Admix classes.
- Add relationships from mix/product records to customer-visible class records.
- Keep technical mix constituents separate from customer-visible class assignments.
- Add customer-document mapping so Quote, Ticket, and Invoice output shows concrete class information rather than raw technical material names.
- Add tests covering translation examples for Admix, Cement, and Aggregate size classes.
