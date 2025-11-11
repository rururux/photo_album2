import { useRef, type ChangeEvent } from "react"
import { FloatingActionButton } from "~/components/FloatingActionButton"
import { Icon } from "~/components/Icon"

export function FilePickerButton({ onChange }: { onChange: (files: File[]) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => fileInputRef.current?.showPicker()
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.currentTarget.files ?? [])

    if (newFiles.length === 0) return

    onChange(newFiles)
  }

  return (
    <>
      <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleChange} ref={fileInputRef} />
      <FloatingActionButton onClick={handleClick}>
        <Icon icon="add" />
      </FloatingActionButton>
    </>
  )
}