import type { ReactNode } from 'react'

import styles from './statement-summary.module.css'

export function StatementSummary({ children }: { children: ReactNode }) {
  return <div className={styles.summary}>{children}</div>
}
