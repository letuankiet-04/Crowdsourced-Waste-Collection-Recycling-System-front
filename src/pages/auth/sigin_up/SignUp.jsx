import { useNavigate } from 'react-router-dom'
import SignUpCard from './SignUpCard.jsx'
import SignUpVisual from './SignUpVisual.jsx'

const APP_NAME = 'CrowdRecycle'

export default function SignUp() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl items-stretch px-4 py-10">
        <div className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <section className="flex items-center justify-center">
              <div className="w-full max-w-md">
                <SignUpCard
                  onSuccess={() => {
                    setTimeout(() => navigate('/auth/login'), 350)
                  }}
                />
              </div>
            </section>

            <SignUpVisual appName={APP_NAME} />
          </div>
        </div>
      </div>
    </div>
  )
}

