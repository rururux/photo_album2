import { describe, expect, test, vi } from "vitest"
import { render } from "vitest-browser-react"
import { Button } from "."

describe("Button", () => {
  test("render", async () => {
    const screen = await render(
      <Button>button</Button>
    )

    const button = screen.getByRole("button")

    await expect.element(button).toBeVisible()
  })

  test("onClick", async () => {
    const handleClick = vi.fn()
    const screen = await render(
      <Button onClick={handleClick}>button</Button>
    )

    const button = screen.getByRole("button")

    await button.click()

    expect(handleClick).toHaveBeenCalled()
  })
})