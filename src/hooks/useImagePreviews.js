import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export default function useImagePreviews({ max = 6 } = {}) {
  const [items, setItems] = useState([])
  const [activeIndex, setActiveIndex] = useState(0)
  const itemsRef = useRef(items)

  const active = useMemo(() => items[activeIndex] ?? null, [items, activeIndex])

  const addFiles = useCallback(
    (files) => {
      const next = Array.from(files || []).map((file) => ({ file, url: URL.createObjectURL(file) }))
      setItems((prev) => {
        const merged = [...prev, ...next].slice(0, max)
        return merged
      })
      setActiveIndex((prev) => (prev < 0 && next.length > 0 ? 0 : prev))
    },
    [max]
  )

  const removeAt = useCallback((index) => {
    setItems((prev) => {
      const target = prev[index]
      if (target?.url) URL.revokeObjectURL(target.url)
      return prev.filter((_, i) => i !== index)
    })
    setActiveIndex((prev) => (prev > index ? prev - 1 : prev === index ? 0 : prev))
  }, [])

  useEffect(() => {
    itemsRef.current = items
  }, [items])

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        if (item?.url) URL.revokeObjectURL(item.url)
      })
    }
  }, [])

  return { items, active, activeIndex, setActiveIndex, addFiles, removeAt }
}
