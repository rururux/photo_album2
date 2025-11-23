import type { HTMLAttributes } from "react"
import { mergeProps } from "react-aria"
import styles from "./styles.module.css"

type IconProps = Omit<HTMLAttributes<SVGElement>, "children"> & {
  icon: "arrow-back" | "add" | "edit-calendar" | "close" | "check" | "delete" | "more"
}

export function Icon({ icon, ...props }: IconProps) {
  const mergedProps = mergeProps<HTMLAttributes<SVGElement>[]>({ className: styles.icon }, props)

  return (
    <svg {...mergedProps}>
      <use href={`/svg/icons.svg#${icon}`} />
    </svg>
  )
}