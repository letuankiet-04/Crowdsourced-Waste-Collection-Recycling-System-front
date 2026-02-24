export default function unwrapApiResponse(data) {
  if (data && typeof data === 'object' && 'result' in data) return data.result
  return data
}
