import { getCitizenPoints } from './rewards.service.js'
import api from './http/client.js'
import unwrapApiResponse from './http/unwrapApiResponse.js'

const CITIZEN_BASE = '/api/citizen'

export async function getCitizenDashboard() {
  const { totalPoints, monthlyPoints } = await getCitizenPoints()
  return { points: totalPoints, rewardPoints: totalPoints, totalPoints, monthlyPoints }
}

export async function getCitizenLeaderboard(params) {
  const { data } = await api.get(`${CITIZEN_BASE}/leaderboard`, { params: { ...params, limit: params?.limit || 50 } })
  return unwrapApiResponse(data) || []
}

export { getCitizenPoints, getCitizenPointsHistory } from './rewards.service.js'
