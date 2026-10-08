import type { ReactNode } from 'react'

import styles from './page-title.module.css'

type PageTitleProps = {
  eyebrow?: ReactNode
  title: string
  description?: ReactNode
  tag?: ReactNode
  actions?: ReactNode
}

export function PageTitle({
  eyebrow,
  title,
  description,
  tag,
  actions,
}: PageTitleProps) {
  return (
    <header className={styles.header}>
      <div className={styles.main}>
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        <div className={styles.row}>
          <h1 className={styles.title}>{title}</h1>
          {tag}
        </div>
        {description ? (
          <p className={styles.description}>{description}</p>
        ) : null}
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </header>
  )
}
