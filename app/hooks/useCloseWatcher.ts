import { useEffect, useEffectEvent, useRef } from "react"

type UseCloseWatcherProps = {
  enabled: boolean,
  onCancel?: (e: { preventDefault: VoidFunction }) => void
  onClose: VoidFunction
}

const noop = () => {}

export function useCloseWatcher({ enabled, onCancel = noop, onClose }: UseCloseWatcherProps) {
  const closeWatcherRef = useRef<CloseWatcher>(null)
  const handleCancel = useEffectEvent(onCancel)
  const handleClose = useEffectEvent(onClose)

  useEffect(() => {
    if (!enabled) return

    const abortController = new AbortController()
    const closeWatcher = new CloseWatcher({ signal: abortController.signal })

    closeWatcherRef.current = closeWatcher
    closeWatcher.addEventListener("cancel", handleCancel)
    closeWatcher.addEventListener("close", handleClose)

    return () => {
      abortController.abort()
      closeWatcherRef.current = null
    }
  }, [ enabled ])

  return {
    requestClose: () => closeWatcherRef.current?.requestClose(),
    close: () => closeWatcherRef.current?.close()
  }
}