import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail, Phone, UserRound, X } from 'lucide-react'
import { cn } from '../../../shared/lib/cn.js'
import TextField from '../../../shared/ui/TextField.jsx'
import LoadingButton from '../../../shared/ui/LoadingButton.jsx'
import usePasswordVisibility from '../../../shared/hooks/usePasswordVisibility.js'

export default function SignupForm({ mode, pending, onSignup, onSwitchToLogin }) {
  const [values, setValues] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const passwordVisibility = usePasswordVisibility(false)
  const confirmVisibility = usePasswordVisibility(false)
  const [error, setError] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
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
    const phone = values.phone.trim()
    const password = values.password
    if (!agreed) {
      setError('You must agree to the Terms of Service and Privacy Policy to create an account.')
      return
    }
    if (!name || !email || !phone || !password) {
      setError('Please fill in all fields.')
      return
    }
    if (!/^\+?\d{9,15}$/.test(phone)) {
      setError('Please enter a valid phone number.')
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
    Promise.resolve(onSignup({ name, email, phone, password })).catch((err) => {
      setError(err?.message || 'Signup failed. Please try again.')
    })
  }

  return (
    <form
      className={cn(
        'grid gap-3 transition-all duration-700 ease-in-out',
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
        id="signup_phone"
        label="Phone number"
        type="tel"
        autoComplete="tel"
        value={values.phone}
        onChange={handleChange('phone')}
        placeholder="e.g. 0912345678"
        disabled={pending}
        leftIcon={Phone}
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
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-300"
            checked={agreed}
            onChange={(e) => {
              setAgreed(e.target.checked)
              if (error) setError('')
            }}
            disabled={pending}
          />
          <span>
            By signing up, you agree to the{' '}
            <button
              type="button"
              onClick={() => setShowTerms(true)}
              className="font-semibold text-emerald-700 underline-offset-4 hover:text-emerald-800 hover:underline"
            >
              Terms of Service and Privacy Policy
            </button>
            .
          </span>
        </label>
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
      <LoadingButton type="submit" loading={pending} accent={accent} disabled={!agreed}>
        Create account
      </LoadingButton>
      {showTerms ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowTerms(false)
          }}
        >
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5">
            <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100">
              <div className="min-w-0">
                <div className="text-lg font-semibold text-gray-900">Terms of Service & Privacy Policy</div>
                <div className="mt-1 text-sm text-gray-600">
                  Please review these terms before creating your account.
                </div>
              </div>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-50"
                onClick={() => setShowTerms(false)}
                aria-label="Close"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="max-h-[65vh] overflow-y-auto px-6 py-5 text-sm leading-6 text-gray-700 space-y-4">
              <p className="text-gray-800">
                By creating an account, you agree to the terms below. These terms summarize our{' '}
                <a href="#" className="text-emerald-700 font-semibold hover:underline">Terms of Service</a>{' '}
                and{' '}
                <a href="#" className="text-emerald-700 font-semibold hover:underline">Privacy Policy</a>.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Provide accurate information and do not submit illegal, harmful, or misleading content.</li>
                <li>Photos and location data help coordinate collection. Only upload images you have rights to.</li>
                <li>File uploads must follow platform rules (type and size limits). Violations may lead to removal.</li>
                <li>Reward points are issued for valid reports and may be adjusted in cases of misuse or fraud.</li>
                <li>We process your data to operate, secure, and improve the service, and to prevent abuse.</li>
                <li>You may request account deletion as described in our data practices.</li>
                <li>We may update these terms; continued use after updates signifies acceptance of the changes.</li>
              </ul>
              <p className="text-xs text-gray-500">
                This summary is provided for convenience. Please refer to the full policies for complete terms.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3 px-6 py-5 border-t border-gray-100">
              <button
                type="button"
                className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                onClick={() => setShowTerms(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                onClick={() => {
                  setAgreed(true)
                  setShowTerms(false)
                  if (error) setError('')
                }}
              >
                Agree and Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  )
}

