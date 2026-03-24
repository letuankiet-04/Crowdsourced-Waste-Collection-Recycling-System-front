import { cn } from '../lib/cn.js'

export default function TextField({
  id,
  label,
  type = 'text',
  autoComplete,
  value,
  onChange,
  onBlur,
  placeholder,
  disabled,
  leftIcon: LeftIcon,
  rightSlot,
  accent = 'emerald',
  className,
  inputClassName,
}) {
  const focusClasses =
    accent === 'emerald'
      ? 'focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200'
      : 'focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200'

  return (
    <div className={cn('grid gap-2 text-left', className)}>
      {label ? (
        <label htmlFor={id} className="text-sm font-medium text-slate-800">
          {label}
        </label>
      ) : null}
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
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm text-slate-900 shadow-sm outline-none transition',
            'placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
            LeftIcon ? 'pl-10' : 'pl-3',
            rightSlot ? 'pr-10' : 'pr-3',
            focusClasses,
            inputClassName
          )}
        />
        {rightSlot ? <div className="absolute inset-y-0 right-0 flex items-center pr-2">{rightSlot}</div> : null}
      </div>
    </div>
  )
}

