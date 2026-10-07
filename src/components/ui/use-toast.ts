import { createContext, useContext } from 'react'

export type ToastTone = 'success' | 'error' | 'info'

export type ToastOptions = {
  message: string
  tone?: ToastTone
  durationMs?: number
}

export type ToastContextValue = {
  showToast: (options: ToastOptions) => void
  dismissToast: (id: number) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
