import api from './http/client.js'
import unwrapApiResponse from './http/unwrapApiResponse.js'

const CITIZEN_VOUCHERS_BASE = '/api/citizen/vouchers'
const ENTERPRISE_VOUCHERS_BASE = '/api/enterprise/vouchers'
const REDEEMABLE_CACHE_KEY = 'citizen:redeemableVouchers:v1'

function coerceVoucherArray(value) {
  if (Array.isArray(value)) return value
  if (value && typeof value === 'object') {
    if (Array.isArray(value.items)) return value.items
    if (Array.isArray(value.content)) return value.content
    if (Array.isArray(value.data)) return value.data
  }
  return []
}

function readCachedRedeemableVouchers() {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(REDEEMABLE_CACHE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeCachedRedeemableVouchers(vouchers) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(REDEEMABLE_CACHE_KEY, JSON.stringify(vouchers))
  } catch {
    return
  }
}

function pickBrandName(voucher) {
  const title = voucher?.title || ''
  const firstWord = title.trim().split(/\s+/)[0]
  return firstWord || 'Voucher'
}

function normalizeMyVoucherStatus(status, validUntil) {
  if (status === 'ACTIVE') return 'Active'
  if (status === 'USED') return 'Used'
  if (status === 'EXPIRED') return 'Expired'

  if (validUntil) {
    const d = new Date(validUntil)
    if (!Number.isNaN(d.getTime())) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      d.setHours(0, 0, 0, 0)
      if (d < today) return 'Expired'
    }
  }

  return 'Active'
}

function buildMyVoucherItem(item) {
  const v = item?.voucher || {}
  return {
    id: item?.id,
    voucherId: v?.id,
    brandName: pickBrandName(v),
    logoUrl: v?.logoUrl,
    title: v?.title,
    value: v?.value,
    validDate: v?.validUntil,
    points: item?.pointsSpent ?? v?.pointsRequired ?? 0,
    status: normalizeMyVoucherStatus(item?.status, v?.validUntil),
    code: item?.redemptionCode,
    redeemedAt: item?.redeemedAt,
  }
}

export async function getRedeemableVouchers() {
  try {
    const { data } = await api.get(CITIZEN_VOUCHERS_BASE)
    const result = unwrapApiResponse(data)
    const vouchers = coerceVoucherArray(result)
    writeCachedRedeemableVouchers(vouchers)
    return vouchers
  } catch (err) {
    const cached = readCachedRedeemableVouchers()
    if (cached.length) return cached
    throw err
  }
}

export async function getMyVouchers() {
  const { data } = await api.get(`${CITIZEN_VOUCHERS_BASE}/my`)
  const result = unwrapApiResponse(data) || []
  return Array.isArray(result) ? result.map(buildMyVoucherItem) : []
}

export async function redeemVoucher(voucherOrId) {
  const voucherId = typeof voucherOrId === 'number' ? voucherOrId : voucherOrId?.id
  const { data } = await api.post(`${CITIZEN_VOUCHERS_BASE}/${voucherId}/redeem`)
  return unwrapApiResponse(data)
}

export async function getEnterpriseVouchers(params) {
  const { data } = await api.get(ENTERPRISE_VOUCHERS_BASE, { params })
  return unwrapApiResponse(data) || []
}

export async function getEnterpriseVoucherById(voucherId) {
  const { data } = await api.get(`${ENTERPRISE_VOUCHERS_BASE}/${voucherId}`)
  return unwrapApiResponse(data)
}

export async function createEnterpriseVoucher(formData) {
  const { data } = await api.post(ENTERPRISE_VOUCHERS_BASE, formData)
  return unwrapApiResponse(data)
}

export async function updateEnterpriseVoucher(voucherId, payload) {
  const { data } = await api.put(`${ENTERPRISE_VOUCHERS_BASE}/${voucherId}`, payload)
  return unwrapApiResponse(data)
}

export async function deleteEnterpriseVoucher(voucherId) {
  const { data } = await api.delete(`${ENTERPRISE_VOUCHERS_BASE}/${voucherId}`)
  return unwrapApiResponse(data)
}
