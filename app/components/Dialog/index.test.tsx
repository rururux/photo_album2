import { test, expect, describe } from "vitest"
import { render, renderHook } from "vitest-browser-react"
import { Dialog } from "."
import { useRef } from "react"
import { userEvent } from "vitest/browser"

describe("Dialog", () => {
  test("render", async () => {
    const { result, act } = await renderHook(() => useRef<HTMLDialogElement>(null))
    const screen = await render(
      <Dialog.Root ref={result.current}>
        <Dialog.Body>
          <Dialog.Header>
            <Dialog.Title>Test</Dialog.Title>
          </Dialog.Header>
          <Dialog.Content>
            <span>Hello</span>
          </Dialog.Content>
        </Dialog.Body>
      </Dialog.Root>
    )

    const helloText = screen.getByText("Hello")

    await expect.element(helloText).toBeInTheDocument()
    await expect.element(helloText).not.toBeVisible()

    await act(() => result.current.current?.showModal())

    // `dialog` Role な Element は [open] の時にしか出てこない
    const dialog = screen.getByRole("dialog")

    await expect.element(dialog).toBeVisible()
    await expect.element(helloText).toBeVisible()

    await act(() => result.current.current?.requestClose())

    await expect.element(helloText).not.toBeVisible()
  })

  describe("modal", () => {
    test("close on click", async () => {
      const { result, act } = await renderHook(() => useRef<HTMLDialogElement>(null))
      const screen = await render(
        <Dialog.Root ref={result.current}>
          <Dialog.Body>
            <Dialog.Header>
              <Dialog.Title>Test</Dialog.Title>
            </Dialog.Header>
            <Dialog.Content>
              <span>Hello</span>
            </Dialog.Content>
          </Dialog.Body>
        </Dialog.Root>
      )
      const helloText = screen.getByText("Hello")

      await act(() => result.current.current?.showModal())

      await expect.element(helloText).toBeVisible()

      // Vitest の click を使うと、e.target が Dialog.Root ではなく
      // Dialog.Body となって期待した動きにならないので代わりにこちらを使う
      await act(() => result.current.current?.click())

      await expect.element(helloText).not.toBeVisible()
    })

    test("close on Esc", async () => {
      const { result, act } = await renderHook(() => useRef<HTMLDialogElement>(null))
      const screen = await render(
        <Dialog.Root ref={result.current}>
          <Dialog.Body>
            <Dialog.Header>
              <Dialog.Title>Test</Dialog.Title>
            </Dialog.Header>
            <Dialog.Content>
              <span>Hello</span>
            </Dialog.Content>
          </Dialog.Body>
        </Dialog.Root>
      )
      const helloText = screen.getByText("Hello")

      await act(() => result.current.current?.showModal())

      await expect.element(helloText).toBeVisible()

      await userEvent.keyboard("{Escape}")

      await expect.element(helloText).not.toBeVisible()
    })
  })
})