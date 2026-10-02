import { Apple, Smartphone } from 'lucide-react'

import styles from './app-download.module.css'

export const androidBuildsUrl =
  'https://expo.dev/accounts/ev-charge-ops/projects/ev-charge-ops'

export function AppDownload() {
  return (
    <aside className={styles.aside} aria-labelledby="app-download-title">
      <img
        src="/media/car-hero.webp"
        alt=""
        aria-hidden="true"
        className={styles.image}
      />
      <div className={styles.copy}>
        <h2 id="app-download-title" className={styles.title}>
          Motoristas usam o app EV ChargeOps
        </h2>
        <p className={styles.description}>
          Moradores iniciam e acompanham recargas pelo celular. O portal é para
          a gestão do condomínio.
        </p>
      </div>
      <div className={styles.stores}>
        <a
          className={styles.store}
          href={androidBuildsUrl}
          target="_blank"
          rel="noreferrer"
        >
          <Smartphone size={18} strokeWidth={2} aria-hidden />
          <span className={styles.storeText}>
            <span className={styles.storeName}>Baixar para Android (APK)</span>
            <span className={styles.storeHint}>
              Instale a versão mais recente da lista.
            </span>
          </span>
        </a>
        <div className={styles.store}>
          <Apple size={18} strokeWidth={2} aria-hidden />
          <span className={styles.storeText}>
            <span className={styles.storeName}>iPhone</span>
            <span className={styles.storeHint}>
              Convite via TestFlight enviado pelo gestor.
            </span>
          </span>
        </div>
      </div>
    </aside>
  )
}
