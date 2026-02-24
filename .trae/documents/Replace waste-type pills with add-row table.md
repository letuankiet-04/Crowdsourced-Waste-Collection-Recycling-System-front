## Goal
- Replace the 3-button waste type UI with an add-row table for many waste types.
- Each row contains: left = Name (waste type), right = Estimated weight.
- Prevent selecting the same waste type in multiple rows.

## Where to Change
- Update [CreateReportForm.jsx](file:///d:/SWP/Crowdsourced-Waste-Collection-Recycling-System-front/src/pages/role/citizen/create_report/CreateReportForm.jsx) to remove `PillSelect` and the single `Estimate Weight` input.
- Add a reusable table component under `src/components/ui/` (keeps CreateReportForm clean and matches existing UI component patterns).
- Add a single source of truth for waste type options under `src/constants/` (easy to swap to API later).

## Data Shape (Backward-Compatible)
- Introduce `report.wasteItems` (array) in the mock report object, e.g. `[{ wasteTypeId, name, estimatedWeight, unit }]`.
- Keep existing fields working:
  - `report.types` becomes `wasteItems.map(i => i.name)`.
  - `report.weight` becomes the total of all row weights (so existing detail screens keep showing an estimated total).

## UI/UX Behavior
- Table columns:
  - **Name**: `<select>` populated by the many waste type options.
  - **Estimated weight**: `<input type="number">` (step 0.01), optionally display unit (kg/can/bottle) from the selected type.
- “+ Add” button adds a new empty row.
- “Remove” action per row.
- Waste type uniqueness:
  - Each row’s dropdown filters out waste types already selected in other rows.
  - Current row keeps its selection even if it would otherwise be filtered.
  - Disable “+ Add” when all types are already used.

## Validation + Submit Rules
- Require at least 1 row with a selected type.
- Require each selected row weight to be > 0.
- Compute total estimated weight and reuse the existing weight validation limits (e.g. < 10 kg) against the computed total.
- On edit flow, initialize table rows from `editReport.wasteItems` if present; otherwise fall back to `{ types[0], weight }`.

## Optional Small Display Upgrade (Recommended)
- Update [Report_Detail.jsx](file:///d:/SWP/Crowdsourced-Waste-Collection-Recycling-System-front/src/components/layout/Report_Detail.jsx) to show the wasteItems table when present (and keep the current badges as fallback).

## Verification
- Run the app and verify:
  - Add multiple rows, selections are unique.
  - Submit enabled only when rows + weights + images + location are valid.
  - Edit an existing report still works and shows rows.
  - Collector flow still sees `report.types` derived from the rows.
