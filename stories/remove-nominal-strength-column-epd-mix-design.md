# Story: Remove Nominal Strength Column from EPD Mix-Design Table

## Summary

As a **system administrator / product owner**,  
I want to **remove the "Nominal Strength" column from the EPD Mix-Designs table** in the Carbon-Accounting EXP service,  
So that **users are not presented with a redundant column that adds no value to their workflow**.

---

## Background

The EPD Mix-Designs table (accessible at `/carbon-accounting-exp/<org-id>/epds`) currently displays the following columns:

- Product Name
- Mix Design ID
- Mix Design Name
- Location
- Concrete Strength
- **Nominal Strength** ← _redundant — to be removed_
- Max Aggregate Size
- Air Content
- GWP (kgCO₂e/m³)
- EPD Status
- EPD Source
- EPD Link

The "Nominal Strength" column has been identified as redundant, overlapping with information already captured by the "Concrete Strength" column. It should be hidden/removed from the table for **all users** across all tenants to simplify the interface and reduce visual noise.

---

## Acceptance Criteria

### Feature: Remove Nominal Strength Column from EPD Mix-Design Table

```gherkin
Feature: Remove Nominal Strength column from EPD Mix-Design table
  As a user of the Carbon-Accounting EXP service
  I want the EPD Mix-Designs table to not show the Nominal Strength column
  So that the table is cleaner and does not show redundant data

  Background:
    Given I am authenticated in the Carbon-Accounting EXP service
    And I navigate to the EPD Mix-Designs page

  Scenario: Nominal Strength column is not visible to standard users
    Given I am logged in as a standard user
    When I view the EPD Mix-Designs table
    Then the table should NOT display a column with the header "Nominal Strength"
    And all other columns (Product Name, Mix Design ID, Mix Design Name, Location, Concrete Strength, Max Aggregate Size, Air Content, GWP, EPD Status, EPD Source, EPD Link) should still be present

  Scenario: Nominal Strength column is not visible to admin users
    Given I am logged in as an admin user
    When I view the EPD Mix-Designs table
    Then the table should NOT display a column with the header "Nominal Strength"
    And all other columns should still be present and functional

  Scenario: Nominal Strength column is not visible to any tenant
    Given I am authenticated as a user belonging to any tenant in the system
    When I view the EPD Mix-Designs table
    Then the "Nominal Strength" column should not be rendered for any tenant
    And no feature flag or toggle should restore the column for any user role or tenant

  Scenario: Removing the column does not break sorting or filtering
    Given I am on the EPD Mix-Designs table
    When I apply a sort or filter on any remaining visible column
    Then the table sorts or filters correctly
    And the "Nominal Strength" column does not re-appear

  Scenario: Removing the column does not break pagination
    Given there are more EPD mix-design records than fit on a single page
    When I navigate between pages using the pagination controls
    Then the correct records are displayed on each page
    And the "Nominal Strength" column is absent on all pages

  Scenario: Removing the column does not affect exported or downloaded data
    Given I export the EPD Mix-Designs data (if an export feature exists)
    When the export file is generated
    Then the "Nominal Strength" field should be excluded from the exported file
    Or if excluding it would break the export contract, it is removed in a follow-up data story

  Scenario: No console errors or layout regressions after column removal
    Given the "Nominal Strength" column has been removed from the table definition
    When I load the EPD Mix-Designs page
    Then the browser console should contain no errors related to the removed column
    And the table layout should render correctly with no broken spacing or alignment
```

---

## Technical Notes

- The column should be **removed from the table column definition**, not simply hidden via CSS, to avoid the column being re-enabled through browser developer tools.
- If the column is driven by a backend API response field (`nominalStrength` or similar), the field does **not** need to be removed from the API at this stage — only the frontend column definition needs to be removed.
- If the column is driven by a shared column-config object or constants file, update that file and verify no other table or view references the same constant.
- Regression tests (unit and/or E2E) for the EPD Mix-Designs table should be updated to assert the column is absent.

---

## Out of Scope

- Removing the `nominalStrength` field from the backend API or database schema (separate data/API story if required).
- Any changes to column ordering of remaining columns beyond the removal of "Nominal Strength".
- Changes to any other table or page that may reference "Nominal Strength".

---

## Definition of Done

- [ ] "Nominal Strength" column is removed from the EPD Mix-Designs table column definition.
- [ ] The column is not visible in the UI for any user role or tenant.
- [ ] All existing Gherkin acceptance criteria above pass.
- [ ] Relevant unit tests updated / passing.
- [ ] Relevant E2E / integration tests updated / passing.
- [ ] No console errors or visual regressions on the EPD Mix-Designs page.
- [ ] Code reviewed and merged to the appropriate environment branch.
- [ ] Change verified in the UAT environment.
