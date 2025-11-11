import type { HTMLAttributes, ReactNode } from "react"
import { mergeProps } from "react-aria"
import styles from "./styles.module.css"
import type { HeaderState } from "./hooks"

export const Header = { Root, Leading, Title, Trailing }

type HeaderRootProps = Omit<HTMLAttributes<HTMLElement>, "children"> & ({
  headerState: HeaderState,
  children: ((headerState: HeaderState) => ReactNode)
} | {
  headerState?: never,
  children: ReactNode
})

function Root({ headerState, children: _children, ...props }: HeaderRootProps) {
  const classNames = [ styles.headerRoot, headerState?.isSelectionMode? styles.selectionHeader : "" ].join(" ").trimEnd()
  const mergedProps = mergeProps<HTMLAttributes<HTMLElement>[]>({ className: classNames }, props)
  const children = typeof _children === "function"? _children(headerState!) : _children

  return (
    <header {...mergedProps}>
      {children}
    </header>
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
