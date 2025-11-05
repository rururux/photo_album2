import type { HTMLAttributes } from "react"
import { mergeProps } from "react-aria"
import styles from "./styles.module.css"

export const Header = { Root, Leading, Title, Trailing }

function Root(props: HTMLAttributes<HTMLElement>) {
  const mergedProps = mergeProps<HTMLAttributes<HTMLElement>[]>({ className: styles.headerRoot }, props)

  return (
    <header {...mergedProps} />
  )
}

function Leading(props: HTMLAttributes<HTMLDivElement>) {
  const mergedProps = mergeProps<HTMLAttributes<HTMLDivElement>[]>({ className: styles.headerLeading }, props)

  return (
    <div {...mergedProps} />
  )
}

function Title(props: HTMLAttributes<HTMLHeadingElement>) {
  const mergedProps = mergeProps<HTMLAttributes<HTMLHeadingElement>[]>({ className: styles.headerTitle }, props)

  return (
    <h1 {...mergedProps} />
  )
}

function Trailing(props: HTMLAttributes<HTMLDivElement>) {
  const mergedProps = mergeProps<HTMLAttributes<HTMLDivElement>[]>({ className: styles.headerTrailing }, props)

  return (
    <div {...mergedProps} />
  )
}
