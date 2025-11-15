import { useRef, useState } from "react"
import type { RangeValue } from "."

type UseRangeCalendarProps = {
  initialValue?: RangeValue<string> | null
  onChange?: (newValue: RangeValue<string>) => void
}

export function useRangeCalendar({ initialValue = null, onChange }: UseRangeCalendarProps) {
  const rangeCalendarDialogRef = useRef<HTMLDialogElement>(null)
  const [ value, setValue ] = useState<RangeValue<string> | null>(initialValue)
  const handleSubmit = (newValue: RangeValue<string>) => {
    onChange?.(newValue)
    setValue(newValue)
  }

  return {
    value,
    showRangeCalendar: () => rangeCalendarDialogRef.current?.showModal(),
    rangeCalendarState: { value, onSubmit: handleSubmit, ref: rangeCalendarDialogRef }
  }
}