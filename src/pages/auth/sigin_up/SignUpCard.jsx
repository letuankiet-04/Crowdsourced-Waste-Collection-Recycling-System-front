import { useMemo, useRef, useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'

function validateUsername(username) {
  const trimmed = username.trim()
  if (!trimmed) return 'Username is required.'
  if (trimmed.length < 3) return 'Username must be at least 3 characters.'
  return ''
}

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

function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) return 'Confirm your password.'
  if (confirmPassword !== password) return 'Passwords do not match.'
  return ''
}

function validateOtp(otp) {
  const trimmed = otp.trim()
  if (!trimmed) return 'OTP is required.'
  if (!/^\d{6}$/.test(trimmed)) return 'OTP must be 6 digits.'
  return ''
}

function fieldClasses(hasError) {
  return [
    'w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition',
    'placeholder:text-slate-400',
    hasError
      ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-200'
      : 'border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200',
  ].join(' ')
}

function Banner({ tone, children }) {
  const className =
    tone === 'error'
      ? 'border-rose-200 bg-rose-50 text-rose-800'
      : tone === 'success'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
        : 'border-slate-200 bg-slate-50 text-slate-700'

  return <div className={`rounded-xl border px-4 py-3 text-sm ${className}`}>{children}</div>
}

export default function SignUpCard({ onSuccess }) {
  const usernameRef = useRef(null)
  const passwordRef = useRef(null)
  const confirmPasswordRef = useRef(null)
  const emailRef = useRef(null)
  const otpRef = useRef(null)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [touched, setTouched] = useState({
    username: false,
    password: false,
    confirmPassword: false,
    email: false,
    otp: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState(false)

  const errors = useMemo(
    () => ({
      username: touched.username ? validateUsername(username) : '',
      password: touched.password ? validatePassword(password) : '',
      confirmPassword: touched.confirmPassword ? validateConfirmPassword(password, confirmPassword) : '',
      email: touched.email ? validateEmail(email) : '',
      otp: touched.otp ? validateOtp(otp) : '',
    }),
    [username, password, confirmPassword, email, otp, touched],
  )

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    setSuccess(false)

    setTouched({ username: true, password: true, confirmPassword: true, email: true, otp: true })

    const usernameErr = validateUsername(username)
    const passwordErr = validatePassword(password)
    const confirmErr = validateConfirmPassword(password, confirmPassword)
    const emailErr = validateEmail(email)
    const otpErr = validateOtp(otp)

    if (usernameErr) {
      usernameRef.current?.focus()
      return
    }
    if (passwordErr) {
      passwordRef.current?.focus()
      return
    }
    if (confirmErr) return confirmPasswordRef.current?.focus()
    if (emailErr) {
      emailRef.current?.focus()
      return
    }
    if (otpErr) {
      otpRef.current?.focus()
      return
    }

    setSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 900))

      if (email.trim().toLowerCase() === 'demo@demo.com' && otp.trim() !== '123456') {
        throw new Error('Invalid OTP for this email.')
      }

      setSuccess(true)
      onSuccess?.()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Sign up failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-8">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Create new account</h2>
        <p className="mt-2 text-sm text-slate-600">Join our community and start your journey today.</p>
      </div>

      <div className="mt-6 grid gap-3">
        {formError ? <Banner tone="error">{formError}</Banner> : null}
        {success ? <Banner tone="success">Account created successfully. Redirecting…</Banner> : null}
      </div>

      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username" className="text-sm font-medium text-slate-800">
            Username
          </label>
          <div className="mt-2">
            <input
              ref={usernameRef}
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              placeholder="johndoe"
              className={fieldClasses(Boolean(errors.username))}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                if (formError) setFormError('')
              }}
              onBlur={() => setTouched((t) => ({ ...t, username: true }))}
              aria-invalid={Boolean(errors.username) || undefined}
              aria-describedby={errors.username ? 'username-error' : undefined}
              disabled={submitting}
            />
          </div>
          <div className="mt-1 min-h-5 text-xs text-rose-700">
            {errors.username ? <span id="username-error">{errors.username}</span> : null}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="password" className="text-sm font-medium text-slate-800">
              Password
            </label>
            <div className="relative mt-2">
              <input
                ref={passwordRef}
                id="password"
                name="password"
                type={showPasswords ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
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
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 outline-none transition hover:bg-slate-100 hover:text-slate-700 focus:ring-2 focus:ring-emerald-200"
                onClick={() => setShowPasswords((s) => !s)}
                aria-label={showPasswords ? 'Hide password' : 'Show password'}
                disabled={submitting}
              >
                {showPasswords ? (
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

          <div>
            <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-800">
              Confirm Password
            </label>
            <div className="mt-2">
              <input
                ref={confirmPasswordRef}
                id="confirmPassword"
                name="confirmPassword"
                type={showPasswords ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                className={fieldClasses(Boolean(errors.confirmPassword))}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (formError) setFormError('')
                }}
                onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))}
                aria-invalid={Boolean(errors.confirmPassword) || undefined}
                aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                disabled={submitting}
              />
            </div>
            <div className="mt-1 min-h-5 text-xs text-rose-700">
              {errors.confirmPassword ? (
                <span id="confirmPassword-error">{errors.confirmPassword}</span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_140px]">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-slate-800">
              Email Address
            </label>
            <div className="mt-2">
              <input
                ref={emailRef}
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="name@company.com"
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
            <label htmlFor="otp" className="text-sm font-medium text-slate-800">
              OTP
            </label>
            <div className="mt-2">
              <input
                ref={otpRef}
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                className={fieldClasses(Boolean(errors.otp))}
                value={otp}
                onChange={(e) => {
                  const next = e.target.value.replace(/\D/g, '').slice(0, 6)
                  setOtp(next)
                  if (formError) setFormError('')
                }}
                onBlur={() => setTouched((t) => ({ ...t, otp: true }))}
                aria-invalid={Boolean(errors.otp) || undefined}
                aria-describedby={errors.otp ? 'otp-error' : undefined}
                disabled={submitting}
              />
            </div>
            <div className="mt-1 min-h-5 text-xs text-rose-700">
              {errors.otp ? <span id="otp-error">{errors.otp}</span> : null}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-900 focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Signing up…
            </>
          ) : (
            'Sign Up'
          )}
        </button>

        <div className="text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link
            className="font-medium text-emerald-700 underline-offset-4 hover:underline"
            to="/auth/login"
          >
            Log in
          </Link>
        </div>

        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-400">
          <Link className="hover:text-slate-600" to="/">
            Privacy Policy
          </Link>
          <Link className="hover:text-slate-600" to="/">
            Terms of Service
          </Link>
          <Link className="hover:text-slate-600" to="/">
            Help Center
          </Link>
        </div>
      </form>
    </div>
  )
}

