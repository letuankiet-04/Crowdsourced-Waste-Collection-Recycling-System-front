import { useMemo, useState } from "react"
import { Star } from "lucide-react"
import { cn } from "../lib/cn.js"

export default function StarRating({
  value,
  onChange,
  name = "rating",
  disabled = false,
  size = "md",
  className,
}) {
  const [hovered, setHovered] = useState(null)

  const currentValue = useMemo(() => {
    const base = Number(value)
    const v = Number.isFinite(base) ? base : 0
    return Math.min(5, Math.max(0, v))
  }, [value])

  const displayValue = hovered != null ? hovered : currentValue

  const iconClass =
    size === "sm" ? "h-4 w-4" : size === "lg" ? "h-7 w-7" : "h-6 w-6"

  return (
    <div
      className={cn("inline-flex items-center gap-1", className)}
      onMouseLeave={() => setHovered(null)}
    >
      {[1, 2, 3, 4, 5].map((r) => {
        const active = r <= displayValue
        const iconColor = active ? "text-amber-400" : "text-gray-300"

        return (
          <label
            key={r}
            className={cn(
              "cursor-pointer select-none",
              disabled && "cursor-not-allowed opacity-60"
            )}
            onMouseEnter={() => (!disabled ? setHovered(r) : undefined)}
          >
            <input
              type="radio"
              name={name}
              value={r}
              checked={currentValue === r}
              onChange={() => (!disabled ? onChange?.(r) : undefined)}
              disabled={disabled}
              className="sr-only"
            />
            <Star
              className={cn(iconClass, iconColor, !disabled && "transition-colors")}
              fill={active ? "currentColor" : "none"}
              strokeWidth={2}
            />
          </label>
        )
      })}
    </div>
  )
}
