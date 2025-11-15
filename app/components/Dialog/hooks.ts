import { useRef } from "react"

export function useDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const openDialog = () => dialogRef.current?.showModal()
  const closeDialog = () => dialogRef.current?.requestClose()
  const dialogController = { open: openDialog, close: closeDialog }

  return [
    dialogController, { ref: dialogRef }
  ] as const
}