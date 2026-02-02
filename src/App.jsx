
import { Suspense } from 'react'
import AppRoutes from './routes/AppRoutes.jsx'
import { NotifyProvider } from './components/ui/NotifyProvider.jsx'

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="h-10 w-10 rounded-full border-4 border-gray-200 border-t-green-600 animate-spin" />
    </div>
  )
}

function App() {
  return (
    <NotifyProvider>
      <Suspense fallback={<RouteFallback />}>
        <AppRoutes />
      </Suspense>
    </NotifyProvider>

  )
}

export default App
