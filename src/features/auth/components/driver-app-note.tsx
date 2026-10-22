import styles from "./driver-app-note.module.css";

const appStoreUrl = "https://apps.apple.com/br/app/ev-chargeops/id6819532299";
const googlePlayUrl =
  "https://play.google.com/store/apps/details?id=io.softmoon.evchargeops";

export function DriverAppNote() {
  return (
    <p className={styles.note}>
      <strong>Motorista?</strong> As recargas são feitas pelo app EV ChargeOps.
      Baixe na{" "}
      <a href={appStoreUrl} target="_blank" rel="noreferrer">
        App Store
      </a>{" "}
      ou no{" "}
      <a href={googlePlayUrl} target="_blank" rel="noreferrer">
        Google Play
      </a>
      .
    </p>
  );
}
