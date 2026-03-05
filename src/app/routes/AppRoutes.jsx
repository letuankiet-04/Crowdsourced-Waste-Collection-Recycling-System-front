import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../auth/ProtectedRoute.jsx'
import { PATHS } from './paths.js'
import {
  AdminDashboard,
  AnimatedAuth,
  CitizenDashboard,
  CitizenReportDetail,
  CitizenReports,
  CitizenFeedback,
  CitizenMyFeedback,
  CitizenFeedbackDetails,
  CollectorDashboard,
  CollectorHistory,
  CollectorProfile,
  CollectorReportDetail,
  CollectorTasks,
  CreateReport,
  EnterpriseAdminPanel,
  EnterpriseActiveCollector,
  EnterpriseDashboard,
  EnterpriseMap,
  EnterpriseProfile,
  EnterpriseReports,
  EnterpriseCollectorReports,
  EnterpriseCollectorReportDetail,
  EnterpriseReportDetail,
  EnterpriseRewards,
  Home,
  ApiTest,
  ApiKnowledge,
  Unauthorized,
  CitizenProfile,
  AdminProfile,
  AdminUserManagement,
  AdminReviewFeedback,
  CitizenRewards,
  PointHistory,
  CitizenTerms,
} from './lazyPages.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path={PATHS.auth.login} element={<AnimatedAuth />} />
      <Route path={PATHS.auth.signup} element={<AnimatedAuth />} />
      <Route path={PATHS.home} element={<Home />} />
      <Route path={PATHS.dev.apiTest} element={<ApiTest />} />
      <Route path={PATHS.dev.apiKnowledge} element={<ApiKnowledge />} />

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
        path={PATHS.citizen.feedback}
        element={
          <ProtectedRoute role={['citizen']}>
            <CitizenFeedback />
          </ProtectedRoute>
        }
      />
      <Route
        path={PATHS.citizen.myFeedback}
        element={
          <ProtectedRoute role={['citizen']}>
            <CitizenMyFeedback />
          </ProtectedRoute>
        }
      />
      <Route
        path={PATHS.citizen.feedbackDetail}
        element={
          <ProtectedRoute role={['citizen']}>
            <CitizenFeedbackDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path={PATHS.citizen.profile}
        element={
          <ProtectedRoute role={['citizen']}>
            <CitizenProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path={PATHS.citizen.rewards}
        element={
          <ProtectedRoute role={['citizen']}>
            <CitizenRewards />
          </ProtectedRoute>
        }
      />

      <Route
        path={PATHS.citizen.terms}
        element={
          <ProtectedRoute role={['citizen']}>
            <CitizenTerms />
          </ProtectedRoute>
        }
      />

      <Route
        path={PATHS.citizen.pointsHistory}
        element={
          <ProtectedRoute role={['citizen']}>
            <PointHistory />
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
        path={PATHS.collector.tasks}
        element={
          <ProtectedRoute role={['collector']}>
            <CollectorTasks />
          </ProtectedRoute>
        }
      />
      <Route
        path={PATHS.collector.history}
        element={
          <ProtectedRoute role={['collector']}>
            <CollectorHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path={PATHS.collector.profile}
        element={
          <ProtectedRoute role={['collector']}>
            <CollectorProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path={PATHS.collector.reportDetail}
        element={
          <ProtectedRoute role={['collector']}>
            <CollectorReportDetail />
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
        path={PATHS.enterprise.activeCollector}
        element={
          <ProtectedRoute role={['enterprise']}>
            <EnterpriseActiveCollector />
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
        path={PATHS.enterprise.collectorReports}
        element={
          <ProtectedRoute role={['enterprise']}>
            <EnterpriseCollectorReports />
          </ProtectedRoute>
        }
      />
      <Route
        path={PATHS.enterprise.collectorReportDetail}
        element={
          <ProtectedRoute role={['enterprise']}>
            <EnterpriseCollectorReportDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path={PATHS.enterprise.reportDetail}
        element={
          <ProtectedRoute role={['enterprise']}>
            <EnterpriseReportDetail />
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
        path={PATHS.admin.dashboard}
        element={
          <ProtectedRoute role={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path={PATHS.admin.profile}
        element={
          <ProtectedRoute role={['admin']}>
            <AdminProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path={PATHS.admin.userManagement}
        element={
          <ProtectedRoute role={['admin']}>
            <AdminUserManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path={PATHS.admin.reviewFeedback}
        element={
          <ProtectedRoute role={['admin']}>
            <AdminReviewFeedback />
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

