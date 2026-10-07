import { Button } from '@/components/ui/button'

import styles from './main-error.module.css'

export function MainError() {
  return (
    <div role="alert" className={styles.container}>
      <h2 className={styles.title}>Ops, algo deu errado.</h2>
      <p className={styles.description}>
        Recarregue a página para tentar novamente.
      </p>
      <Button onClick={() => window.location.assign('/')}>Recarregar</Button>
    </div>
  )
}
