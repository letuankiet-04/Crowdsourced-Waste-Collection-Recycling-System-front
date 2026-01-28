import { useState } from 'react'
import { Eye, EyeOff, Loader2, Lock, Mail, UserRound } from 'lucide-react'

function cn(...parts) {
  return parts.filter(Boolean).join(' ')
}

function AuthField({
  id,
  label,
  type = 'text',
  autoComplete,
  value,
  onChange,
  placeholder,
  disabled,
  leftIcon: LeftIcon,
  rightSlot,
  accent = 'indigo',
}) {
  const focusClasses =
    accent === 'emerald'
      ? 'focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200'
      : 'focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200'
  return (
    <div className="grid gap-2 text-left">
      <label htmlFor={id} className="text-sm font-medium text-slate-800">
        {label}
      </label>
      <div className="relative">
        {LeftIcon ? (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <LeftIcon className="h-4 w-4" aria-hidden="true" />
          </div>
        ) : null}
        <input
          id={id}
          name={id}
          type={type}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm text-slate-900 shadow-sm outline-none transition',
            'placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
            LeftIcon ? 'pl-10' : 'pl-3',
            rightSlot ? 'pr-10' : 'pr-3',
            focusClasses
          )}
        />
        {rightSlot ? <div className="absolute inset-y-0 right-0 flex items-center pr-2">{rightSlot}</div> : null}
      </div>
    </div>
  )
}

function PrimaryButton({ children, disabled, pending, className, accent = 'indigo', ...props }) {
  const buttonClasses =
    accent === 'emerald'
      ? 'bg-emerald-700 hover:bg-emerald-600 focus:ring-emerald-300'
      : 'bg-indigo-700 hover:bg-indigo-600 focus:ring-indigo-300'
  return (
    <button
      className={cn(
        'inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-slate-900/25 transition',
        'hover:shadow-lg hover:shadow-slate-900/30 active:translate-y-px',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white',
        'disabled:cursor-not-allowed disabled:opacity-60',
        buttonClasses,
        'sm:w-fit sm:px-10 sm:justify-self-center',
        className
      )}
      disabled={disabled || pending}
      {...props}
    >
      <span className="inline-flex items-center justify-center gap-2">
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Please wait…
          </>
        ) : (
          children
        )}
      </span>
    </button>
  )
}

export default function SignupForm({ mode, pending, onSignup, onSwitchToLogin }) {
  const [values, setValues] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
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
    onSignup({ name, email, password })
  }

  return (
    <form
      className={cn(
        'grid gap-4 transition-all duration-700 ease-in-out',
        isActive
          ? 'opacity-100 translate-y-0'
          : 'pointer-events-none absolute inset-0 opacity-0 translate-y-4'
      )}
      onSubmit={handleSubmit}
    >
      <AuthField
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
      <AuthField
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
      <AuthField
        id="signup_password"
        label="Password"
        type={showPassword ? 'text' : 'password'}
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
            onClick={() => setShowPassword((v) => !v)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:ring-2 focus:ring-slate-200"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            disabled={pending}
          >
            {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
          </button>
        }
      />
      <AuthField
        id="signup_confirm_password"
        label="Confirm password"
        type={showConfirm ? 'text' : 'password'}
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
            onClick={() => setShowConfirm((v) => !v)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:ring-2 focus:ring-slate-200"
            aria-label={showConfirm ? 'Hide password' : 'Show password'}
            disabled={pending}
          >
            {showConfirm ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
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
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}
      <PrimaryButton type="submit" pending={pending} accent={accent}>
        Create account
      </PrimaryButton>
    </form>
  )
}
