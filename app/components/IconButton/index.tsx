import type { HTMLAttributes } from "react"
import { mergeProps } from "react-aria"
import styles from "./styles.module.css"
import capitalize from "~/utils/capitalize"

type IconButtonProps = HTMLAttributes<HTMLButtonElement> & {
  size?: "small" | "medium",
  variant?: "standard" | "outlined"
}

export function IconButton({ size = "medium", variant = "standard", children, ...props }: IconButtonProps) {
  const classNames = [
    styles.iconButton,
    styles[`iconButton${capitalize(size)}`],
    styles[`iconButton${capitalize(variant)}`]
  ].join(" ")
  const mergedProps = mergeProps<HTMLAttributes<HTMLButtonElement>[]>({ className: classNames }, props)

  return (
    <button {...mergedProps}>
      <div className={styles.iconButtonStateLayer} />
      <div className={styles.iconButtonContentLayer}>
        {children}
      </div>
    </button>
  )
}