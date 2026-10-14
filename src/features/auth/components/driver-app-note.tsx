import styles from "./driver-app-note.module.css";

const appStoreUrl = "https://apps.apple.com/br/app/ev-chargeops/id6819532299";

export function DriverAppNote() {
  return (
    <p className={styles.note}>
      <strong>Motorista?</strong> As recargas são feitas pelo app EV ChargeOps.{" "}
      <a href={appStoreUrl} target="_blank" rel="noreferrer">
        Baixe na App Store
      </a>
    </p>
  );
}
