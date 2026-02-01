## What you have now (from FE_PROMPT + code)
- Citizen has a Recent Reports widget and a My Reports table, but rows are not clickable yet.
- There is no report detail route/page (no `/citizen/reports/:reportId`).
- Reports are stored in `sessionStorage` via `getMockReports/addMockReport/clearMockReports`.
- ImageUploader uses `URL.createObjectURL()` and revokes URLs on unmount, so submitted images are not currently persistable in mock storage.

## Goal UI (same structure as your screenshot)
- **Two-column layout (lg+)**
  - **Left column**: Submitted images gallery + Waste details card + Location map card.
  - **Right column**: Report status timeline card + Manage report/actions card + Help card.
- **Role-based left/right**: render different right-side actions (and optionally left-side data) for Citizen vs Enterprise vs Collector vs Admin.

## Training: how to code this cleanly
- Build it as a composition problem:
  1. **Route param** (`reportId`) → load report object.
  2. **Layout component** renders `left` and `right` slots.
  3. **Role wrappers** decide what goes into those slots.
- Keep UI “dumb”, keep data ops “small helpers”:
  - `getReportById(reportId)`
  - `updateReport(reportId, patch)`
  - `removeReport(reportId)`
- Timeline rendering strategy:
  - Define an ordered status list (Pending → Accepted → Assigned/On the way → Collected).
  - For each step, render: icon (done/current/todo), label, timestamp (if available).

## Planned implementation (no code executed yet)
### 1) Add report detail routing
- Extend `PATHS` with:
  - `PATHS.citizen.reportDetail = '/citizen/reports/:reportId'`
  - (scaffold) `PATHS.enterprise.reportDetail`, `PATHS.collector.reportDetail`, `PATHS.admin.reportDetail`
- Add new route(s) in `AppRoutes.jsx` under the correct `ProtectedRoute` role.
- Register new pages in `lazyPages.jsx`.

### 2) Make report rows clickable
- Update Citizen:
  - `RecentReports.jsx`: make each row (or Report ID) a `<Link>` to `PATHS.citizen.reportDetail` with the clicked `r.id`.
  - `Citizen_Reports.jsx`: same change for table rows.

### 3) Create shared “ReportDetailLayout” + cards (matches screenshot)
- New reusable components (location under `src/components/reports/` or `src/features/reports/`):
  - `ReportDetailLayout` (2-column grid + spacing)
  - `SubmittedImagesCard` (main preview + thumbnails)
  - `WasteDetailsCard` (type(s), weight, description)
  - `ReportLocationCard` (read-only Leaflet map + coordinates/address)
  - `ReportStatusTimelineCard` (stepper/timeline)
  - `ManageReportCard` (role-based actions)
  - `NeedHelpCard` (static support CTA)

### 4) Fix mock data so images + timeline can exist
- Update Create Report to store **persistable images**:
  - Convert selected files → `data:` URLs (base64) before saving into the report object (so navigating to detail works).
  - Add fields to report:
    - `imageDataUrls: string[]`
    - `statusHistory: [{ status, at }]` (start with `{pending, createdAt}`)
- Extend mock store:
  - `getMockReportById(id)`
  - `updateMockReport(id, patch)`
  - `removeMockReport(id)`
- Extend report events so lists refresh without reload:
  - `report_updated`, `report_removed` publish/subscribe.

### 5) Implement role-based right side (and optionally left)
- Citizen detail:
  - Right: timeline + manage (Update details / Remove report)
  - Remove allowed only when `status` is Pending/Accepted (same note as screenshot).
- Enterprise detail (scaffold):
  - Right: Accept/Reject + Assign Collector (can be mocked for now).
- Collector detail (scaffold):
  - Right: Update status (On the way / Collected) + upload proof (mock).
- Admin detail (scaffold):
  - Right: view-only audit actions or remove report (optional).

### 6) Verify
- Manual check:
  - Create a report with images → open Recent Reports → click → detail shows images/map/details.
  - Remove report → it disappears from list + recent.
  - Timeline reflects current status.

## Deliverable after you confirm
- A working Citizen report detail page matching the screenshot structure.
- Click-to-open from both Recent Reports and My Reports.
- A clean role-based structure so you can extend Enterprise/Collector/Admin screens next.