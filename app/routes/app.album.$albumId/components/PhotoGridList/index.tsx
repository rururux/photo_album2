import { ImageGridList } from "~/components/ImageGridList"
import styles from "./styles.module.css"
import type { Key } from "react-aria"

type PhotoGridListProps = {
  photoItems: { id: string, src: string }[],
  isEditable: boolean
  selection: Set<Key>,
  setSelection: (newSelection: Set<Key>) => void
}

export function PhotoGridList({ photoItems, isEditable, selection, setSelection }: PhotoGridListProps) {
  const disabledKeys = isEditable? photoItems.filter(item => !("fileHash" in item)).map(item => item.id) : []

  return (
    <div>
      <div className={styles.albumPhotoListHeader}>
        <span>画像 {photoItems.length}枚</span>
      </div>
      <ImageGridList.Root
        className={styles.albumPhotoListBody}
        selectedKeys={selection}
        disabledKeys={disabledKeys}
        onSelectionChange={setSelection}
      >
        {photoItems.map(item => (
          <ImageGridList.Item id={item.id} href={item.src + "?raw"} target="_blank" key={item.id}>
            <img src={item.src} alt="" />
          </ImageGridList.Item>
        ))}
      </ImageGridList.Root>
    </div>
  )
}