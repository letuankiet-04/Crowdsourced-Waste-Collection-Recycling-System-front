export const WASTE_TYPE_OPTIONS = [
  { id: 1, name: 'Paper', unit: 'KG' },
  { id: 2, name: 'Newspaper', unit: 'KG' },
  { id: 3, name: 'Office paper', unit: 'KG' },
  { id: 4, name: 'Notebook paper', unit: 'KG' },
  { id: 5, name: 'Beer can', unit: 'CAN' },
  { id: 6, name: 'Iron', unit: 'KG' },
  { id: 7, name: 'Iron can', unit: 'KG' },
  { id: 8, name: 'Stainless steel', unit: 'KG' },
  { id: 9, name: 'Copper', unit: 'KG' },
  { id: 10, name: 'Aluminum', unit: 'KG' },
  { id: 11, name: 'Glass bottle', unit: 'BOTTLE' },
  { id: 12, name: 'Packaging / box', unit: 'KG' },
  { id: 13, name: 'Mica', unit: 'KG' },
  { id: 14, name: 'Helmet', unit: 'KG' },
  { id: 15, name: 'Gas cylinder helmet', unit: 'KG' },
  { id: 16, name: 'Roofing helmet', unit: 'KG' },
  { id: 17, name: 'Black helmet', unit: 'KG' },
]

export function formatWasteTypeUnit(unit) {
  const u = unit ? String(unit).trim().toUpperCase() : ''
  if (!u) return ''
  if (u === 'KG') return 'kg'
  if (u === 'CAN') return 'can'
  if (u === 'BOTTLE') return 'bottle'
  return u.toLowerCase()
}
