import { Navigate, Route, Routes } from 'react-router-dom'
import AnimatedAuth from './pages/auth/animated_auth/AnimatedAuth.jsx'
import Home from './pages/home/Home.jsx'

function App() {
  return (
    <Routes>
      <Route path="/auth/login" element={<AnimatedAuth />} />
      <Route path="/auth/signup" element={<AnimatedAuth />} />

      <Route path="/home" element={<Home />} />


      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}

export default App
