import { cn } from '../lib/cn.js'

export default function ValidationError({ message, className, ...props }) {
  if (!message) return null

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn('rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800', className)}
      {...props}
    >
      {message}
    </div>
  )
}

