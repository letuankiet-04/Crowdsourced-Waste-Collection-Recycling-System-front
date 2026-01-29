import { Navigate, Route, Routes } from 'react-router-dom'
import AnimatedAuth from './pages/auth/animated_auth/AnimatedAuth.jsx'
import Home from './pages/home/Home.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import CitizenDashboard from './pages/role/citizen/Citizen_Dashboard.jsx'
import CreateReport from './pages/role/citizen/CreateReport.jsx'
import CollectorDashboard from './pages/role/collector/Collector_Dashboard.jsx'
import EnterpriseDashboard from './pages/role/enterprise/Enterprise_Dashboard.jsx'
import AdminDashboard from './pages/role/admin/Admin_Dashboard.jsx'
import Unauthorized from './pages/common/Unauthorized.jsx'

function App() {
  return (
    <Routes>
      {/* Auth*/}
      <Route path="/auth/login" element={<AnimatedAuth />} />
      <Route path="/auth/signup" element={<AnimatedAuth />} />
      <Route path="/home" element={<Home />} />
      {/* Role - based page */}
      <Route path="/citizen/dashboard" element={<ProtectedRoute role={['citizen']}><CitizenDashboard /></ProtectedRoute>} />
     
      <Route path="/create-report" element={<CreateReport />} />
      <Route path="/collector/dashboard" element={<ProtectedRoute role={['collector']}><CollectorDashboard /></ProtectedRoute>} />
      <Route path="/enterprise/dashboard" element={<ProtectedRoute role={['enterprise']}><EnterpriseDashboard /></ProtectedRoute>} />
      <Route path="/admin/dashboard" element={<ProtectedRoute role={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      {/* Fall back */}
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}

export default App
