import { Checkbox, GridList, GridListItem, type GridListItemProps, type GridListProps, type Key } from "react-aria-components"
import styles from "./styles.module.css"
import { Icon } from "../Icon"
import { mergeProps } from "react-aria"

export const ImageGridList = {
  Root, Item
}

function Root<T extends unknown[]>({ onSelectionChange, ...props }: Omit<GridListProps<T>, "onSelectionChange"> & { onSelectionChange: (newSelection: Set<Key>) => void }) {
  const mergedProps = mergeProps({ className: styles.imageGridListRoot, }, props)
  const handleSelectionChange: GridListProps<T>["onSelectionChange"] = newSelection => {
    if (typeof newSelection === "string") {
      console.warn("typeof newSelection === \"string\"")

      return
    }

    onSelectionChange(newSelection)
  }

  return (
    <GridList
      {...mergedProps}
      selectionMode="multiple"
      selectionBehavior="toggle"
      onSelectionChange={handleSelectionChange}
    />
  )
}

function Item({ children, ...props }: GridListItemProps) {
  return (
    <GridListItem className={styles.imageGridListItem} {...props}>
      <Checkbox className={styles.imageGridListItemCheckbox} slot="selection">
        <Icon icon="check" />
      </Checkbox>
      <>
        {children}
      </>
    </GridListItem>
  )
}