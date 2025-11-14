import { createContext, useContext, useId, useRef, useState, type ButtonHTMLAttributes, type CSSProperties, type HTMLAttributes, type PropsWithChildren, type ReactNode, type RefObject, type ToggleEvent } from "react"
import { mergeProps } from "react-aria"
import { Menu as RACMenu, MenuItem as RACMenuItem, type MenuItemProps, type MenuProps } from "react-aria-components"
import styles from "./styles.module.css"

export const Menu = {
  Root, Trigger, Popover, List, Item
}

type MenuTriggerProps = {
  children: ({ triggerButtonProps }: { triggerButtonProps: ButtonHTMLAttributes<HTMLButtonElement> }) => ReactNode
}

const MenuContext = createContext<{
  popoverId: string,
  popoverRef: RefObject<HTMLDivElement | null>
}>({
  popoverId: "",
  popoverRef: { current: null }
})

function Root({ children }: PropsWithChildren) {
  const popoverId = useId()
  const popoverRef = useRef<HTMLDivElement>(null)

  return (
    <MenuContext value={{ popoverId, popoverRef }}>
      {children}
    </MenuContext>
  )
}

function Trigger({ children }: MenuTriggerProps) {
  const { popoverId } = useContext(MenuContext)
  const popoverAnchorId = useId()
  const triggerButtonProps = {
    className: styles.menuTriggerButton,
    popoverTarget: popoverId,
    style: { "--anchor-id": popoverAnchorId } as Record<string, string>
  } satisfies ButtonHTMLAttributes<HTMLButtonElement>

  return (
    <>
      {children({ triggerButtonProps })}
    </>
  )
}

function Popover(props: HTMLAttributes<HTMLDivElement>) {
  const [ style, setStyle ] = useState<Pick<CSSProperties, "width" | "visibility">>({ width: "auto", visibility: "hidden" })
  const { popoverId, popoverRef } = useContext(MenuContext)
  const handleToggle = (e: ToggleEvent<HTMLDivElement>) => {
    if (e.newState !== "open" || style.visibility !== "hidden" ) return

    const rect = e.currentTarget.getBoundingClientRect()

    // 現在の width 以上の 56 の倍数に設定
    setStyle({ width: Math.ceil(rect.width / 56) * 56, visibility: "visible" })
  }
  const mergedProps = mergeProps({ id: popoverId, className: styles.menuPopover, onToggle: handleToggle }, props)

  return (
    <div {...mergedProps} popover="" style={style} ref={popoverRef} />
  )
}

function List<T extends object>(props: MenuProps<T>) {
  const mergedProps = mergeProps({ className: styles.menuList }, props)

  return (
    <RACMenu {...mergedProps} />
  )
}

function Item(props: MenuItemProps) {
  const { popoverRef } = useContext(MenuContext)
  const mergedProps = mergeProps({ className: styles.menuListItem, onPress: () => popoverRef.current?.hidePopover() }, props)

  return (
    <RACMenuItem {...mergedProps} />
  )
}