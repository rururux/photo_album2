import { useState } from "react"
import { useCloseWatcher } from "./useCloseWatcher"

export type SelectionState<T> = [
  Set<T>, React.Dispatch<React.SetStateAction<Set<T>>>
]

export function useSelection<T>() {
  const [ selection, setSelection ] = useState(() => new Set<T>())
  const isSelected = selection.size !== 0

  useCloseWatcher({
    enabled: isSelected,
    onClose: () => setSelection(() => new Set<T>())
  })

  return [ selection, setSelection ] as SelectionState<T>
}