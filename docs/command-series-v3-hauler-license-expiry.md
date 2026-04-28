# Command Series V3 compatibility: Hauler / Carrier license details

## Purpose

Define how Command Cloud must represent and enforce Hauler/Carrier waste license details for EU operations so imports from Command Series V3 remain valid, the new license number is stored via API/UI integration, and dispatch cannot ticket expired haulers where this compliance rule applies.

## Regional scope (EU only)

This requirement is enabled only for EU region operations.

- Region gate (recommended): `isEuRegion = true` at tenant/company/operating-region level.
- When `isEuRegion = true`:
  - Show `Waste Carrier License Number` and `License Expiration Date` in Hauler details UI.
  - Enforce expiry validation during dispatch ticketing.
- When `isEuRegion = false`:
  - Hide this field from standard UI flows.
  - Do not block dispatch/ticketing based on this field.
  - Keep API/import compatibility by allowing the field to exist in payloads without enforcing it.

## Source system definition (Command Series V3)

- Entity: Hauler (Carrier)
- Existing field: License Expiration Date (stored in Hauler details)
- New Cloud field in this story: Waste Carrier License Number
- Business meaning: Hauler license must be active to legally haul goods in Ireland.
- Renewal pattern: Typically renewed every 5 years.

## Canonical field contract in Command Cloud

Use the following canonical fields:

1. `wasteCarrierLicenseNumber`
   - UI label: `Waste Carrier License Number`
   - Type: String
   - Format: alphanumeric only
   - Validation regex: `^[A-Za-z0-9]+$`
   - Required: No (optional, non-blocking when blank)
   - Normalization: trim leading/trailing spaces before validation/storage

2. `licenseExpiryDate`
   - UI label: `License Expiration Date`
   - Type: Date (no time component)
   - Format at API/integration boundary: ISO-8601 date string `YYYY-MM-DD`
   - Required: No (optional, non-blocking when blank)
   - Timezone interpretation for EU enforcement: Ireland local calendar date (`Europe/Dublin`) for all compliance checks.

## API endpoint requirements (new)

Create a dedicated endpoint to persist/retrieve waste license details:

- `GET /api/v1/hauliers/{haulierId}/waste-carrier-license`
  - Returns stored `wasteCarrierLicenseNumber` and `licenseExpiryDate`.

- `PUT /api/v1/hauliers/{haulierId}/waste-carrier-license`
  - Upserts license details entered in UI.
  - Request body:
    ```json
    {
      "wasteCarrierLicenseNumber": "WC12345AB",
      "licenseExpiryDate": "2030-04-26"
    }
    ```
  - Validation:
    - `wasteCarrierLicenseNumber` must be alphanumeric when provided.
    - `licenseExpiryDate` must be valid `YYYY-MM-DD` when provided.
    - Either/both fields may be null or blank.
  - Response returns the stored values after normalization.

### UI/API integration flow

1. Haulier details screen loads:
   - If `isEuRegion = true`, call `GET /api/v1/hauliers/{haulierId}/waste-carrier-license`.
   - Bind returned values to the two EU-only fields.

2. User saves haulier license details:
   - Send current field values to `PUT /api/v1/hauliers/{haulierId}/waste-carrier-license`.
   - Persist both fields exactly as validated/normalized.

3. Dispatch ticketing validation:
   - Uses persisted `licenseExpiryDate` only.
   - `wasteCarrierLicenseNumber` is stored/auditable but does not block ticketing when blank.

## Import and synchronization rules

1. **Source of truth for imported records**
   - If Series V3 provides a license expiry date, Cloud stores that exact date.
   - Do **not** recalculate by adding 5 years on import when explicit source date is present.
   - This storage behavior is region-agnostic to preserve import compatibility.

2. **Missing/blank values from source**
   - Keep record importable.
   - Store `licenseExpiryDate` as null/blank when source is blank.
   - Store `wasteCarrierLicenseNumber` as null/blank when source is blank.
   - In EU region, blank is allowed and does not block ticketing.

