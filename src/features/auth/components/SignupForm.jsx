import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail, UserRound, X } from 'lucide-react'
import { cn } from '../../../shared/lib/cn.js'
import TextField from '../../../shared/ui/TextField.jsx'
import LoadingButton from '../../../shared/ui/LoadingButton.jsx'
import usePasswordVisibility from '../../../shared/hooks/usePasswordVisibility.js'

export default function SignupForm({ mode, pending, onSignup, onSwitchToLogin }) {
  const [values, setValues] = useState({ name: '', email: '', password: '', confirmPassword: '' })
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
    const password = values.password
    if (!agreed) {
      setError('You must agree to the Terms to create an account.')
      return
    }
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
              Terms and Privacy Policy
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
                <div className="text-lg font-semibold text-gray-900">Terms & Privacy Policy</div>
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
              <p>
                By using this service, you agree to provide accurate information. Do not upload
                illegal, offensive, or misleading content. Reports may be reviewed and shared with
                authorized parties for processing.
              </p>
              <p>
                Photos and location help facilitate collection. Ensure you have rights to any images
                you upload and that they comply with file policies. Reward points are granted for valid
                reports and may be adjusted in cases of misuse.
              </p>
              <p>
                We process your data to operate the platform, prevent abuse, and improve services.
                You can request account deletion according to our data policies.
              </p>
              <p className="text-xs text-gray-500">
                This is a summary. Policies may be updated. By closing this dialog and proceeding,
                you acknowledge you have read and agree to the terms.
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
            </div>
          </div>
        </div>
      ) : null}
    </form>
  )
}

