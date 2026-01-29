import { Navigate, Route, Routes } from 'react-router-dom'
import AnimatedAuth from './features/auth/pages/AnimatedAuth.jsx'
import Home from './features/home/pages/Home.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import CitizenDashboard from './pages/role/citizen/Citizen_Dashboard.jsx'
import CreateReport from './pages/role/citizen/CreateReport.jsx'
import CollectorDashboard from './pages/role/collector/Collector_Dashboard.jsx'
import EnterpriseDashboard from './pages/role/enterprise/Enterprise_Dashboard.jsx'
import AdminDashboard from './pages/role/admin/Admin_Dashboard.jsx'
import Unauthorized from './pages/common/Unauthorized.jsx'
import { PATHS } from './routes/paths.js'

function App() {
  return (
    <Routes>
      {/* Auth*/}
      <Route path={PATHS.auth.login} element={<AnimatedAuth />} />
      <Route path={PATHS.auth.signup} element={<AnimatedAuth />} />
      <Route path={PATHS.home} element={<Home />} />
      {/* Role - based page */}
      <Route path={PATHS.citizen.dashboard} element={<ProtectedRoute role={['citizen']}><CitizenDashboard /></ProtectedRoute>} />
     
      <Route path={PATHS.citizen.createReport} element={<CreateReport />} />
      <Route path={PATHS.collector.dashboard} element={<ProtectedRoute role={['collector']}><CollectorDashboard /></ProtectedRoute>} />
      <Route path={PATHS.enterprise.dashboard} element={<ProtectedRoute role={['enterprise']}><EnterpriseDashboard /></ProtectedRoute>} />
      <Route path={PATHS.admin.dashboard} element={<ProtectedRoute role={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path={PATHS.unauthorized} element={<Unauthorized />} />
      {/* Fall back */}
      <Route path="/" element={<Navigate to={PATHS.home} replace />} />
      <Route path="*" element={<Navigate to={PATHS.home} replace />} />
    </Routes>
  )
}

export default App
