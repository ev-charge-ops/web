import styles from './driver-app-note.module.css'

export function DriverAppNote() {
  return (
    <p className={styles.note}>
      <strong>Motorista?</strong> As recargas são feitas pelo app EV ChargeOps,
      no Android ou iOS.
    </p>
  )
}
