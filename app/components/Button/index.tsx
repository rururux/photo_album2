import type { ButtonHTMLAttributes } from "react"
import { mergeProps } from "react-aria"
import styles from "./styles.module.css"
import capitalize from "~/utils/capitalize"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "small",
  variant?: "text" | "filled" | "outlined"
}

export function Button({ size = "small", variant = "text", children, ...props }: ButtonProps) {
  const classNames = [ styles.button, styles[`button${capitalize(size)}`], styles[`button${capitalize(variant)}`] ].join(" ")
  const mergedProps = mergeProps({ className: classNames, type: "button" }, props)

  return (
    <button {...mergedProps}>
      <div className={styles.buttonStateLayer} />
      <div className={styles.buttonContentLayer}>{children}</div>
    </button>
  )
}