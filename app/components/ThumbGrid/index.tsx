import type { HTMLAttributes, ImgHTMLAttributes } from "react"
import { mergeProps } from "react-aria"
import styles from "./styles.module.css"

export const ThumbGrid = {
  Root, Item
}

function Root(props: HTMLAttributes<HTMLDivElement>) {
  const mergedProps = mergeProps({ className: styles.thumbGrid }, props)

  return (
    <div {...mergedProps} />
  )
}

function Item(props: ImgHTMLAttributes<HTMLImageElement>) {
  const mergedProps = mergeProps({ className: styles.thumbGridItem }, props)

  return (
    <img {...mergedProps} />
  )
}