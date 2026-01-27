import { useMemo, useRef, useState } from 'react'
import { Eye, EyeOff, Loader2, Recycle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function validateEmail(email) {
  const trimmed = email.trim()
  if (!trimmed) return 'Email is required.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Enter a valid email address.'
  return ''
}

function validatePassword(password) {
  if (!password) return 'Password is required.'
  if (password.length < 6) return 'Password must be at least 6 characters.'
  return ''
}

function fieldClasses(hasError) {
  return [
    'w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition',
    'placeholder:text-slate-400',
    hasError
      ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-200'
      : 'border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200',
  ].join(' ')
}

function Banner({ tone, children }) {
  const className =
    tone === 'error'
      ? 'border-rose-200 bg-rose-50 text-rose-800'
      : tone === 'success'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
        : 'border-slate-200 bg-slate-50 text-slate-700'

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${className}`}>{children}</div>
  )
}

export default function LoginCard({ onSuccess }) {
  const navigate = useNavigate()
  const emailRef = useRef(null)
  const passwordRef = useRef(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState({ email: false, password: false })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formInfo, setFormInfo] = useState('')
  const [success, setSuccess] = useState(false)

  const errors = useMemo(() => {
    return {
      email: touched.email ? validateEmail(email) : '',
      password: touched.password ? validatePassword(password) : '',
    }
  }, [email, password, touched.email, touched.password])

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    setFormInfo('')
    setSuccess(false)

    const emailErr = validateEmail(email)
    const passwordErr = validatePassword(password)

    setTouched({ email: true, password: true })

    if (emailErr) {
      emailRef.current?.focus()
      return
    }

    if (passwordErr) {
      passwordRef.current?.focus()
      return
    }

    setSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 900))

      if (email.trim().toLowerCase() === 'demo@demo.com' && password !== 'password') {
        throw new Error('Invalid email or password.')
      }

      if (!rememberMe) {
        setFormInfo('Signed in with a non-persistent session preference.')
      }

      setSuccess(true)
      onSuccess?.()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Sign-in failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Sign in</h2>
          <p className="mt-1 text-sm text-slate-600">Sign in to access your account.</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
          <Recycle className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {formError ? <Banner tone="error">{formError}</Banner> : null}
        {formInfo ? <Banner tone="info">{formInfo}</Banner> : null}
        {success ? <Banner tone="success">Signed in successfully. Redirecting…</Banner> : null}
      </div>

      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="text-sm font-medium text-slate-800">
            Email
          </label>
          <div className="mt-2">
            <input
              ref={emailRef}
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={fieldClasses(Boolean(errors.email))}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (formError) setFormError('')
              }}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              aria-invalid={Boolean(errors.email) || undefined}
              aria-describedby={errors.email ? 'email-error' : undefined}
              disabled={submitting}
            />
          </div>
          <div className="mt-1 min-h-5 text-xs text-rose-700">
            {errors.email ? <span id="email-error">{errors.email}</span> : null}
          </div>
        </div>

        <div>
          <label htmlFor="password" className="text-sm font-medium text-slate-800">
            Password
          </label>

          <div className="relative mt-2">
            <input
              ref={passwordRef}
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              className={[fieldClasses(Boolean(errors.password)), 'pr-11'].join(' ')}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (formError) setFormError('')
              }}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              aria-invalid={Boolean(errors.password) || undefined}
              aria-describedby={errors.password ? 'password-error' : undefined}
              disabled={submitting}
            />

            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 outline-none transition hover:bg-slate-100 hover:text-slate-700 focus:ring-2 focus:ring-indigo-200"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              disabled={submitting}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>

          <div className="mt-1 min-h-5 text-xs text-rose-700">
            {errors.password ? <span id="password-error">{errors.password}</span> : null}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={submitting}
            />
            Remember me
          </label>

          <button
            type="button"
            className="text-sm font-medium text-indigo-700 underline-offset-4 hover:underline"
            onClick={() => setFormInfo('Password recovery is not wired yet.')}
            disabled={submitting}
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </button>

        <div className="text-center text-sm text-slate-600">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            className="font-medium text-indigo-700 underline-offset-4 hover:underline"
            onClick={() => navigate('/auth/signup')}
            disabled={submitting}
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  )
}

