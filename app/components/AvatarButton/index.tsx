import { mergeProps } from "react-aria"
import type { ButtonHTMLAttributes } from "react"
import styles from "./styles.module.css"

export function AvatarButton({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const mergedProps = mergeProps<ButtonHTMLAttributes<HTMLButtonElement>[]>({ className: styles.avatarButton }, props)

  return (
    <button type="button" {...mergedProps}>
      <div className={styles.avatarButtonStateLayer} />
      <div className={styles.avatarButtonContentLayer}>
        {children}
      </div>
    </button>
  )
}