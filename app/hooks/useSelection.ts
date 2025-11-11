import { useEffect, useState } from "react"

export type SelectionState<T> = [
  Set<T>, React.Dispatch<React.SetStateAction<Set<T>>>
]

export function useSelection<T>() {
  const [ selection, setSelection ] = useState(() => new Set<T>())
  const isSelected = selection.size !== 0

  useEffect(() => {
    if (isSelected !== true) return

    const abortContoller = new AbortController()
    const closeWatcher = new CloseWatcher({ signal: abortContoller.signal })

    closeWatcher.addEventListener("close", () => setSelection(() => new Set()))

    return () => abortContoller.abort()
  }, [ isSelected ])

  return [ selection, setSelection ] as SelectionState<T>
}