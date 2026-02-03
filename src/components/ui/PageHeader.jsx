
import { cn } from '../../lib/cn.js'

export default function PageHeader({ title, description, right, className, titleClassName, descriptionClassName }) {
  return (
    <div className={cn('bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-sm border border-white/50', className)}>
      <div className={cn(right ? 'flex items-start justify-between gap-6' : null)}>
        <div className="min-w-0">
          {title ? <h1 className={cn('text-4xl font-bold text-gray-900', titleClassName)}>{title}</h1> : null}
          {description ? <p className={cn('text-gray-600 text-lg mt-2', descriptionClassName)}>{description}</p> : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
    </div>
  )
}


