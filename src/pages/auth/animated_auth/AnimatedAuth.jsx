import { Leaf, Recycle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import foliageBackground from '../../../assets/foliage-bg.svg'
import LoginForm from '../LoginForm.jsx'
import SignupForm from '../SignupForm.jsx'

const APP_NAME = 'CrowdRecycle'

function cn(...parts) {
  return parts.filter(Boolean).join(' ')
}

function DesktopOverlay({ mode, onGoLogin, onGoSignup }) {
  return (
    <div
      className={cn(
        'absolute inset-y-0 left-1/2 z-20 hidden w-1/2 overflow-hidden transition-transform duration-700 ease-in-out lg:block',
        mode === 'signup' ? '-translate-x-full' : 'translate-x-0'
      )}
    >
      <div
        className={cn(
          'absolute inset-0 -left-full flex w-[200%] transition-transform duration-700 ease-in-out',
          mode === 'signup' ? 'translate-x-1/2' : 'translate-x-0'
        )}
      >
        <div className="relative flex w-1/2 items-center justify-center px-10">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-950" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.25),transparent_55%)]" />
          <div className="relative max-w-sm text-center text-white">
            <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
              <Leaf className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="text-3xl font-semibold tracking-tight">Welcome back</div>
            <div className="mt-3 text-sm text-white/80">
              Login to keep tracking collections, pickups, and rewards.
            </div>
            <button
              type="button"
              className="mt-8 inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15 focus:ring-2 focus:ring-white/30"
              onClick={onGoLogin}
            >
              Login
            </button>
          </div>
        </div>

        <div className="relative flex w-1/2 items-center justify-center px-10">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-slate-950" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_55%)]" />
          <div className="relative max-w-sm text-center text-white">
            <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
              <Recycle className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="text-3xl font-semibold tracking-tight">Create your account</div>
            <div className="mt-3 text-sm text-white/80">
              Join the community and start contributing to cleaner cities.
            </div>
            <button
              type="button"
              className="mt-8 inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15 focus:ring-2 focus:ring-white/30"
              onClick={onGoSignup}
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AnimatedAuth() {
  const navigate = useNavigate()
  const location = useLocation()

  const mode = location.pathname.includes('/auth/signup') ? 'signup' : 'login'

  const [pending, setPending] = useState(false)

  const imageSrc = useMemo(() => foliageBackground, [])

  async function simulate(action) {
    setPending(true)
    try {
      await new Promise((r) => setTimeout(r, 900))
      if (action === 'signup') {
        setTimeout(() => navigate('/auth/login'), 600)
      }
    } finally {
      setPending(false)
    }
  }

  function goLogin() {
    if (mode !== 'login') navigate('/auth/login')
  }

  function goSignup() {
    if (mode !== 'signup') navigate('/auth/signup')
  }

  function handleLogin() {
    simulate('login')
  }

  function handleSignup() {
    simulate('signup')
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <img
        src={imageSrc}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-25"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/55 to-slate-950/85" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10">
        <div className="w-full">
          <div className="mb-6 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Leaf className="h-4 w-4 text-emerald-300" aria-hidden="true" />
              <div className="text-sm font-semibold">{APP_NAME}</div>
            </div>
          </div>

          <div className="relative mx-auto w-full overflow-hidden rounded-3xl bg-white/90 shadow-2xl ring-1 ring-white/15 backdrop-blur">
            <div className="relative min-h-[680px] lg:min-h-[620px]">
              <DesktopOverlay
                mode={mode}
                onGoLogin={goLogin}
                onGoSignup={goSignup}
              />

              <div
                className={cn(
                  'relative z-10 w-full transition-transform duration-700 ease-in-out lg:absolute lg:inset-y-0 lg:left-0 lg:w-1/2',
                  mode === 'signup' ? 'lg:translate-x-full' : 'lg:translate-x-0'
                )}
              >
                <div className="px-6 py-10 sm:px-10">
                  <div className="mx-auto max-w-md">
                    <div className="mb-8 flex items-center justify-between gap-4">
                      <div>
                        <div className="text-2xl font-semibold tracking-tight text-slate-900">
                          {mode === 'signup' ? 'Create account' : 'Login'}
                        </div>
                        <div className="mt-1 text-sm text-slate-600">
                          {mode === 'signup'
                            ? 'Create an account to start contributing.'
                            : 'Login to access your account.'}
                        </div>
                      </div>
                      <div
                        className={cn(
                          'flex h-11 w-11 items-center justify-center rounded-2xl ring-1',
                          mode === 'signup'
                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                            : 'bg-indigo-50 text-indigo-700 ring-indigo-100'
                        )}
                      >
                        {mode === 'signup' ? (
                          <Recycle className="h-5 w-5" aria-hidden="true" />
                        ) : (
                          <Leaf className="h-5 w-5" aria-hidden="true" />
                        )}
                      </div>
                    </div>

                    <div className="mb-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-2 py-2 text-sm lg:hidden">
                      <button
                        type="button"
                        onClick={goLogin}
                        className={cn(
                          'flex-1 rounded-xl px-3 py-2 font-semibold transition',
                          mode === 'login'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-700 hover:bg-slate-50'
                        )}
                      >
                        Login
                      </button>
                      <button
                        type="button"
                        onClick={goSignup}
                        className={cn(
                          'flex-1 rounded-xl px-3 py-2 font-semibold transition',
                          mode === 'signup'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-slate-700 hover:bg-slate-50'
                        )}
                      >
                        Sign up
                      </button>
                    </div>

                    <div className="relative">
                      <LoginForm
                        mode={mode}
                        pending={pending}
                        onLogin={handleLogin}
                        onSwitchToSignup={goSignup}
                      />
                      <SignupForm
                        mode={mode}
                        pending={pending}
                        onSignup={handleSignup}
                        onSwitchToLogin={goLogin}
                      />
                    </div>

                    <div className="mt-8 text-xs text-slate-500" />
                  </div>
                </div>
              </div>

              <div className="hidden lg:block">
                <div className="absolute inset-y-0 right-0 w-1/2" aria-hidden="true" />
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-white/70">
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
      </div>
    </div>
  )
}
