import { Activity, cloneElement, createContext, useContext, useEffect, useEffectEvent, useLayoutEffect, useMemo, useRef, useState, type PropsWithChildren, type RefObject } from "react"
import { useVirtualizer, type VirtualItem } from "@tanstack/react-virtual"
import { CalendarCell, CalendarGrid, RangeCalendarStateContext, RangeCalendar as RARangeCalendar, type CalendarGridBodyProps, type DateRange, type RangeCalendarState } from "react-aria-components"
import { CalendarDate, endOfMonth, GregorianCalendar, parseDate, startOfMonth, type CalendarIdentifier, type DateDuration } from "@internationalized/date"
import { Divider } from "../Divider"
import { Button } from "../Button"
import { IconButton } from "../IconButton"
import { Icon } from "../Icon"
import styles from "./styles.module.css"
import formatRelativeDate from "~/utils/formatRelativeDate"
import now from "~/utils/now"
import isSameYear from "~/utils/isSameYear"

const fiveYearMonths = 5 * 12
const nowDate = parseDate("2025-11-09")
const minValue = startOfMonth(nowDate.subtract({ months: fiveYearMonths / 2 }))
const maxValue = endOfMonth(nowDate.add({ months: fiveYearMonths / 2 }))
const visibleDuration = { months: fiveYearMonths + 1 }

// → "YYYY年MM月"
const dateFormatter = new Intl.DateTimeFormat("ja", { year: "numeric", month: "long" })

function createCalendar(identifier: CalendarIdentifier) {
  switch (identifier) {
    case "gregory":
      return new GregorianCalendar()
    default:
      throw new Error(`Unsupported calendar ${identifier}`)
  }
}

export type RangeValue<T> = { start: T, end: T }

type RangeCalendarProps = {
  value: RangeValue<string> | null,
  onSubmit: (value: RangeValue<string>) => void,
  ref: RefObject<HTMLDialogElement | null>
}

export function RangeCalendar({ value, onSubmit, ref }: RangeCalendarProps) {
  const [ isDialogOpen, setIsDialogOpen ] = useState(false)
  const [ dateRange, setDateRange ] = useState<DateRange | null>(value && { start: parseDate(value.start), end: parseDate(value.end) })

  const closeDialog = () => ref.current?.requestClose()
  const submitValue = () => {
    if (dateRange === null) return

    const start = dateRange.start.toString()
    const end = dateRange.end.toString()

    onSubmit({ start, end })
    closeDialog()
  }

  // Props の onToggle では何故かリロード直後に動かんので直接つける
  // おそらく要素本体ではなく <body> とかにイベントリスナを設定する仕様の為か？
  useEffect(() => {
    if (ref.current === null) return

    const abortController = new AbortController()

    ref.current.addEventListener("beforetoggle", e => {
      setIsDialogOpen(e.newState === "open")
    }, { signal: abortController.signal })

    return () => abortController.abort()
  }, [])

  return (
    <dialog className={styles.rangeCalendarRoot} ref={ref}>
      <Activity mode={isDialogOpen? "visible" : "hidden"}>
        <RARangeCalendar
          className={styles.rangeCalendarDialogBody}
          visibleDuration={visibleDuration}
          maxValue={maxValue}
          minValue={minValue}
          value={dateRange}
          createCalendar={createCalendar}
          onChange={setDateRange}
        >
          <RangeCalenderBody closeDialog={closeDialog} dateRange={dateRange} submitValue={submitValue} />
        </RARangeCalendar>
      </Activity>
    </dialog>
  )
}

