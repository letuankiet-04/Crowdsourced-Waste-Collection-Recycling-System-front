## Findings
- Citizen create-report page exists, but the Submit Report button has no handler and there is no create-report API function yet.
- No toast/snackbar/notification system exists in the codebase; current feedback is mostly inline (e.g., ValidationError).

## Notification Component (Reusable)
- Add a global toast notification system:
  - `NotificationProvider` wrapping the app (in `App.jsx`).
  - `useNotify()` hook to trigger notifications from any page (Citizen/Enterprise/Collector/Admin).
  - `NotificationToaster` UI that renders a fixed stack (top-right) with Tailwind styling.
- Support variants: `success`, `error`, `info`, `warning`, `loading`.
- Support auto-dismiss duration, manual close, and accessible roles (`aria-live`, `role="status"/"alert"`).

## Citizen: Show notify when report is sent
- Update `CreateReportForm`:
  - Track selected image files via `ImageUploader` (`onFilesChange`).
  - Add a submit handler with a local `submitting` state.
  - Basic client validation (types selected, coords present; images optional depending on backend readiness).
  - Call a new API function `createReport(...)`.
  - On success: show `notify.success('Report submitted')` and optionally redirect to Citizen dashboard.
  - On error: show `notify.error(err.message)`.

## API wiring (minimal)
- Add `createReport` function under `src/api/` (either in `citizen.js` or a new `reports.js`).
- Default endpoint: `POST /api/reports`.
- Send JSON first (types/address/weight/notes/coords). If backend expects photos, switch to `FormData` with multiple image files.

## Enterprise reuse (future-proof)
- Provide a small usage example and ensure the hook works for enterprise flows (e.g., after `assignCollectorToRequest`, show success/error toast) without adding role-specific dependencies.

## Verification
- Run the dev build/lint (existing scripts) and do a quick UI smoke test:
  - Trigger notification from create report.
  - Verify stacking, dismiss, auto-dismiss, and that navigation still works.
  - Confirm no console errors and no React warnings.