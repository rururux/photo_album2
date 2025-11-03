import type { HTMLAttributes } from "react"
import { mergeProps } from "react-aria"
import styles from "./styles.module.css"

export function FloatingActionButton({ children, ...props }: HTMLAttributes<HTMLButtonElement>) {
  const mergedProps = mergeProps<HTMLAttributes<HTMLButtonElement>[]>({ className: styles.floatingActionButton }, props)

  return (
    <button type="button" {...mergedProps}>
      <div className={styles.floatingActionButtonStateLayer} />
      <div className={styles.floatingActionButtonContentLayer}>
        {children}
      </div>
    </button>
  )
}