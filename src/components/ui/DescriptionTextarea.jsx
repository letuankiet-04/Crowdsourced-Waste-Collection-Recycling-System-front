import { useCallback } from "react"

export default function DescriptionTextarea({ value = "", onChange, max = 500 }) {
  const handleChange = useCallback(
    (e) => {
      const next = e.target.value
      if (onChange) onChange(next)
    },
    [onChange]
  )

  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={handleChange}
        maxLength={max}
        className="w-full min-h-[120px] px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-200 resize-y transition"
        placeholder="Describe the situation or provide extra context..."
      />
      <div className="flex justify-end">
        <span className="text-sm text-gray-500">{value.length} / {max}</span>
      </div>
    </div>
  )
}
