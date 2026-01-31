import { useContext } from 'react'
import { NotifyContext } from '../notifications/notifyCore.js'

export default function useNotify() {
  const ctx = useContext(NotifyContext)
  if (!ctx) throw new Error('useNotify must be used within <NotifyProvider>')
  return ctx
}

