import { cn } from '../../lib/cn.js'

export default function IconListItem({ icon: Icon, title, description, className, iconClassName }) {
  return (
    <div className={cn('flex items-start gap-4', className)}>
      {Icon ? (
        <span className={cn('inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white', iconClassName)}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      ) : null}
      <div>
        {title ? <h3 className="text-base font-semibold text-slate-900">{title}</h3> : null}
        {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
      </div>
    </div>
  )
}

