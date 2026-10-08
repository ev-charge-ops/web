import type { ReactNode } from 'react'

import styles from './divider.module.css'

type DividerProps = {
  children?: ReactNode
}

export function Divider({ children }: DividerProps) {
  return (
    <div role="separator" className={styles.divider}>
      {children}
    </div>
  )
}
