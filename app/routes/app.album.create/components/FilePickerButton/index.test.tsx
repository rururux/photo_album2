import { describe, expect, test, vi } from "vitest"
import { render } from "vitest-browser-react"
import { page } from "vitest/browser"
import { FilePickerButton } from "."

describe("FilePickerButton", () => {
  test("render", async () => {
    const handleChange = vi.fn()
    const screen = await render(
      <FilePickerButton onChange={handleChange} />
    )

    const filePickerButton = screen.getByRole("button")

    await expect.element(filePickerButton).toBeInTheDocument()
  })

  describe("onChange", async () => {
    test("no file", async () => {
      const handleChange = vi.fn()
      const screen = await render(
        <FilePickerButton onChange={handleChange} />
      )

      const filePickerButton = screen.getByRole("button")
      const filePickerButtonInput = page.elementLocator(filePickerButton.element().previousElementSibling!)

      await expect.element(filePickerButtonInput).toBeInTheDocument()

      await filePickerButtonInput.upload([])

      expect(handleChange).not.toBeCalled()
    })
  })

  test("with file", async () => {
    const handleChange = vi.fn()
    const screen = await render(
      <FilePickerButton onChange={handleChange} />
    )

    const filePickerButton = screen.getByRole("button")
    const filePickerButtonInput = page.elementLocator(filePickerButton.element().previousElementSibling!)

    await expect.element(filePickerButtonInput).toBeInTheDocument()

    await filePickerButtonInput.upload(new File([], "test.jpg", { type: "image/jpg" }))

    expect(handleChange).toBeCalled()
  })
})