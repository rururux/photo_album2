import type { SelectionState } from "~/hooks/useSelection"

type UseHeaderProps<T> = {
  selectionState: SelectionState<T>
}

export type HeaderState = {
  isSelectionMode: boolean,
  selectedCount: number,
  clearSelection: VoidFunction
}

export function useHeader<T>({ selectionState: [ selectedKeys, setSelectedKeys ] }: UseHeaderProps<T>) {
  const clearSelection = () => setSelectedKeys(new Set())

  return {
    isSelectionMode: selectedKeys.size > 0,
    selectedCount: selectedKeys.size,
    clearSelection
  }
}