import { cn } from '../lib/cn.js'

export default function SelectedChips({ items, onRemove, className }) {
  if (!items?.length) return null

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex items-center gap-2 rounded-full bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 text-sm"
        >
          {item}
          <button
            type="button"
            className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/70 text-green-700 hover:bg-white"
            onClick={() => onRemove(item)}
            aria-label={`Remove ${item}`}
            title={`Remove ${item}`}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  )
}

