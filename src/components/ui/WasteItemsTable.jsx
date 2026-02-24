import { useMemo } from 'react'
import Button from './Button.jsx'
import { formatWasteTypeUnit } from '../../constants/wasteTypes.js'

function normalizeId(value) {
  if (value === '' || value === null || value === undefined) return null
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isInteger(n) ? n : null
}

export default function WasteItemsTable({ items, wasteTypes, onChange }) {
  const safeItems = useMemo(() => (Array.isArray(items) ? items : []), [items])
  const safeTypes = useMemo(() => (Array.isArray(wasteTypes) ? wasteTypes : []), [wasteTypes])

  const selectedIds = useMemo(() => {
    return safeItems.map((i) => normalizeId(i?.wasteTypeId)).filter((id) => id != null)
  }, [safeItems])

  const canAddMore = selectedIds.length < safeTypes.length

  const updateItem = (index, patch) => {
    const next = safeItems.map((it, idx) => {
      if (idx !== index) return it
      return { ...(it || {}), ...(patch || {}) }
    })
    onChange?.(next)
  }

  const addRow = () => {
    if (!canAddMore) return
    onChange?.([...safeItems, { wasteTypeId: null, estimatedWeight: '' }])
  }

  const removeRow = (index) => {
    const next = safeItems.filter((_, idx) => idx !== index)
    onChange?.(next)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-gray-500 uppercase">Waste Items</h4>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={addRow}
          disabled={!canAddMore}
        >
          + Add
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Name</th>
              <th className="px-4 py-3 text-left font-semibold">Estimated weight</th>
              <th className="px-4 py-3 text-right font-semibold w-12"> </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {safeItems.length ? (
              safeItems.map((item, idx) => {
                const currentId = normalizeId(item?.wasteTypeId)
                const available = safeTypes.filter((t) => {
                  const tid = normalizeId(t?.id)
                  if (tid == null) return false
                  if (tid === currentId) return true
                  return !selectedIds.includes(tid)
                })

                const selected = safeTypes.find((t) => normalizeId(t?.id) === currentId) ?? null
                const unitLabel = selected?.unit ? formatWasteTypeUnit(selected.unit) : ''
                const weightPlaceholder = unitLabel ? unitLabel : 'kg'

                return (
                  <tr key={idx} className="align-top">
                    <td className="px-4 py-3">
                      <select
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-200"
                        value={currentId ?? ''}
                        onChange={(e) => {
                          const nextId = normalizeId(e.target.value)
                          updateItem(idx, { wasteTypeId: nextId })
                        }}
                      >
                        <option value="">Select waste type</option>
                        {available.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-200"
                          placeholder={weightPlaceholder}
                          value={item?.estimatedWeight ?? ''}
                          onChange={(e) => {
                            updateItem(idx, { estimatedWeight: e.target.value })
                          }}
                        />
                        {unitLabel ? <div className="text-xs text-gray-500 min-w-10">{unitLabel}</div> : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => removeRow(idx)}
                        aria-label="Remove row"
                        title="Remove row"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-5 text-gray-500">
                  No waste items added yet. Click “+ Add” to start.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
