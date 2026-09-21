import { X } from 'lucide-react'
import { useId, type ReactNode } from 'react'

import { useDismissOnEscape } from '@/hooks/use-dismiss-on-escape'

import styles from './drawer.module.css'

type DrawerProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: ReactNode
  children: ReactNode
}

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
}: DrawerProps) {
  const titleId = useId()
  const descriptionId = useId()
  useDismissOnEscape(isOpen, onClose)

  if (!isOpen) return null

  return (
    <div className={styles.drawer}>
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
          <div>
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
            <X size={16} strokeWidth={2} aria-hidden />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
