import { Link, useNavigate } from 'react-router-dom'
import LoginCard from './LoginCard.jsx'
import LoginVisual from './LoginVisual.jsx'

const APP_NAME = 'CrowdRecycle'

export default function Login() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl items-stretch px-4 py-10">
        <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
          <LoginVisual appName={APP_NAME} />

          <section className="flex items-center justify-center">
            <div className="w-full max-w-md">
              <LoginCard
                onSuccess={() => {
                  setTimeout(() => navigate('/'), 350)
                }}
              />

              <div className="mt-6 text-center text-xs text-slate-500">
                By continuing you agree to the{' '}
                <Link className="underline-offset-4 hover:underline" to="/">
                  Terms
                </Link>{' '}
                and{' '}
                <Link className="underline-offset-4 hover:underline" to="/">
                  Privacy Policy
                </Link>
                .
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