3. **Invalid format from source**
   - Reject/flag malformed `licenseExpiryDate` or non-alphanumeric `wasteCarrierLicenseNumber` for correction in import logs.
   - Do not silently coerce malformed values.

4. **Updates**
   - Latest non-null imported value replaces prior value.
   - Optionally persist audit metadata (source, import batch ID, changed-at) to support compliance tracing.

## Ticketing enforcement rule (EU only)

Dispatch must be blocked from ticketing when the selected Hauler/Carrier is not compliant **and** `isEuRegion = true`.

### Compliance evaluation

Given:
- `expiryDate = licenseExpiryDate` (date only)
- `dispatchDate = ticket timestamp converted to Europe/Dublin, then date-only`
- `isEuRegion` region gate

Status:
- `not_applicable` if `isEuRegion = false`
- `not_set` if `expiryDate` is null
- `expired` if `expiryDate < dispatchDate`
- `active` if `expiryDate >= dispatchDate`

### Dispatch behavior

- If status is `not_applicable` or `not_set`, allow ticket creation/edit.
- If `isEuRegion = true`, block only when status is `expired`.
- Show a clear validation message, for example:
  - `Hauler license expired on 2024-11-30. Ticketing is not permitted.`

### Boundary condition

If `expiryDate` equals `dispatchDate`, the hauler is valid for that day (expires at end of local day).

## UI behavior for Cloud entry field

- Labels:
  - `Waste Carrier License Number`
  - `License Expiration Date`
- Show only when `isEuRegion = true`.
- Both fields are optional (not mandatory/default-required) in EU.
- `Waste Carrier License Number` accepts alphanumeric characters only.
- Display warning states:
  - Expired
  - Expiring soon (optional threshold e.g., 30/60/90 days)
  - Not set (informational only; non-blocking)
- In EU, prevent selecting expired haulers in dispatch UI (disable or filter), and also enforce server-side validation.
- Outside EU, this field can remain hidden and non-blocking.

## Suggested API payload example

```json
{
  "haulerId": "H12345",
  "name": "Example Carrier Ltd",
  "wasteCarrierLicenseNumber": "WC12345AB",
  "licenseExpiryDate": "2030-04-26"
}
```

## Test scenarios (minimum)

1. EU details screen shows both fields; non-EU hides both fields.
2. Save with alphanumeric `wasteCarrierLicenseNumber` and valid date -> both values persist.
3. Save with blank `wasteCarrierLicenseNumber` -> allowed and persisted as blank/null.
4. Save with non-alphanumeric `wasteCarrierLicenseNumber` -> validation error returned.
5. Import with valid date/number -> values stored exactly.
6. Import with blank date/number -> record imported; in EU ticketing allowed.
7. EU ticket on date before expiry -> allowed.
8. EU ticket on exact expiry date -> allowed.
9. EU ticket day after expiry -> blocked.
10. Ticket with malformed imported date or non-alphanumeric number -> import error logged; invalid value not set/updated until corrected.
11. In EU, UI blocks expired at selection time; API blocks even if UI is bypassed.
12. Outside EU, fields hidden in UI and ticketing not blocked by license expiry.

## Gherkin acceptance criteria

