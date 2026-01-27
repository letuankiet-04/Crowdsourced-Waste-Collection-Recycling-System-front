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

export default function SignupForm({ mode, pending, onSignup }) {
  const [values, setValues] = useState({ name: '', email: '', password: '' })
  const isActive = mode === 'signup'

  function handleChange(field) {
    return (e) => {
      const next = e.target.value
      setValues((prev) => ({ ...prev, [field]: next }))
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSignup()
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
      />
      <AuthField
        id="signup_email"
        label="Email"
        type="email"
        autoComplete="email"
        value={values.email}
        onChange={handleChange('email')}
      />
      <AuthField
        id="signup_password"
        label="Password"
        type="password"
        autoComplete="new-password"
        value={values.password}
        onChange={handleChange('password')}
      />
      <PrimaryButton
        type="submit"
        pending={pending}
        className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-200"
      >
        Create account
      </PrimaryButton>
    </form>
  )
}
