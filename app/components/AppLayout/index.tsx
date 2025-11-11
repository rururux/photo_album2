import type { PropsWithChildren } from "react"
import styles from "./styles.module.css"

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className={styles.layoutBackground}>
      <div className={styles.layoutBody}>
        {children}
      </div>
    </div>
  )
}