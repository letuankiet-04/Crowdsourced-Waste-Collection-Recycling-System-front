import { FileText, Newspaper, Leaf, Battery, Cpu, Magnet, Wine, FlaskConical, Package, Recycle } from 'lucide-react'

export function getIconForCategory(rawName) {
  const name = String(rawName || '').toLowerCase()
  if (name.includes('paper') || name.includes('giấy')) return { Icon: FileText, cls: 'bg-blue-50 text-blue-700 border-blue-100' }
  if (name.includes('newspaper') || name.includes('báo')) return { Icon: Newspaper, cls: 'bg-sky-50 text-sky-700 border-sky-100' }
  if (name.includes('organic') || name.includes('hữu cơ')) return { Icon: Leaf, cls: 'bg-green-50 text-green-700 border-green-100' }
  if (name.includes('battery') || name.includes('pin')) return { Icon: Battery, cls: 'bg-yellow-50 text-yellow-700 border-yellow-100' }
  if (name.includes('e-waste') || name.includes('electronics') || name.includes('điện tử')) return { Icon: Cpu, cls: 'bg-purple-50 text-purple-700 border-purple-100' }
  if (name.includes('iron') || name.includes('steel') || name.includes('sắt') || name.includes('copper') || name.includes('đồng') || name.includes('aluminum') || name.includes('nhôm') || name.includes('metal')) {
    return { Icon: Magnet, cls: 'bg-orange-50 text-orange-700 border-orange-100' }
  }
  if (name.includes('glass') || name.includes('thủy tinh')) return { Icon: Wine, cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' }
  if (name.includes('hazard') || name.includes('nguy hại') || name.includes('chemical')) return { Icon: FlaskConical, cls: 'bg-red-50 text-red-700 border-red-100' }
  if (name.includes('plastic') || name.includes('nhựa') || name.includes('can') || name.includes('lon')) return { Icon: Package, cls: 'bg-cyan-50 text-cyan-700 border-cyan-100' }
  return { Icon: Recycle, cls: 'bg-gray-50 text-gray-700 border-gray-100' }
}
