export const WASTE_TYPE_OPTIONS = [
  { id: 1, name: 'Giấy', unit: 'KG' },
  { id: 2, name: 'Báo', unit: 'KG' },
  { id: 3, name: 'Giấy, hồ sơ', unit: 'KG' },
  { id: 4, name: 'Giấy tập', unit: 'KG' },
  { id: 5, name: 'Lon bia', unit: 'CAN' },
  { id: 6, name: 'Sắt', unit: 'KG' },
  { id: 7, name: 'Sắt lon', unit: 'KG' },
  { id: 8, name: 'Inox', unit: 'KG' },
  { id: 9, name: 'Đồng', unit: 'KG' },
  { id: 10, name: 'Nhôm', unit: 'KG' },
  { id: 11, name: 'Chai thủy tinh', unit: 'BOTTLE' },
  { id: 12, name: 'Bao bì, hỗn hợp', unit: 'KG' },
  { id: 13, name: 'Meca', unit: 'KG' },
  { id: 14, name: 'Mũ', unit: 'KG' },
  { id: 15, name: 'Mũ bình', unit: 'KG' },
  { id: 16, name: 'Mũ tôn', unit: 'KG' },
  { id: 17, name: 'Mũ đen', unit: 'KG' },
]

export function formatWasteTypeUnit(unit) {
  const u = unit ? String(unit).trim().toUpperCase() : ''
  if (!u) return ''
  if (u === 'KG') return 'kg'
  if (u === 'CAN') return 'can'
  if (u === 'BOTTLE') return 'bottle'
  return u.toLowerCase()
}
