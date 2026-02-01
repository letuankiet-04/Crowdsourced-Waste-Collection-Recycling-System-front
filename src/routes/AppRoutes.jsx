import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute.jsx'
import { PATHS } from './paths.js'
import {
  AdminDashboard,
  AnimatedAuth,
  CitizenDashboard,
  CitizenReports,
  CollectorDashboard,
  CreateReport,
  EnterpriseAdminPanel,
  EnterpriseDashboard,
  EnterpriseMap,
  EnterpriseProfile,
  EnterpriseReports,
  EnterpriseRewards,
  EnterpriseSettings,
  Home,
  ApiTest,
  Unauthorized,
  CitizenReportDetail,
} from './lazyPages.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path={PATHS.auth.login} element={<AnimatedAuth />} />
      <Route path={PATHS.auth.signup} element={<AnimatedAuth />} />
      <Route path={PATHS.home} element={<Home />} />
      <Route path={PATHS.dev.apiTest} element={<ApiTest />} />

      <Route
        path={PATHS.citizen.dashboard}
        element={
          <ProtectedRoute role={['citizen']}>
            <CitizenDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path={PATHS.citizen.reports}
        element={
          <ProtectedRoute role={['citizen']}>
            <CitizenReports />
          </ProtectedRoute>
        }
      />
      <Route
        path={PATHS.citizen.createReport}
        element={
          <ProtectedRoute role={['citizen']}>
            <CreateReport />
          </ProtectedRoute>
        }
      />

      <Route
        path={PATHS.collector.dashboard}
        element={
          <ProtectedRoute role={['collector']}>
            <CollectorDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path={PATHS.enterprise.dashboard}
        element={
          <ProtectedRoute role={['enterprise']}>
            <EnterpriseDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path={PATHS.enterprise.reports}
        element={
          <ProtectedRoute role={['enterprise']}>
            <EnterpriseReports />
          </ProtectedRoute>
        }
      />
      <Route
        path={PATHS.enterprise.rewards}
        element={
          <ProtectedRoute role={['enterprise']}>
            <EnterpriseRewards />
          </ProtectedRoute>
        }
      />
      <Route
        path={PATHS.enterprise.map}
        element={
          <ProtectedRoute role={['enterprise']}>
            <EnterpriseMap />
          </ProtectedRoute>
        }
      />
      <Route
        path={PATHS.enterprise.profile}
        element={
          <ProtectedRoute role={['enterprise']}>
            <EnterpriseProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path={PATHS.enterprise.adminPanel}
        element={
          <ProtectedRoute role={['enterprise']}>
            <EnterpriseAdminPanel />
          </ProtectedRoute>
        }
      />
      <Route
        path={PATHS.enterprise.settings}
        element={
          <ProtectedRoute role={['enterprise']}>
            <EnterpriseSettings />
          </ProtectedRoute>
        }
      />

      <Route
        path={PATHS.admin.dashboard}
        element={
          <ProtectedRoute role={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path={PATHS.citizen.reportDetail}
        element={
          <ProtectedRoute role={['citizen']}>
            <CitizenReportDetail />
          </ProtectedRoute>
        }
      />


      <Route path={PATHS.unauthorized} element={<Unauthorized />} />

      <Route path="/" element={<Navigate to={PATHS.home} replace />} />
      <Route path="*" element={<Navigate to={PATHS.home} replace />} />
    </Routes>
  )
}
