import { useState } from 'react'
import { Loader2 } from 'lucide-react'

function cn(...parts) {
  return parts.filter(Boolean).join(' ')
}

function AuthField({ id, label, type = 'text', autoComplete, value, onChange }) {
  return (
    <div className="grid gap-2 text-left">
      <label htmlFor={id} className="text-sm font-medium text-slate-800">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={type}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          className={cn(
            'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition',
            'placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200'
          )}
        />
      </div>
    </div>
  )
}

function PrimaryButton({ children, disabled, pending, className, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
      disabled={disabled || pending}
      {...props}
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Please wait…
        </>
      ) : (
        children
      )}
    </button>
  )
}

export default function LoginForm({ mode, pending, onLogin, onSwitchToSignup }) {
  const [values, setValues] = useState({ email: '', password: '', remember: false })
  const [error, setError] = useState('')
  const isActive = mode === 'login'

  function handleChange(field) {
    return (e) => {
      const next = field === 'remember' ? e.target.checked : e.target.value
      setValues((prev) => ({ ...prev, [field]: next }))
      if (error) setError('')
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    const email = values.email.trim()
    const password = values.password
    if (!email || !password) {
      setError('Email and password are required.')
      return
    }
    if (email.toLowerCase() !== 'demo@demo.com' || password !== 'password') {
      setError('Invalid email or password.')
      return
    }
    onLogin()
  }

  return (
    <form
      className={cn(
        'grid gap-4 transition-all duration-700 ease-in-out',
        isActive
          ? 'opacity-100 translate-y-0'
          : 'pointer-events-none absolute inset-0 opacity-0 -translate-y-4'
      )}
      onSubmit={handleSubmit}
    >
      <AuthField
        id="login_email"
        label="Email"
        type="email"
        autoComplete="email"
        value={values.email}
        onChange={handleChange('email')}
      />
      <AuthField
        id="login_password"
        label="Password"
        type="password"
        autoComplete="current-password"
        value={values.password}
        onChange={handleChange('password')}
      />
      <div className="flex items-center gap-2 text-xs text-slate-600">
        <input
          id="login_remember"
          type="checkbox"
          checked={values.remember}
          onChange={handleChange('remember')}
          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="login_remember">Remember me</label>
      </div>
      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}
      <PrimaryButton type="submit" pending={pending}>
        Sign in
      </PrimaryButton>
      <div className="text-center text-sm text-slate-600">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="font-semibold text-indigo-700 underline-offset-4 hover:underline"
          disabled={pending}
        >
          Sign up
        </button>
      </div>
    </form>
  )
}