function RangeCalenderBody({ closeDialog, dateRange, submitValue }: {
  closeDialog: VoidFunction,
  dateRange: DateRange | null,
  submitValue: VoidFunction
}) {
  const calendarListVirtualizer = useVirtualizer({
    count: fiveYearMonths + 1,
    getScrollElement: () => scrollerRef.current,
    estimateSize: () => 341
  })
  const scrollCalendar = useEffectEvent(() => {
    calendarListVirtualizer.scrollToIndex(fiveYearMonths / 2, { align: "start" })
  })
  const scrollerRef = useRef<HTMLDivElement>(null)

  const state = useContext(RangeCalendarStateContext)!
  const startDate = state.anchorDate ?? state.value?.start
  const endDate = state.anchorDate === null? state.value?.end : null

  useLayoutEffect(() => scrollCalendar(), [])

  return (
    <>
      <header className={styles.rangeCalendarHeader}>
        <div className={styles.rangeCalendarHeaderButtons}>
          <IconButton size="small" onClick={closeDialog}>
            <Icon icon="close" />
          </IconButton>
        </div>
        <div className={styles.rangeCalendarHeaderTitles}>
          <span className={styles.rangeCalendarHeaderTitlesSupportingText}>期間を選択</span>
          <h2 className={styles.rangeCalendarHeaderTitlesHeadline}>
            {
              startDate? formatRelativeDate(startDate.toString(), now) : "-- / --"
            } ～ {
              endDate
                ? formatRelativeDate(endDate.toString(), startDate!.toString(), {
                    minimumUnit: isSameYear(now, startDate!.toString())? "month" : "year"
                  })
                : "-- / --"
            }
          </h2>
        </div>
        <Divider />
        <div className={styles.rangeCalendarWeekDays}>
          {[ "S", "M", "T", "W", "T", "F", "S" ].map((weekDay, id) => (
            <span key={id}>{weekDay}</span>
          ))}
        </div>
      </header>
      <main className={styles.rangeCalendarTableList} ref={scrollerRef}>
        <div
          style={{
            height: `${calendarListVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative"
          }}
        >
          {calendarListVirtualizer.getVirtualItems().map(calendarVirtual => (
            <RangeCalenderGrid state={state} calendarVirtual={calendarVirtual} key={calendarVirtual.key} />
          ))}
        </div>
      </main>
      <Divider />
      <footer className={styles.rangeCalendarFooter}>
        <Button onClick={closeDialog}>キャンセル</Button>
        <Button disabled={dateRange === null} onClick={submitValue}>OK</Button>
      </footer>
    </>
  )
}

function RangeCalenderGrid({ state, calendarVirtual }: { state: RangeCalendarState, calendarVirtual: VirtualItem }) {
  const offset = useMemo(() => ({ months: calendarVirtual.index }), [ calendarVirtual.index ])

  return (
    <div
      className={styles.rangeCalendarBody}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: `${calendarVirtual.size}px`,
        transform: `translateY(${calendarVirtual.start}px)`,
      }}
      key={calendarVirtual.key}
    >
      <div className={styles.rangeCalendarMonthSubhead}>
        {dateFormatter.format(state.visibleRange.start.add(offset).toDate("asia/tokyo"))}
      </div>
      <CalendatContextProvider offset={offset}>
        <CalendarGrid className={styles.rangeCalendarTable} offset={offset}>
          <CalendarGridBody2>
            {(date) => (
              <CalendarCell className={styles.rangeCalendarTableCell} date={date}>
                {({ formattedDate }) => (
                  <span className={styles.rangeCalendarTableCellDay}>{formattedDate}</span>
                )}
              </CalendarCell>
            )}
          </CalendarGridBody2>
        </CalendarGrid>
      </CalendatContextProvider>
    </div>
  )
}

const CalendarContext = createContext<{ startDate: CalendarDate | undefined }>({
  startDate: undefined
})

function CalendatContextProvider({ offset, children }: PropsWithChildren<{ offset?: DateDuration }>) {
  const rangeCalendarState = useContext(RangeCalendarStateContext)!
  let startDate = rangeCalendarState.visibleRange.start

  if (offset) {
    startDate = startDate.add(offset)
  }

  return (
    <CalendarContext value={{ startDate }}>
      {children}
    </CalendarContext>
  )
}

// デフォルトの CalendarGrid では <tr> 要素が月の週の数によって変動してしまうので、
// 6週表示で固定させる為にこれが必要
function CalendarGridBody2(props: CalendarGridBodyProps) {
  const { children, style, className } = props
  const rangeCalendarState = useContext(RangeCalendarStateContext)!
  const { startDate } = useContext(CalendarContext)!

  return (
    <tbody
      style={style}
      className={className}>
      {[...new Array(6).keys()].map((weekIndex) => (
        <tr className={styles.rangeCalendarTableRow} key={weekIndex}>
          {rangeCalendarState.getDatesInWeek(weekIndex, startDate).map((date, i) => (
            date
              ? cloneElement(children(date), {key: i})
              : <td key={i} />
          ))}
        </tr>
      ))}
    </tbody>
  )
}