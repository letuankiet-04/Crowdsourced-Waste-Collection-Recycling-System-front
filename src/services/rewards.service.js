import api from './http/client.js'
import unwrapApiResponse from './http/unwrapApiResponse.js'

const REWARDS_BASE = '/api/citizen/rewards'

export async function getCitizenPointsHistory(params) {
  const { data } = await api.get(`${REWARDS_BASE}/history`, { params })
  return unwrapApiResponse(data)
}

export async function getCitizenRewardHistory(params) {
  return getCitizenPointsHistory(params)
}

export async function getCitizenPoints() {
  const { data } = await api.get(`${REWARDS_BASE}/history`)
  const history = unwrapApiResponse(data) || []

  const totalPoints = history.reduce((sum, item) => sum + (item.point || 0), 0)

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const monthlyPoints = history.reduce((sum, item) => {
    const date = new Date(item.createdAt)
    if (date.getMonth() === currentMonth && date.getFullYear() === currentYear && item.point > 0) {
      return sum + item.point
    }
    return sum
  }, 0)

  return { totalPoints, monthlyPoints }
}

export async function getCitizenPointsSummary() {
  return getCitizenPoints()
}
