export default class ApiError extends Error {
  constructor(message, { status = null, data = null, url = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
    this.url = url
  }
}
