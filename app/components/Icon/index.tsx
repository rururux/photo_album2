import type { HTMLAttributes } from "react"
import styles from "./styles.module.css"
import { mergeProps } from "react-aria"

type IconProps = Omit<HTMLAttributes<SVGElement>, "children"> & { icon: "arrow-back" | "add" }

export function Icon({ icon, ...props }: IconProps) {
  const mergedProps = mergeProps<HTMLAttributes<SVGElement>[]>({ className: styles.icon }, props)

  return (
    <svg {...mergedProps}>
      <use href={`/svg/icons.svg#${icon}`} />
    </svg>
  )
}