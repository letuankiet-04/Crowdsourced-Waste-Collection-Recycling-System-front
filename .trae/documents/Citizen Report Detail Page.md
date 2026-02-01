## What you want
- A citizen report detail page that works with your reusable `ReportDetail` component.
- No `useEffect`, so no ESLint “missing dependency” warnings.

## 1) Create Citizen_ReportDetail.jsx (full code)
Create file:
- `src/pages/role/citizen/Citizen_ReportDetail.jsx`

Paste:

```jsx
import { useMemo } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './CD_Navbar'
import CD_Footer from '../../../components/layout/CD_Footer.jsx'
import RoleLayout from '../../../components/layout/RoleLayout.jsx'
import ReportDetail from '../../../components/layout/Report_Detail.jsx'
import useStoredUser from '../../../hooks/useStoredUser.js'
import { getMockReports } from '../../../mock/reportStore.js'
import { PATHS } from '../../../routes/paths.js'

export default function CitizenReportDetail() {
  const { reportId } = useParams()
  const { user } = useStoredUser()

  const report = useMemo(() => {
    const id = reportId ? String(reportId) : ''
    if (!id) return null

    const list = getMockReports()
    if (!Array.isArray(list)) return null

    return list.find((r) => r && r.id === id) ?? null
  }, [reportId])

  const me = user?.email ?? null

  if (report && me && report.createdBy && report.createdBy !== me) {
    return <Navigate to={PATHS.unauthorized} replace />
  }

  return (
    <RoleLayout
      sidebar={<Sidebar />}
      navbar={<Navbar />}
      footer={
        <div className="animate-fade-in-up" style={{ animationDelay: '240ms' }}>
          <CD_Footer />
        </div>
      }
      showBackgroundEffects
    >
      <div className="animate-fade-in-up">
        <ReportDetail
          report={report}
          backTo={PATHS.citizen.reports}
          title="Report Detail"
          description={reportId ? `Viewing report: ${reportId}` : 'Viewing report'}
          backLabel="Back to reports"
        />
      </div>
    </RoleLayout>
  )
}
```

Why no ESLint issue?
- We only use `useMemo`, and the dependency list is simple: `[reportId]`.

## 2) Register the route
### A) lazyPages
In [lazyPages.jsx](file:///d:/SWP/Crowdsourced-Waste-Collection-Recycling-System-front/src/routes/lazyPages.jsx)
- Add:
  - `export const CitizenReportDetail = lazy(() => import('../pages/role/citizen/Citizen_ReportDetail.jsx'))`

### B) AppRoutes
In [AppRoutes.jsx](file:///d:/SWP/Crowdsourced-Waste-Collection-Recycling-System-front/src/routes/AppRoutes.jsx)
- Add `CitizenReportDetail` to the import list from `lazyPages.jsx`.
- Add a protected route:
  - path: `PATHS.citizen.reportDetail`
  - element: wrap `CitizenReportDetail` with `ProtectedRoute role={['citizen']}`

## 3) Make the reports list clickable
In [Citizen_Reports.jsx](file:///d:/SWP/Crowdsourced-Waste-Collection-Recycling-System-front/src/pages/role/citizen/Citizen_Reports.jsx)
- Wrap `r.id` in a `Link` to `${PATHS.citizen.reports}/${r.id}`.

If you confirm, next I’ll give you the exact code lines to add in `lazyPages.jsx` and `AppRoutes.jsx` (copy-paste ready).