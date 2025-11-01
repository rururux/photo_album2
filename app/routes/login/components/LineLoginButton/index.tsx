import type { HTMLAttributes } from "react"
import styles from "./styles.module.css"

export function LineLoginButton(props: HTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={styles.lineLoginButton} {...props} type="button">
      <div className={styles.lineLoginButtonInner}>
        <div className={styles.lineLoginButtonStateLayer} />
        <div className={styles.lineLoginButtonContentLayer}>
          <div className={styles.lineIconContainer}>
            <img className={styles.lineLogo} src="/img/line-logo.png" alt="LINEロゴ" />
          </div>
          <span className={styles.lineLoginButtonLabel}>LINEでログイン</span>
        </div>
      </div>
    </button>
  )
}