import { cn } from '../../lib/cn.js'

export default function IconFeatureCard({ title, description, icon: Icon, className, iconClassName }) {
  return (
    <div className={cn('rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm', className)}>
      {Icon ? (
        <div className={cn('inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700', iconClassName)}>
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
      ) : null}
      {title ? <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3> : null}
      {description ? <p className="mt-2 text-slate-600">{description}</p> : null}
    </div>
  )
}

