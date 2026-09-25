import { useId, type ReactNode } from 'react'

import { useDismissOnEscape } from '@/hooks/use-dismiss-on-escape'

import { Button } from './button'
import styles from './confirm-dialog.module.css'

type ConfirmDialogProps = {
  isOpen: boolean
  title: string
  description: ReactNode
  confirmLabel: string
  cancelLabel?: string
  isConfirming?: boolean
  isDestructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancelar',
  isConfirming = false,
  isDestructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId()
  const descriptionId = useId()
  useDismissOnEscape(isOpen, onCancel)

  if (!isOpen) return null

  return (
    <div className={styles.backdrop}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={styles.dialog}
      >
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <p id={descriptionId} className={styles.description}>
          {description}
        </p>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onCancel} disabled={isConfirming}>
            {cancelLabel}
          </Button>
          <Button
            variant={isDestructive ? 'destructive' : 'primary'}
            isLoading={isConfirming}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
