# Story: Remove "Nominal Strength" column from EPD Mix-Designs table

**Service / Area:** Carbon-Accounting EXP (`carbon-accounting-exp`)
**Page / Component:** EPD Mix-Designs table (`/app/carbon-accounting-exp/.../epds`)
**Type:** Story (UI cleanup / tech debt)
**Reference screenshot:** EPD Mix-Designs table — "Nominal Strength" column highlighted (between *Concrete Strength* and *Max Aggregate Size*).

---

## Summary

The **Nominal Strength** column currently shown on the EPD Mix-Designs table in the Carbon-Accounting EXP service is redundant — the value is not used by any downstream consumer and duplicates information already represented by *Concrete Strength*. Remove (hide) the column from the table for **all users**, regardless of role, tenant, or feature flag, so it no longer appears in the UI.

## Background / Context

- The EPD Mix-Designs table lists mix designs and their linked EPDs (Product Name, Mix Design ID, Mix Design Name, Location, Concrete Strength, **Nominal Strength**, Max Aggregate Size, Air Content, GWP (kgCO₂e/m³), EPD Status, EPD Source, EPD Link).
- "Nominal Strength" provides no additional value beyond Concrete Strength and is causing user confusion.
- This is purely a presentation-layer change in the carbon-accounting-exp UI; the backing API/data model does **not** need to be changed as part of this story (a follow-up tech-debt story can clean up the API field if/when it becomes orphaned).

## In scope

- Remove the **Nominal Strength** column header and cell from the EPD Mix-Designs table.
- Remove any related column-toggle/visibility settings for that column (so it cannot be re-enabled by users via the column chooser).
- Remove the column from any sort/filter logic, CSV/Excel export, and saved view defaults so exports also no longer include it.
- Update any unit / component / e2e tests that reference the column.

## Out of scope

- Changes to the backend API contract or database schema (keep the field for now to avoid breaking other consumers).
- Removing "Nominal Strength" from any other screen, report, or service (separate story if needed).
- Re-design or re-ordering of the remaining columns.

## Acceptance Criteria (Gherkin)

```gherkin
Feature: Remove Nominal Strength column from the EPD Mix-Designs table
  As a user of the Carbon-Accounting EXP service
  I want the redundant "Nominal Strength" column hidden from the EPD Mix-Designs table
  So that the table is cleaner and not cluttered with redundant data

  Background:
    Given I am authenticated in the Command Cloud platform
    And I have access to the Carbon-Accounting EXP service
    And the EPD Mix-Designs page contains at least one mix design

  Scenario: Nominal Strength column is not rendered for any user
    When I navigate to the "EPD Mix-Designs" page
    Then the table should display the columns:
      | Product Name      |
      | Mix Design ID     |
      | Mix Design Name   |
      | Location          |
      | Concrete Strength |
      | Max Aggregate Size|
      | Air Content       |
      | GWP (kgCO2e/m3)   |
      | EPD Status        |
      | EPD Source        |
      | EPD Link          |
    And the column "Nominal Strength" should not be visible
    And no row should render a cell value under a "Nominal Strength" column

  Scenario: Nominal Strength is not available in the column chooser / settings
    Given I am on the "EPD Mix-Designs" page
    When I open the column chooser / table settings
    Then "Nominal Strength" should not appear as a toggleable column
    And there should be no way for a user to re-enable a "Nominal Strength" column from the UI

  Scenario: Nominal Strength is not used for sorting or filtering
    Given I am on the "EPD Mix-Designs" page
    When I view the available sort and filter options for the table
    Then "Nominal Strength" should not appear as a sortable column
    And "Nominal Strength" should not appear as a filterable field

  Scenario: Nominal Strength is excluded from data exports
    Given I am on the "EPD Mix-Designs" page
    When I export the table to CSV or Excel
    Then the exported file should not contain a "Nominal Strength" column or header
    And the remaining columns should match what is displayed in the UI

  Scenario: Saved views and user preferences no longer reference Nominal Strength
    Given a user previously saved a view that included the "Nominal Strength" column
    When that user opens the "EPD Mix-Designs" page
    Then the saved view should load successfully without errors
    And the "Nominal Strength" column should not be displayed
    And no console errors related to the missing column should be raised

  Scenario: Removal applies to all roles and tenants
    Given users with roles "Admin", "Standard User", and "Read-Only" across multiple tenants
    When any of those users open the "EPD Mix-Designs" page
    Then none of them should see a "Nominal Strength" column
    And the change should not be gated behind a feature flag

  Scenario: Backend API for mix designs is unchanged
    When the "EPD Mix-Designs" page loads its data
    Then the existing GET request for mix designs should be made unchanged
    And the page should not break if the API response still contains a "nominalStrength" field
    And the "nominalStrength" field, if present, should simply be ignored by the UI
```

## Notes for implementation

- Locate the table column definitions for the EPD Mix-Designs grid in `carbon-accounting-exp` (likely a `columns` array / column-defs file for the data grid component).
- Remove the `Nominal Strength` column definition, its accessor/key, header label (i18n key if applicable), and any associated formatter.
- Remove references in:
  - Column visibility / chooser config
  - Default & saved view configurations
  - Sort/filter option lists
  - CSV / Excel export column mapping
  - Storybook / fixtures (if any)
  - Unit and e2e tests (Cypress/Playwright)
- Verify gracefully ignoring `nominalStrength` from the API payload (no breaking deserialization).
- Update i18n catalog: mark the `nominalStrength` label key as deprecated or remove it if not used elsewhere.

## QA / Test guidance

- Visual regression: snapshot the EPD Mix-Designs table on desktop & smaller viewports.
- Cross-role smoke test (Admin / Standard / Read-Only).
- Verify saved views and pre-existing user preferences continue to load.
- Verify CSV/Excel exports.
- Confirm no JavaScript console errors on page load and on column-chooser open.

## Definition of Done

- Code merged to `main` and deployed to UAT then production.
- All Gherkin scenarios above pass in automated tests where applicable, and are manually verified in UAT.
- Release notes updated noting the column removal.
- Stakeholder (product owner of Carbon-Accounting EXP) signs off in UAT.
