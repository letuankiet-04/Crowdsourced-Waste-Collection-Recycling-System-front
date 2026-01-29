import { cn } from '../../lib/cn.js'

export default function PillSelect({ options, selected, onToggle, className, pillClassName }) {
  return (
    <div className={cn('grid grid-cols-4 gap-3', className)}>
      {options.map((option) => {
        const isSelected = selected.includes(option)
        return (
          <button
            key={option}
            type="button"
            aria-pressed={isSelected}
            className={cn(
              'rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 border transition',
              isSelected
                ? 'bg-green-50 text-green-700 border-green-200 ring-2 ring-green-200'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50',
              pillClassName
            )}
            onClick={() => onToggle(option)}
          >
            <span className="inline-block">{option}</span>
            {isSelected ? (
              <span className="ml-auto inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs">
                ✓
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

