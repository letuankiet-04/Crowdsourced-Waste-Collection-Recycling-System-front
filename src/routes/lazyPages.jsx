import { lazy } from 'react'

export const AnimatedAuth = lazy(() => import('../features/auth/pages/AnimatedAuth.jsx'))
export const Home = lazy(() => import('../features/home/pages/Home.jsx'))

export const CitizenDashboard = lazy(() => import('../pages/role/citizen/Citizen_Dashboard.jsx'))
export const CreateReport = lazy(() => import('../pages/role/citizen/CreateReport.jsx'))
export const CollectorDashboard = lazy(() => import('../pages/role/collector/Collector_Dashboard.jsx'))
export const AdminDashboard = lazy(() => import('../pages/role/admin/Admin_Dashboard.jsx'))
export const Unauthorized = lazy(() => import('../pages/common/Unauthorized.jsx'))
export const ApiTest = lazy(() => import('../pages/common/ApiTest.jsx'))

export const EnterpriseDashboard = lazy(() => import('../pages/role/enterprise/Enterprise_Dashboard.jsx'))
export const EnterpriseReports = lazy(() => import('../pages/role/enterprise/Enterprise_Reports.jsx'))
export const EnterpriseRewards = lazy(() => import('../pages/role/enterprise/Enterprise_Rewards.jsx'))
export const EnterpriseMap = lazy(() => import('../pages/role/enterprise/Enterprise_Map.jsx'))
export const EnterpriseProfile = lazy(() => import('../pages/role/enterprise/Enterprise_Profile.jsx'))
export const EnterpriseAdminPanel = lazy(() => import('../pages/role/enterprise/Enterprise_AdminPanel.jsx'))
export const EnterpriseSettings = lazy(() => import('../pages/role/enterprise/Enterprise_Settings.jsx'))
