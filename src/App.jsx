import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/auth/Login.jsx'

function App() {
  return (
    <Routes>
      <Route path="/auth/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/auth/login" replace />} />
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  )
}

export default App
