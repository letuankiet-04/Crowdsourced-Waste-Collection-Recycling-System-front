import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { cn } from '../../../shared/lib/cn.js'
import TextField from '../../../shared/ui/TextField.jsx'
import LoadingButton from '../../../shared/ui/LoadingButton.jsx'
import usePasswordVisibility from '../../../shared/hooks/usePasswordVisibility.js'

const REMEMBER_LOGIN_KEY = 'remember_login'

export default function LoginForm({ mode, pending, onLogin, onSwitchToSignup }) {
  const [values, setValues] = useState(() => {
    const defaults = { email: '', password: '', remember: false }
    try {
      const raw = window.localStorage.getItem(REMEMBER_LOGIN_KEY)
      if (!raw) return defaults
      const parsed = JSON.parse(raw)
      const rememberedEmail = typeof parsed?.email === 'string' ? parsed.email : ''
      if (!rememberedEmail) return defaults
      return { ...defaults, email: rememberedEmail, remember: true }
    } catch {
      window.localStorage.removeItem(REMEMBER_LOGIN_KEY)
      return defaults
    }
  })
  const passwordVisibility = usePasswordVisibility(false)
  const [error, setError] = useState('')
  const isActive = mode === 'login'
  const accent = 'indigo'
  const checkboxClasses =
    accent === 'emerald'
      ? 'h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500'
      : 'h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500'

  function handleChange(field) {
    return (e) => {
      const next = field === 'remember' ? e.target.checked : e.target.value
      setValues((prev) => ({ ...prev, [field]: next }))
      if (field === 'remember' && !next) window.localStorage.removeItem(REMEMBER_LOGIN_KEY)
      if (error) setError('')
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (pending) return
    const email = values.email.trim()
    const password = values.password
    if (!email || !password) {
      setError('Email and password are required.')
      return
    }
    if (values.remember) {
      window.localStorage.setItem(REMEMBER_LOGIN_KEY, JSON.stringify({ email }))
    } else {
      window.localStorage.removeItem(REMEMBER_LOGIN_KEY)
    }
    onLogin({ email, password, remember: values.remember }).catch((err) => {
      setError(err.message || 'Login failed. Please try again.')
    })
  }

  return (
    <form
      className={cn(
        'grid gap-4 transition-all duration-700 ease-in-out',
        isActive ? 'opacity-100 translate-y-0' : 'pointer-events-none absolute inset-0 opacity-0 -translate-y-4'
      )}
      onSubmit={handleSubmit}
    >
      <TextField
        id="login_email"
        label="Email"
        type="email"
        name="username"
        autoComplete="username"
        value={values.email}
        onChange={handleChange('email')}
        placeholder="you@example.com"
        disabled={pending}
        leftIcon={Mail}
        accent={accent}
      />
      <TextField
        id="login_password"
        label="Password"
        type={passwordVisibility.visible ? 'text' : 'password'}
        name="password"
        autoComplete="current-password"
        value={values.password}
        onChange={handleChange('password')}
        placeholder="Enter your password"
        disabled={pending}
        leftIcon={Lock}
        accent={accent}
        rightSlot={
          <button
            type="button"
            onClick={passwordVisibility.toggle}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:ring-2 focus:ring-slate-200"
            aria-label={passwordVisibility.visible ? 'Hide password' : 'Show password'}
            disabled={pending}
          >
            {passwordVisibility.visible ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        }
      />
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <input
            id="login_remember"
            type="checkbox"
            checked={values.remember}
            onChange={handleChange('remember')}
            className={checkboxClasses}
            disabled={pending}
          />
          <label htmlFor="login_remember">Remember me</label>
        </div>
        {onSwitchToSignup ? (
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="font-semibold text-slate-700 underline-offset-4 transition hover:text-slate-900 hover:underline"
            disabled={pending}
          >
            Create an account
          </button>
        ) : null}
      </div>
      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>
      ) : null}
      <LoadingButton type="submit" loading={pending} accent={accent}>
        Login
      </LoadingButton>
    </form>
  )
}

