import { describe, expect, test, vi } from "vitest"
import { render } from "vitest-browser-react"
import { FloatingActionButton } from "."

describe("FloatingActionButton", () => {
  test("render", async () => {
    const screen = await render(
      <FloatingActionButton>button</FloatingActionButton>
    )

    const fab = screen.getByRole("button")

    await expect.element(fab).toBeVisible()
  })

  test("onClick", async () => {
    const handleClick = vi.fn()
    const screen = await render(
      <FloatingActionButton onClick={handleClick}>button</FloatingActionButton>
    )

    const fab = screen.getByRole("button")

    await fab.click()

    expect(handleClick).toHaveBeenCalled()
  })
})