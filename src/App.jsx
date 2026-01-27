import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/auth/login/Login.jsx'
import SignUp from './pages/auth/sigin_up/SignUp.jsx'

function App() {
  return (
    <Routes>
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/signup" element={<SignUp />} />
      <Route path="/" element={<Navigate to="/auth/login" replace />} />
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  )
}

export default App
