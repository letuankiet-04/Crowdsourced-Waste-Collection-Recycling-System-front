import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail, UserRound } from 'lucide-react'
import { cn } from '../../../lib/cn.js'
import TextField from '../../../components/ui/TextField.jsx'
import LoadingButton from '../../../components/ui/LoadingButton.jsx'
import usePasswordVisibility from '../../../hooks/usePasswordVisibility.js'

export default function SignupForm({ mode, pending, onSignup, onSwitchToLogin }) {
  const [values, setValues] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const passwordVisibility = usePasswordVisibility(false)
  const confirmVisibility = usePasswordVisibility(false)
  const [error, setError] = useState('')
  const isActive = mode === 'signup'
  const accent = 'emerald'

  function handleChange(field) {
    return (e) => {
      const next = e.target.value
      setValues((prev) => ({ ...prev, [field]: next }))
      if (error) setError('')
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (pending) return
    const name = values.name.trim()
    const email = values.email.trim()
    const password = values.password
    if (!name || !email || !password) {
      setError('Please fill in all fields.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== values.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    Promise.resolve(onSignup({ name, email, password })).catch((err) => {
      setError(err?.message || 'Signup failed. Please try again.')
    })
  }

  return (
    <form
      className={cn(
        'grid gap-4 transition-all duration-700 ease-in-out',
        isActive ? 'opacity-100 translate-y-0' : 'pointer-events-none absolute inset-0 opacity-0 translate-y-4'
      )}
      onSubmit={handleSubmit}
    >
      <TextField
        id="signup_name"
        label="Full name"
        autoComplete="name"
        value={values.name}
        onChange={handleChange('name')}
        placeholder="Your name"
        disabled={pending}
        leftIcon={UserRound}
        accent={accent}
      />
      <TextField
        id="signup_email"
        label="Email"
        type="email"
        autoComplete="email"
        value={values.email}
        onChange={handleChange('email')}
        placeholder="you@example.com"
        disabled={pending}
        leftIcon={Mail}
        accent={accent}
      />
      <TextField
        id="signup_password"
        label="Password"
        type={passwordVisibility.visible ? 'text' : 'password'}
        autoComplete="new-password"
        value={values.password}
        onChange={handleChange('password')}
        placeholder="At least 6 characters"
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
      <TextField
        id="signup_confirm_password"
        label="Confirm password"
        type={confirmVisibility.visible ? 'text' : 'password'}
        autoComplete="new-password"
        value={values.confirmPassword}
        onChange={handleChange('confirmPassword')}
        placeholder="Re-enter your password"
        disabled={pending}
        leftIcon={Lock}
        accent={accent}
        rightSlot={
          <button
            type="button"
            onClick={confirmVisibility.toggle}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:ring-2 focus:ring-slate-200"
            aria-label={confirmVisibility.visible ? 'Hide password' : 'Show password'}
            disabled={pending}
          >
            {confirmVisibility.visible ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        }
      />
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <span>By signing up, you agree to the Terms and Privacy Policy.</span>
        {onSwitchToLogin ? (
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-semibold text-slate-700 underline-offset-4 transition hover:text-slate-900 hover:underline"
            disabled={pending}
          >
            Login instead
          </button>
        ) : null}
      </div>
      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>
      ) : null}
      <LoadingButton type="submit" loading={pending} accent={accent}>
        Create account
      </LoadingButton>
    </form>
  )
}

