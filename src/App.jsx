import { Navigate, Route, Routes } from 'react-router-dom'
import AnimatedAuth from './pages/auth/animated_auth/AnimatedAuth.jsx'

function App() {
  return (
    <Routes>
      <Route path="/auth/login" element={<AnimatedAuth />} />
      <Route path="/auth/signup" element={<AnimatedAuth />} />
      <Route path="/" element={<Navigate to="/auth/login" replace />} />
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  )
}

export default App
