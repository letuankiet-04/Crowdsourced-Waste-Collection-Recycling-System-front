import { cn } from '../lib/cn.js'

export default function SectionHeading({ title, description, align = 'center', className }) {
  const alignClasses = align === 'left' ? 'text-left' : 'text-center'

  return (
    <div className={cn('mx-auto max-w-3xl', alignClasses, className)}>
      {title ? (
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
      ) : null}
      {description ? <p className="mt-4 text-slate-600">{description}</p> : null}
    </div>
  )
}