```gherkin
Feature: Haulier/Carrier waste license details handling in Command Cloud
  As a dispatcher or master-data user
  I want waste carrier license number and expiry behavior to match EU requirements
  So that data is captured correctly and dispatch is blocked only when required

  Background:
    Given a tenant has a configured operating region
    And the haulier record supports "Waste Carrier License Number" and "License Expiration Date"

  Scenario: Show waste license fields in EU region
    Given the tenant is configured as EU region
    When a user opens Haulier/Carrier details
    Then the "Waste Carrier License Number" field is visible
    And the "License Expiration Date" field is visible
    And both fields are optional

  Scenario: Hide waste license fields outside EU region
    Given the tenant is configured as non-EU region
    When a user opens Haulier/Carrier details
    Then the "Waste Carrier License Number" field is not shown in standard UI flows
    And the "License Expiration Date" field is not shown in standard UI flows

  Scenario: Save alphanumeric waste carrier license number
    Given the tenant is configured as EU region
    And a user enters "WC12345AB" into "Waste Carrier License Number"
    When the user saves Haulier/Carrier details
    Then the save is successful
    And the API stores wasteCarrierLicenseNumber as "WC12345AB"

  Scenario: Reject non-alphanumeric waste carrier license number
    Given the tenant is configured as EU region
    And a user enters "WC-12345" into "Waste Carrier License Number"
    When the user saves Haulier/Carrier details
    Then the save is blocked
    And the validation message indicates alphanumeric characters only

  Scenario: EU dispatch allowed when license expiry is blank
    Given the tenant is configured as EU region
    And a haulier has no "License Expiration Date" set
    When dispatch creates a ticket for that haulier
    Then ticket creation is allowed
    And no expiry validation error is returned

  Scenario: EU dispatch allowed when license has not expired
    Given the tenant is configured as EU region
    And a haulier has "License Expiration Date" set to "2030-04-26"
    And the dispatch local date in Europe/Dublin is "2030-04-20"
    When dispatch creates a ticket for that haulier
    Then ticket creation is allowed

  Scenario: EU dispatch allowed on exact expiry date
    Given the tenant is configured as EU region
    And a haulier has "License Expiration Date" set to "2030-04-26"
    And the dispatch local date in Europe/Dublin is "2030-04-26"
    When dispatch creates a ticket for that haulier
    Then ticket creation is allowed

  Scenario: EU dispatch blocked when license is expired
    Given the tenant is configured as EU region
    And a haulier has "License Expiration Date" set to "2030-04-26"
    And the dispatch local date in Europe/Dublin is "2030-04-27"
    When dispatch creates a ticket for that haulier
    Then ticket creation is blocked
    And the error message includes "Hauler license expired on 2030-04-26"

  Scenario: Non-EU dispatch not blocked by license expiry
    Given the tenant is configured as non-EU region
    And a haulier has "License Expiration Date" set to "2020-01-01"
    When dispatch creates a ticket for that haulier
    Then ticket creation is allowed
    And no license expiry validation is enforced

  Scenario: Import stores valid source value without recalculation
    Given an inbound Command Series V3 haulier payload contains "Waste Carrier License Number" as "WC12345AB"
    And an inbound Command Series V3 haulier payload contains "License Expiration Date" as "2030-04-26"
    When the record is imported
    Then Command Cloud stores wasteCarrierLicenseNumber as "WC12345AB"
    And Command Cloud stores licenseExpiryDate as "2030-04-26"
    And Command Cloud does not derive a replacement date by adding 5 years

  Scenario: Import accepts blank source values
    Given an inbound Command Series V3 haulier payload has blank "Waste Carrier License Number"
    And an inbound Command Series V3 haulier payload has blank "License Expiration Date"
    When the record is imported
    Then Command Cloud stores wasteCarrierLicenseNumber as null or blank
    And Command Cloud stores licenseExpiryDate as null or blank
    And the record remains import-successful

  Scenario: Import flags malformed source values
    Given an inbound Command Series V3 haulier payload contains malformed "License Expiration Date"
    And an inbound Command Series V3 haulier payload contains non-alphanumeric "Waste Carrier License Number"
    When the record is imported
    Then the import logs a field-level validation error for "License Expiration Date"
    And the import logs a field-level validation error for "Waste Carrier License Number"
    And the malformed value is not silently coerced
```

## Implementation note

The 5-year renewal cycle is operational context, not a calculation rule for runtime enforcement. Runtime compliance must always be based on the explicit stored expiration date. The waste carrier license number is an auditable identifier and does not independently determine dispatch eligibility.
