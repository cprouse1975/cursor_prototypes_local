# Command Series V3 compatibility: Hauler / Carrier license expiry

## Purpose

Define how Command Cloud must represent and enforce the Hauler/Carrier license expiration date for EU operations so imports from Command Series V3 remain valid and dispatch cannot ticket expired haulers where this compliance rule applies.

## Regional scope (EU only)

This requirement is enabled only for EU region operations.

- Region gate (recommended): `isEuRegion = true` at tenant/company/operating-region level.
- When `isEuRegion = true`:
  - Show `License Expiration Date` in Hauler details UI.
  - Enforce expiry validation during dispatch ticketing.
- When `isEuRegion = false`:
  - Hide this field from standard UI flows.
  - Do not block dispatch/ticketing based on this field.
  - Keep API/import compatibility by allowing the field to exist in payloads without enforcing it.

## Source system definition (Command Series V3)

- Entity: Hauler (Carrier)
- Field: License Expiration Date (stored in Hauler details)
- Business meaning: Hauler license must be active to legally haul goods in Ireland.
- Renewal pattern: Typically renewed every 5 years.

## Canonical field contract in Command Cloud

Use one canonical field for compatibility with Series imports:

- Field name (recommended API/domain): `licenseExpiryDate`
- Type: Date (no time component)
- Format at API/integration boundary: ISO-8601 date string `YYYY-MM-DD`
- Timezone interpretation for EU enforcement: Ireland local calendar date (`Europe/Dublin`) for all compliance checks.

## Import and synchronization rules

1. **Source of truth for imported records**
   - If Series V3 provides a license expiry date, Cloud stores that exact date.
   - Do **not** recalculate by adding 5 years on import when explicit source date is present.
   - This storage behavior is region-agnostic to preserve import compatibility.

2. **Missing/blank date from source**
   - Keep record importable.
   - Store as null/blank when source is blank.
   - In EU region, blank is allowed and does not block ticketing.

3. **Invalid format from source**
   - Reject/flag the field for correction in import logs.
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

- Label: `License Expiration Date`
- Show only when `isEuRegion = true`.
- Optional field (not mandatory/default-required) in EU.
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
  "licenseExpiryDate": "2030-04-26"
}
```

## Test scenarios (minimum)

1. Import with valid date -> date stored exactly.
2. Import with blank date -> record imported; in EU ticketing allowed.
3. EU ticket on date before expiry -> allowed.
4. EU ticket on exact expiry date -> allowed.
5. EU ticket day after expiry -> blocked.
6. Ticket with malformed imported date -> import error logged; value not set/updated until corrected.
7. In EU, UI blocks expired at selection time; API blocks even if UI is bypassed.
8. Outside EU, field hidden in UI and ticketing not blocked by license expiry.

## Gherkin acceptance criteria

```gherkin
Feature: Haulier/Carrier license expiry handling in Command Cloud
  As a dispatcher or master-data user
  I want license expiry behavior to match Command Series V3 rules for EU operations
  So that imported data is compatible and dispatch is blocked only when required

  Background:
    Given a tenant has a configured operating region
    And the haulier record supports a "License Expiration Date" value as YYYY-MM-DD

  Scenario: Show license expiry field in EU region
    Given the tenant is configured as EU region
    When a user opens Haulier/Carrier details
    Then the "License Expiration Date" field is visible
    And the field is optional

  Scenario: Hide license expiry field outside EU region
    Given the tenant is configured as non-EU region
    When a user opens Haulier/Carrier details
    Then the "License Expiration Date" field is not shown in standard UI flows

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
    Given an inbound Command Series V3 haulier payload contains "License Expiration Date" as "2030-04-26"
    When the record is imported
    Then Command Cloud stores licenseExpiryDate as "2030-04-26"
    And Command Cloud does not derive a replacement date by adding 5 years

  Scenario: Import accepts blank source value
    Given an inbound Command Series V3 haulier payload has blank "License Expiration Date"
    When the record is imported
    Then Command Cloud stores licenseExpiryDate as null or blank
    And the record remains import-successful

  Scenario: Import flags malformed source value
    Given an inbound Command Series V3 haulier payload contains malformed "License Expiration Date"
    When the record is imported
    Then the import logs a field-level validation error for "License Expiration Date"
    And the malformed value is not silently coerced
```

## Implementation note

The 5-year renewal cycle is operational context, not a calculation rule for runtime enforcement. Runtime compliance must always be based on the explicit stored expiration date.
