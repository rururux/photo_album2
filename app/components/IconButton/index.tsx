import type { ButtonHTMLAttributes } from "react"
import { mergeProps } from "react-aria"
import styles from "./styles.module.css"
import capitalize from "~/utils/capitalize"

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "small" | "medium",
  variant?: "standard" | "outlined"
}

export function IconButton({ size = "medium", variant = "standard", children, ...props }: IconButtonProps) {
  const classNames = [
    styles.iconButton,
    styles[`iconButton${capitalize(size)}`],
    styles[`iconButton${capitalize(variant)}`]
  ].join(" ")
  const mergedProps = mergeProps<ButtonHTMLAttributes<HTMLButtonElement>[]>({ className: classNames, type: "button" }, props)

  return (
    <button {...mergedProps}>
      <div className={styles.iconButtonStateLayer} />
      <div className={styles.iconButtonContentLayer}>
        {children}
      </div>
    </button>
  )
}