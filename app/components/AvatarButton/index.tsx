import { mergeProps } from "react-aria"
import styles from "./styles.module.css"
import type { HTMLAttributes } from "react"

type AvatarButtonProps = HTMLAttributes<HTMLButtonElement>

export function AvatarButton({ children, ...props }: HTMLAttributes<HTMLButtonElement>) {
  const mergedProps = mergeProps<HTMLAttributes<HTMLButtonElement>[]>({ className: styles.avatarButton }, props)

  return (
    <button type="button" {...mergedProps}>
      <div className={styles.avatarButtonStateLayer} />
      <div className={styles.avatarButtonContentLayer}>
        {children}
      </div>
    </button>
  )
}