import { mergeProps } from "react-aria"
import styles from "./styles.module.css"
import type { ButtonHTMLAttributes } from "react"

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