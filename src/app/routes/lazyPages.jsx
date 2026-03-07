import { lazy } from 'react'

export const AnimatedAuth = lazy(() => import('../../features/auth/pages/AnimatedAuth.jsx'))
export const Home = lazy(() => import('../../features/home/pages/Home.jsx'))
export const CollectorDashboard = lazy(() => import('../../features/collector/pages/Collector_Dashboard.jsx'))
export const CollectorReportDetail = lazy(() => import('../../features/collector/pages/Collector_ReportDetail.jsx'))
export const CollectorTasks = lazy(() => import('../../features/collector/pages/Collector_Tasks.jsx'))
export const CollectorHistory = lazy(() => import('../../features/collector/pages/Collector_History.jsx'))
export const CollectorProfile = lazy(() => import('../../features/collector/pages/Collector_Profile.jsx'))
export const AdminDashboard = lazy(() => import('../../features/admin/pages/Admin_Dashboard.jsx'))
export const AdminProfile = lazy(() => import('../../features/admin/pages/Admin_Profile.jsx'))
export const AdminUserManagement = lazy(() => import('../../features/admin/pages/Admin_UserManagement.jsx'))
export const AdminReviewFeedback = lazy(() => import('../../features/admin/pages/Review_Feedback.jsx'))
export const Unauthorized = lazy(() => import('../pages/common/Unauthorized.jsx'))
export const ApiTest = lazy(() => import('../pages/common/ApiTest.jsx'))
export const ApiKnowledge = lazy(() => import('../pages/common/ApiKnowledge.jsx'))
export const FeatureKnowledge = lazy(() => import('../pages/common/FeatureKnowledge.jsx'))

//citizen
export const CitizenDashboard = lazy(() => import('../../features/citizen/pages/Citizen_Dashboard.jsx'))
export const CreateReport = lazy(() => import('../../features/citizen/pages/CreateReport.jsx'))
export const CitizenReports = lazy(() => import('../../features/citizen/pages/Citizen_Reports.jsx'))
export const CitizenReportDetail = lazy(() => import('../../features/citizen/pages/Citizen_ReportDetail.jsx'))
export const CitizenFeedback = lazy(() => import('../../features/citizen/pages/Feedback.jsx'))
export const CitizenMyFeedback = lazy(() => import('../../features/citizen/pages/MyFeedback.jsx'))
export const CitizenFeedbackDetails = lazy(() => import('../../features/citizen/pages/FeedbackDetails.jsx'))
export const CitizenProfile = lazy(() => import('../../features/citizen/pages/Citizen_Profile.jsx'))
export const CitizenRewards = lazy(() => import('../../features/citizen/pages/Citizen_Rewards.jsx'))
export const PointHistory = lazy(() => import('../../features/citizen/pages/PointHistory.jsx'))
export const CitizenTerms = lazy(() => import('../../features/citizen/pages/Citizen_Terms.jsx'))



//enterprise
export const EnterpriseDashboard = lazy(() => import('../../features/enterprise/pages/Enterprise_Dashboard.jsx'))
export const EnterpriseActiveCollector = lazy(() => import('../../features/enterprise/pages/Enterprise_ActiveCollector.jsx'))
export const EnterpriseReports = lazy(() => import('../../features/enterprise/pages/Enterprise_Reports.jsx'))
export const EnterpriseCollectorReports = lazy(() => import('../../features/enterprise/pages/Enterprise_CollectorReports.jsx'))
export const EnterpriseCollectorReportDetail = lazy(() => import('../../features/enterprise/pages/Enterprise_CollectorReportDetail.jsx'))
export const EnterpriseReportDetail = lazy(() => import('../../features/enterprise/pages/Enterprise_ReportDetail.jsx'))
export const EnterpriseRewards = lazy(() => import('../../features/enterprise/pages/Enterprise_Rewards.jsx'))
export const EnterpriseMap = lazy(() => import('../../features/enterprise/pages/Enterprise_Map.jsx'))
export const EnterpriseProfile = lazy(() => import('../../features/enterprise/pages/Enterprise_Profile.jsx'))
export const EnterpriseAdminPanel = lazy(() => import('../../features/enterprise/pages/Enterprise_AdminPanel.jsx'))


