function cn(...parts) {
  return parts.filter(Boolean).join(" ")
}

export default function Container({ className, children, ...props }) {
  return (
    <div
      className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)}
      {...props}
    >
      {children}
    </div>
  )
}
