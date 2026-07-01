# CARBON-2071 — Enable standard column header functionality on Carriers summary table (Company Admin)

## Summary

Enable the standard data-grid column header menu on the **Carriers summary table** in **Company Admin**, including sort, pin, filter, hide, and manage columns. The **License Expiration Date** column must use the shared **filter component** with **date operators**, configured the same way as the **Freight charge table**.

## Background / context

The Carriers summary table in Company Admin displays carrier/hauler records, including the EU-only **License Expiration Date** field (`licenseExpiryDate`). Users need the same column header interactions available on other Command Cloud summary tables so they can sort, pin, filter, hide, and manage columns without leaving the grid.

The **Freight charge table** is the reference implementation for column header menu behavior and date filtering. This story applies that same component setup to the Carriers summary table.

## User story

**As a** Company Admin user  
**I want** standard column header controls on the Carriers summary table  
**So that** I can sort, pin, filter, hide, and manage columns—including filtering the License Expiration Date by date criteria—in the same way as other summary tables (e.g. Freight charge).

## Scope

### In scope

- Enable the standard column header menu component on all applicable columns in the **Carriers summary table** (Company Admin).
- Column header menu options (standard behavior):
  - **Sort ascending**
  - **Sort descending**
  - **Pin to left**
  - **Pin to right**
  - **Filter** (opens the shared filter component)
  - **Hide column**
  - **Manage columns**
- Wire the **License Expiration Date** column filter to the shared **filter component** using the **date operator** set (same configuration as Freight charge table).
- Ensure filter, sort, pin, and hide state behave consistently with the platform data-grid patterns used elsewhere.

### Out of scope

- Changes to carrier/hauler detail form fields or API contracts for `licenseExpiryDate`.
- New filter operators beyond the standard date operator set.
- Column header functionality on tables other than the Carriers summary table in Company Admin.

## Functional requirements

### 1. Column header menu (all columns)

Each column header in the Carriers summary table must expose the standard column menu with:

| Menu action | Expected behavior |
|-------------|-------------------|
| Sort ascending | Sorts the table by the selected column in ascending order. |
| Sort descending | Sorts the table by the selected column in descending order. |
| Pin to left | Pins the column to the left side of the grid; pinned columns remain visible during horizontal scroll. |
| Pin to right | Pins the column to the right side of the grid. |
| Filter | Opens the shared filter component pre-populated for the selected column (see §2). |
| Hide column | Removes the column from the current grid view (user can restore via Manage columns). |
| Manage columns | Opens the standard manage-columns UI to show/hide and reorder columns. |

Behavior, styling, and interaction patterns must match the standard column header component used on the Freight charge table.

### 2. Filter component — License Expiration Date column

When the user selects **Filter** from the **License Expiration Date** column header menu:

1. The shared **filter component** opens (same component used on Freight charge table).
2. The **Columns** section is pre-populated with **License Expiration Date** (the column heading label shown in the grid).
3. The **Operator** dropdown is configured for **date** filtering and offers exactly these options:
   - Is
   - Is not
   - Is after
   - Is on or after
   - Is before
   - Is on or before
   - Is empty
   - Is not empty
4. The **Value** input for date operators (where applicable) displays dates in **`mm/dd/yyyy`** format.
5. A **date picker** control is shown to the right of the value field for selecting a date.
6. Applying the filter updates the Carriers summary table results accordingly.
7. For **Is empty** / **Is not empty**, the value field/date picker is not required (or is disabled/hidden per standard filter component behavior).

This setup must mirror the Freight charge table date column filter configuration (component, operators, date format, and date picker placement).

### 3. Filter component — other columns

Other filterable columns on the Carriers summary table should use the shared filter component with the appropriate operator type for each column’s data type (text, number, boolean, etc.), consistent with platform standards. Date-specific operator configuration applies specifically to **License Expiration Date**.

### 4. Sort, pin, hide, and manage columns persistence

- Sort direction, pinned columns, hidden columns, and column order should follow the same persistence/reset behavior as other Company Admin summary tables (e.g. session or saved view defaults, per platform convention).
- Hidden columns must be restorable via **Manage columns**.

## Acceptance criteria

