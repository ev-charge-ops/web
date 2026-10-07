import { Apple, ExternalLink, Smartphone } from 'lucide-react'

import styles from './app-download.module.css'

export const androidBuildsUrl =
  'https://expo.dev/accounts/ev-charge-ops/projects/ev-charge-ops'

type AppDownloadProps = {
  token: string
}

export function AppDownload({ token }: AppDownloadProps) {
  return (
    <section className={styles.section} aria-labelledby="app-download-title">
      <h2 id="app-download-title" className={styles.title}>
        Baixe o app EV ChargeOps
      </h2>
      <p className={styles.description}>
        As recargas e o seu consumo ficam no aplicativo. Entre com a mesma
        conta que você acabou de usar.
      </p>
      <ul className={styles.options}>
        <li className={styles.option}>
          <Smartphone size={18} strokeWidth={2} aria-hidden />
          <div>
            <a href={androidBuildsUrl} target="_blank" rel="noreferrer">
              Baixar para Android (APK)
            </a>
            <p className={styles.hint}>Instale a versão mais recente da lista.</p>
          </div>
        </li>
        <li className={styles.option}>
          <Apple size={18} strokeWidth={2} aria-hidden />
          <div>
            <span className={styles.label}>iPhone</span>
            <p className={styles.hint}>
              Convite via TestFlight enviado pelo gestor.
            </p>
          </div>
        </li>
      </ul>
      <a
        className={styles.openApp}
        href={`evchargeops://invite?token=${encodeURIComponent(token)}`}
      >
        <ExternalLink size={16} strokeWidth={2} aria-hidden />
        Abrir no app
      </a>
    </section>
  )
}
