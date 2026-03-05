import { getCitizenPoints } from './rewards.service.js'

export async function getCitizenDashboard() {
  const { totalPoints, monthlyPoints } = await getCitizenPoints()
  return { points: totalPoints, rewardPoints: totalPoints, totalPoints, monthlyPoints }
}

export { getCitizenPoints, getCitizenPointsHistory } from './rewards.service.js'
