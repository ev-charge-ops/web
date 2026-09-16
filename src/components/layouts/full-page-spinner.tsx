import { Spinner } from '@/components/ui/spinner'

import styles from './full-page-spinner.module.css'

type FullPageSpinnerProps = {
  label?: string
}

export function FullPageSpinner({ label }: FullPageSpinnerProps) {
  return (
    <div className={styles.container}>
      <Spinner size="lg" label={label} />
    </div>
  )
}
