import type { PropsWithChildren } from "react"
import styles from "./styles.module.css"

export function AppLayout({ children, ...props }: PropsWithChildren<{ "data-testid"?: string }>) {
  return (
    <div className={styles.layoutBackground} {...props}>
      <div className={styles.layoutBody}>
        {children}
      </div>
    </div>
  )
}