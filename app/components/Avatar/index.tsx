import { mergeProps } from "react-aria"
import type { HTMLAttributes } from "react"
import styles from "./styles.module.css"

type AvatarProps = HTMLAttributes<HTMLDivElement> & { name: string, image?: string | undefined }

export function Avatar({ name, image, ...props }: AvatarProps) {
  const mergedProps = mergeProps({ className: styles.avatarRoot }, props)

  return (
    <div {...mergedProps}>
      {image && <img src={image} alt={name} />}
      <div>{name[0].toUpperCase()}</div>
    </div>
  )
}