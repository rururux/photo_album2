import { mergeProps } from "react-aria"
import styles from "./styles.module.css"
import type { HTMLAttributes } from "react"

type AvatarButtonProps = Omit<HTMLAttributes<HTMLButtonElement>, "children"> & { avatarSrc: string }

export function AvatarButton({ avatarSrc, ...props }: AvatarButtonProps) {
  const mergedProps = mergeProps<HTMLAttributes<HTMLButtonElement>[]>({ className: styles.avatarButton }, props)

  return (
    <button type="button" {...mergedProps}>
      <div className={styles.avatarButtonStateLayer} />
      <div className={styles.avatarButtonContentLayer}>
        <img src={avatarSrc} alt="プロフィール画像" />
      </div>
    </button>
  )
}