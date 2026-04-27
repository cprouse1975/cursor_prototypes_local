# Command Series V3 compatibility: Hauler / Carrier license expiry

## Purpose

Define how Command Cloud must represent and enforce the Hauler/Carrier license expiration date so imports from Command Series V3 remain valid and dispatch cannot ticket expired haulers.

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
- Timezone interpretation: Ireland local calendar date (`Europe/Dublin`) for all compliance checks.

## Import and synchronization rules

1. **Source of truth for imported records**
   - If Series V3 provides a license expiry date, Cloud stores that exact date.
   - Do **not** recalculate by adding 5 years on import when explicit source date is present.

2. **Missing/blank date from source**
   - Treat as non-compliant (`missing`) for dispatch eligibility.
   - Keep record importable, but block ticketing until a valid date is present.

3. **Invalid format from source**
   - Reject/flag the field for correction in import logs.
   - Do not silently coerce malformed values.

4. **Updates**
   - Latest non-null imported value replaces prior value.
   - Optionally persist audit metadata (source, import batch ID, changed-at) to support compliance tracing.

## Ticketing enforcement rule (must match Series compliance intent)

Dispatch must be blocked from ticketing when the selected Hauler/Carrier is not compliant.

### Compliance evaluation

Given:
- `expiryDate = licenseExpiryDate` (date only)
- `dispatchDate = ticket timestamp converted to Europe/Dublin, then date-only`

Status:
- `missing` if `expiryDate` is null
- `expired` if `expiryDate < dispatchDate`
- `active` if `expiryDate >= dispatchDate`

### Dispatch behavior

- Allow ticket creation/edit only when status is `active`.
- Block when status is `missing` or `expired`.
- Show a clear validation message, for example:
  - `Hauler license expired on 2024-11-30. Ticketing is not permitted.`
  - `Hauler license expiry date is missing. Ticketing is not permitted.`

### Boundary condition

If `expiryDate` equals `dispatchDate`, the hauler is valid for that day (expires at end of local day).

## UI behavior for Cloud entry field

- Label: `License Expiration Date`
- Required for active dispatch usage (even if temporarily optional at data-entry level during migration).
- Display warning states:
  - Expired
  - Expiring soon (optional threshold e.g., 30/60/90 days)
  - Missing
- Prevent selecting non-compliant haulers in dispatch UI (disable or filter), and also enforce server-side validation.

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
2. Import with blank date -> record imported, ticketing blocked.
3. Ticket on date before expiry -> allowed.
4. Ticket on exact expiry date -> allowed.
5. Ticket day after expiry -> blocked.
6. Ticket with malformed imported date -> import error + blocked until corrected.
7. UI blocks expired/missing at selection time; API blocks even if UI is bypassed.

## Implementation note

The 5-year renewal cycle is operational context, not a calculation rule for runtime enforcement. Runtime compliance must always be based on the explicit stored expiration date.
