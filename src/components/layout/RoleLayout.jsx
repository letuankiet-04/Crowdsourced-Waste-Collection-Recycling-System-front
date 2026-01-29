import { cn } from '../../lib/cn.js'

function DefaultBackgroundEffects() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-[0.4]" />
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-green-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-emerald-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-lime-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
    </div>
  )
}

export default function RoleLayout({
  sidebar,
  navbar,
  children,
  footer,
  showBackgroundEffects = false,
  backgroundEffects,
  contentOffsetClassName = 'ml-72',
  className,
}) {
  return (
    <div className={cn('min-h-screen bg-gray-50 font-sans text-gray-900 flex relative overflow-hidden', className)}>
      {showBackgroundEffects ? backgroundEffects ?? <DefaultBackgroundEffects /> : null}
      {sidebar}
      <div className={cn('flex-1 relative z-10', contentOffsetClassName)}>
        {navbar}
        <main className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 py-10">
          {children}
          {footer}
        </main>
      </div>
    </div>
  )
}