```gherkin
Feature: Carriers summary table column header functionality (Company Admin)

  Background:
    Given I am logged in as a Company Admin user
    And I am on the Carriers summary table in Company Admin

  Scenario: Column header menu shows standard actions
    When I open the column header menu on any column
    Then I see options for Sort ascending, Sort descending, Pin to left, Pin to right, Filter, Hide column, and Manage columns

  Scenario: Sort ascending on a column
    When I choose "Sort ascending" from a column header menu
    Then the Carriers summary table is sorted by that column in ascending order

  Scenario: Sort descending on a column
    When I choose "Sort descending" from a column header menu
    Then the Carriers summary table is sorted by that column in descending order

  Scenario: Pin column to left
    When I choose "Pin to left" from a column header menu
    Then that column is pinned to the left side of the grid
    And the column remains visible when I scroll horizontally

  Scenario: Pin column to right
    When I choose "Pin to right" from a column header menu
    Then that column is pinned to the right side of the grid

  Scenario: Hide column
    When I choose "Hide column" from a column header menu
    Then that column is no longer visible in the grid

  Scenario: Restore hidden column via Manage columns
    Given I have hidden a column
    When I open "Manage columns" from a column header menu
    Then I can show the hidden column again

  Scenario: Filter License Expiration Date opens filter component with date operators
    When I choose "Filter" from the "License Expiration Date" column header menu
    Then the shared filter component opens
    And the Columns section shows "License Expiration Date"
    And the Operator dropdown shows date options: Is, Is not, Is after, Is on or after, Is before, Is on or before, Is empty, Is not empty

  Scenario: License Expiration Date filter value uses mm/dd/yyyy and date picker
    Given the filter component is open for "License Expiration Date"
    And I select a date operator that requires a value (e.g. "Is")
    Then the Value field accepts/displays dates in mm/dd/yyyy format
    And a date picker is displayed to the right of the Value field

  Scenario: Apply License Expiration Date filter
    Given the filter component is open for "License Expiration Date"
    And I set Operator to "Is on or before"
    And I select a date using the date picker
    When I apply the filter
    Then the Carriers summary table shows only carriers whose License Expiration Date matches the filter criteria

  Scenario: License Expiration Date is empty filter
    Given the filter component is open for "License Expiration Date"
    When I set Operator to "Is empty"
    And I apply the filter
    Then the Carriers summary table shows only carriers with no License Expiration Date value

  Scenario: License Expiration Date is not empty filter
    Given the filter component is open for "License Expiration Date"
    When I set Operator to "Is not empty"
    And I apply the filter
    Then the Carriers summary table shows only carriers with a License Expiration Date value
```

## Reference implementation

- **Freight charge table** — use as the reference for:
  - Column header menu component and menu items
  - Filter component integration from column header **Filter** action
  - Date operator configuration and value field (`mm/dd/yyyy` + date picker)
- **License Expiration Date field** — `licenseExpiryDate` (UI label: **License Expiration Date**); see hauler/carrier license spec for field semantics.

## Technical notes

- Locate the Carriers summary table column definitions in Company Admin (likely a `columns` / column-defs configuration for the shared data-grid component).
- Reuse the existing column header menu and filter component; do not build a one-off filter UI for this table.
- For `licenseExpiryDate`, ensure server-side or client-side filtering interprets dates consistently with stored values (ISO `YYYY-MM-DD` at API boundary; display/filter input as `mm/dd/yyyy` in the filter component).
- Confirm EU region gating for displaying the License Expiration Date column is unchanged; this story only adds column header interactions for columns already visible in the grid.

## Definition of done

- [ ] Standard column header menu enabled on Carriers summary table columns in Company Admin.
- [ ] Sort ascending/descending, pin left/right, hide column, and manage columns work per acceptance criteria.
- [ ] License Expiration Date **Filter** opens the shared filter component with date operators and `mm/dd/yyyy` date picker (Freight charge table parity).
- [ ] Filter application correctly narrows Carriers summary table results.
- [ ] QA verified against Freight charge table behavior for column menu and date filtering UX.
- [ ] No regression to existing Carriers summary table data loading, pagination, or export (if applicable).

## Dependencies / links

- Hauler/Carrier license field spec: `licenseExpiryDate`, UI label **License Expiration Date**
- Reference UI: Freight charge table column header and date filter setup
