import { X } from 'lucide-react'
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

import { useDismissOnEscape } from '@/hooks/use-dismiss-on-escape'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'

import styles from './drawer.module.css'

const drawerExitMs = 320

type DrawerContent = {
  title: string
  eyebrow?: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
}

type DrawerProps = DrawerContent & {
  isOpen: boolean
  onClose: () => void
}

export function Drawer({ isOpen, onClose, ...content }: DrawerProps) {
  const titleId = useId()
  const descriptionId = useId()
  const prefersReducedMotion = usePrefersReducedMotion()
  const [wasOpen, setWasOpen] = useState(isOpen)
  const [isLeaving, setIsLeaving] = useState(false)
  const lastContent = useRef<DrawerContent>(content)
  useDismissOnEscape(isOpen, onClose)

  if (wasOpen !== isOpen) {
    setWasOpen(isOpen)
    setIsLeaving(!isOpen && !prefersReducedMotion)
  }

  useLayoutEffect(() => {
    if (isOpen) lastContent.current = content
  })

  useEffect(() => {
    if (!isLeaving) return
    const timeout = setTimeout(() => setIsLeaving(false), drawerExitMs)
    return () => clearTimeout(timeout)
  }, [isLeaving])

  if (!isOpen && !isLeaving) return null

  const { title, eyebrow, description, children, footer } = isOpen
    ? content
    : lastContent.current

  return createPortal(
    <div
      className={styles.drawer}
      data-state={isOpen ? 'open' : 'closing'}
      aria-hidden={isOpen ? undefined : true}
      inert={!isOpen}
    >
      <button
        type="button"
        className={styles.scrim}
        aria-label="Fechar"
        tabIndex={-1}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={styles.panel}
      >
        <div className={styles.head}>
          <div className={styles.heading}>
            {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className={styles.description}>
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            className={styles.close}
            aria-label="Fechar"
            onClick={onClose}
          >
            <X size={18} strokeWidth={2} aria-hidden />
          </button>
        </div>
        <div className={styles.body}>{children}</div>
        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </div>,
    document.body,
  )
}
