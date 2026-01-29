import { cn } from '../../lib/cn.js'

export default function LoadingButton({
  as: Component = 'button',
  loading,
  loadingText = 'Please wait…',
  accent = 'emerald',
  className,
  children,
  type,
  ...props
}) {
  const accentClasses =
    accent === 'emerald'
      ? 'bg-emerald-700 hover:bg-emerald-600 focus:ring-emerald-300'
      : 'bg-indigo-700 hover:bg-indigo-600 focus:ring-indigo-300'

  const componentProps = Component === 'button' ? { type: type ?? 'button', ...props } : props

  return (
    <Component
      className={cn(
        'inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-slate-900/25 transition',
        'hover:shadow-lg hover:shadow-slate-900/30 active:translate-y-px',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white',
        'disabled:cursor-not-allowed disabled:opacity-60',
        accentClasses,
        'sm:w-fit sm:px-10 sm:justify-self-center',
        className
      )}
      disabled={props.disabled || loading}
      {...componentProps}
    >
      <span className="inline-flex items-center justify-center gap-2">
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" aria-hidden="true" />
            {loadingText}
          </>
        ) : (
          children
        )}
      </span>
    </Component>
  )
}

