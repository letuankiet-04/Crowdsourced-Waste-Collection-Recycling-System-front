import { cn } from '../lib/cn.js'

export default function Button({
  as: Component = "button",
  variant = "primary",
  size = "md",
  className,
  children,
  type,
  ...props
}) {
  const sizeClasses =
    size === "sm"
      ? "h-9 rounded-lg px-3 text-sm"
      : size === "lg"
        ? "h-11 rounded-xl px-5 text-base"
        : "h-10 rounded-xl px-4 text-sm"

  const variantClasses =
    variant === "outline"
      ? "border border-emerald-600 text-emerald-700 hover:bg-emerald-50"
      : "bg-emerald-700 text-white hover:bg-emerald-600"

  const baseClasses =
    "inline-flex items-center justify-center gap-2 font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"

  const componentProps =
    Component === "button"
      ? { type: type ?? "button", ...props }
      : props

  return (
    <Component
      className={cn(baseClasses, sizeClasses, variantClasses, className)}
      {...componentProps}
    >
      {children}
    </Component>
  )
}
