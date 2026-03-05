let lockCount = 0
let previousOverflow

export function lockBodyScroll() {
  if (typeof document === 'undefined') return
  const body = document.body
  if (!body) return
  if (lockCount === 0) {
    previousOverflow = body.style.overflow
    body.style.overflow = 'hidden'
  }
  lockCount += 1
}

export function unlockBodyScroll() {
  if (typeof document === 'undefined') return
  const body = document.body
  if (!body) return
  if (lockCount <= 0) {
    lockCount = 0
    return
  }
  lockCount -= 1
  if (lockCount === 0) {
    body.style.overflow = previousOverflow ?? ''
    previousOverflow = undefined
  }
}

