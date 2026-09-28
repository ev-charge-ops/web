import { CircleAlert, CircleCheck, Info, X } from 'lucide-react'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import { cn } from '@/utils/cn'

import styles from './toast.module.css'
import {
  ToastContext,
  type ToastContextValue,
  type ToastOptions,
  type ToastTone,
} from './use-toast'

type ToastItem = {
  id: number
  message: string
  tone: ToastTone
}

const toneIcons = {
  success: CircleCheck,
  error: CircleAlert,
  info: Info,
} satisfies Record<ToastTone, unknown>

const defaultDurationMs = 4000

type ToastProviderProps = {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(0)
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>())

  const dismissToast = useCallback((id: number) => {
    clearTimeout(timers.current.get(id))
    timers.current.delete(id)
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    ({ message, tone = 'success', durationMs = defaultDurationMs }: ToastOptions) => {
      nextId.current += 1
      const id = nextId.current
      setToasts((current) => [...current, { id, message, tone }])
      timers.current.set(
        id,
        setTimeout(() => dismissToast(id), durationMs),
      )
    },
    [dismissToast],
  )

  useEffect(() => {
    const activeTimers = timers.current
    return () => activeTimers.forEach(clearTimeout)
  }, [])

  const value = useMemo<ToastContextValue>(
    () => ({ showToast, dismissToast }),
    [showToast, dismissToast],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.viewport} role="status" aria-live="polite">
        {toasts.map(({ id, message, tone }) => {
          const Icon = toneIcons[tone]
          return (
            <div
              key={id}
              data-surface="night"
              className={cn(styles.toast, styles[tone])}
            >
              <Icon size={16} strokeWidth={2} className={styles.icon} aria-hidden />
              <span className={styles.message}>{message}</span>
              <button
                type="button"
                className={styles.close}
                aria-label="Fechar aviso"
                onClick={() => dismissToast(id)}
              >
                <X size={14} strokeWidth={2} aria-hidden />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
