import { mergeProps } from "react-aria"
import styles from "./styles.module.css"
import type { HTMLAttributes, MouseEventHandler, RefObject } from "react"

export const Dialog = {
  Root, Body, Header, Title, Content, Footer
}

function Root({ ref, ...props }: HTMLAttributes<HTMLDialogElement> & { ref: RefObject<HTMLDialogElement | null> }) {
  const handleClick: MouseEventHandler = e => {
    const currentRef = ref.current

    if (currentRef === null) return
    if (currentRef !== e.target) return

    currentRef.requestClose()
  }
  const mergedProps = mergeProps({ className: styles.dialogRoot, onClick: handleClick }, props)

  return (
    <dialog {...mergedProps} ref={ref} />
  )
}

function Body(props: HTMLAttributes<HTMLDivElement>) {
  const mergedProps = mergeProps({ className: styles.dialogBody }, props)

  return (
    <div {...mergedProps} />
  )
}

function Header(props: HTMLAttributes<HTMLElement>) {
  const mergedProps = mergeProps({}, props)

  return (
    <header {...mergedProps} />
  )
}

function Title(props: HTMLAttributes<HTMLHeadingElement>) {
  const mergedProps = mergeProps({ className: styles.dialogTitle }, props)

  return (
    <h2 {...mergedProps} />
  )
}

function Content(props: HTMLAttributes<HTMLElement>) {
  const mergedProps = mergeProps({ className: styles.dialogContent }, props)

  return (
    <main {...mergedProps} />
  )
}

function Footer(props: HTMLAttributes<HTMLElement>) {
  const mergedProps = mergeProps({ className: styles.dialogFooter }, props)

  return (
    <footer {...mergedProps} />
  )
}