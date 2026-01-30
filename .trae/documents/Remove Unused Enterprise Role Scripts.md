## Findings
- There is no `src/role/enterprise` folder; enterprise role code is under `src/pages/role/enterprise`.
- Every script in `src/pages/role/enterprise/**/*.{js,jsx}` is referenced by the router import chain (lazyPages → AppRoutes) and/or by another enterprise component, so there are no safe “never used” files to delete right now.

## What I Will Do Next (After You Confirm)
1. Re-scan `src/pages/role/enterprise` and build an import graph (who imports what).
2. Identify true deletion candidates (files with zero importers and not referenced by routing).
3. If any are found, delete them and remove corresponding references from:
   - `src/routes/lazyPages.jsx`
   - `src/routes/AppRoutes.jsx`
   - any enterprise layout/navbar/dashboard imports
4. Run the project’s checks (typecheck/build/tests if present) to ensure nothing breaks.

## Evidence Points (Current State)
- Enterprise pages are all lazily imported: [lazyPages.jsx](file:///d:/SWP/Crowdsourced-Waste-Collection-Recycling-System-front/src/routes/lazyPages.jsx#L12-L18)
- Enterprise routes are all registered: [AppRoutes.jsx](file:///d:/SWP/Crowdsourced-Waste-Collection-Recycling-System-front/src/routes/AppRoutes.jsx#L47-L102)
- Enterprise dashboard helper scripts are imported and used: [Enterprise_Dashboard.jsx](file:///d:/SWP/Crowdsourced-Waste-Collection-Recycling-System-front/src/pages/role/enterprise/Enterprise_Dashboard.jsx#L1-L100)

## Expected Outcome
- If there truly are unused enterprise scripts, they will be removed cleanly with all imports/routes updated.
- If none exist (current likely result), no deletions will be made to avoid breaking enterprise routing.