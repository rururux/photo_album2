import { describe, expect, test, vi } from "vitest"
import { render, renderHook } from "vitest-browser-react"
import { RangeCalendar } from "."
import { useRangeCalendar } from "./hooks"
import { endOfMonth, now, toCalendarDate } from "@internationalized/date"
import formatRelativeDate from "~/utils/formatRelativeDate"

// → "YYYY年MM月"
const dateFormatter = new Intl.DateTimeFormat("ja", { year: "numeric", month: "long" })
const today = now("Asia/Tokyo")
const todayDate = today.toDate()
const thisMonth = dateFormatter.format(today.toDate())

// https://github.com/adobe/react-spectrum/blob/93d39fd65807488680ee3ba1a5c233789ab42567/packages/%40react-aria/calendar/src/useCalendarCell.ts#L84
const reactAriaDateFormatter = new Intl.DateTimeFormat("ja", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric"
})

describe("RangeCalendar", () => {
  test("render", async () => {
    const { result, act } = await renderHook(() => useRangeCalendar({}))
    const screen = await render(
      <RangeCalendar {...result.current.rangeCalendarState} />
    )

    await act(() => result.current.showRangeCalendar())

    const rangeCalender = screen.getByRole("grid", { name: thisMonth })

    await expect.element(rangeCalender).toBeInTheDocument()
  })

  test("pick date", async () => {
    const handleChange = vi.fn()
    const { result, act } = await renderHook(() => useRangeCalendar({ onChange: handleChange }))
    const screen = await render(
      <RangeCalendar {...result.current.rangeCalendarState} />
    )

    await act(() => result.current.showRangeCalendar())

    const rangeCalender = screen.getByRole("grid", { name: thisMonth })
    const firstDay = toCalendarDate(today.set({ day: 1 }))
    const firstDayDate = firstDay.toDate("Asia/Tokyo")
    const lastDay = toCalendarDate(endOfMonth(firstDay))
    const lastDayDate = lastDay.toDate("Asia/Tokyo")
    const firstDayCell = rangeCalender.getByRole("button", {
      name: reactAriaDateFormatter.format(firstDayDate)
    })
    const lastDayCell = rangeCalender.getByRole("button", {
      name: reactAriaDateFormatter.format(lastDayDate)
    })

    await expect.element(firstDayCell).toBeInTheDocument()
    await expect.element(lastDayCell).toBeInTheDocument()

    await firstDayCell.click()
    await lastDayCell.click()

    const rangeHeaderText =
      `${formatRelativeDate(firstDayDate.toString(), todayDate.toString())} ～ ${formatRelativeDate(lastDayDate.toString(), firstDayDate.toString())}`

    await expect.element(screen.getByRole("heading", { name: rangeHeaderText })).toBeInTheDocument()

    await screen.getByRole("button", { name: "OK" }).click()
    expect(handleChange).toBeCalledWith({ start: firstDay.toString(), end: lastDay.toString() })
  })
})