import { cn } from '../../lib/cn.js'

export default function PageHeader({ title, description, className, titleClassName, descriptionClassName }) {
  return (
    <div className={cn('bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-sm border border-white/50', className)}>
      {title ? <h1 className={cn('text-4xl font-bold text-gray-900', titleClassName)}>{title}</h1> : null}
      {description ? <p className={cn('text-gray-600 text-lg mt-2', descriptionClassName)}>{description}</p> : null}
    </div>
  )
}

