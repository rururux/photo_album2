import type { ButtonHTMLAttributes } from "react"
import { mergeProps } from "react-aria"
import styles from "./styles.module.css"

export function FloatingActionButton({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const mergedProps = mergeProps<ButtonHTMLAttributes<HTMLButtonElement>[]>(
    { className: styles.floatingActionButton, type: "button" },
    props
  )

  return (
    <button type="button" {...mergedProps}>
      <div className={styles.floatingActionButtonStateLayer} />
      <div className={styles.floatingActionButtonContentLayer}>
        {children}
      </div>
    </button>
  )
}