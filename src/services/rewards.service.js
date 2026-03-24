import api from './http/client.js'
import unwrapApiResponse from './http/unwrapApiResponse.js'

const REWARDS_BASE = '/api/citizen/rewards'
const POINTS_SUMMARY_PATH = '/api/citizen/points/summary'

export async function getCitizenPointsHistory(params) {
  const { data } = await api.get(`${REWARDS_BASE}/history`, { params })
  return unwrapApiResponse(data)
}

export async function getCitizenRewardHistory(params) {
  return getCitizenPointsHistory(params)
}

export async function getCitizenPoints() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const { data } = await api.get(POINTS_SUMMARY_PATH, { params: { year, month } })
  const summary = unwrapApiResponse(data) || {}

  const totalPoints = Number(summary.totalPoints)
  const monthlyPoints = Number(summary.earnedPoints)

  return {
    totalPoints: Number.isFinite(totalPoints) ? totalPoints : 0,
    monthlyPoints: Number.isFinite(monthlyPoints) ? monthlyPoints : 0
  }
}

export async function getCitizenPointsSummary() {
  return getCitizenPoints()
}
