import { describe, expect, test, vi } from "vitest"
import { render } from "vitest-browser-react"
import { LineLoginButton } from "."

describe("LineLoginButton", () => {
  test("render", async () => {
    const screen = await render(
      <LineLoginButton />
    )

    const lineLoginButton = screen.getByRole("button")

    await expect.element(lineLoginButton).toBeInTheDocument()
  })

  test("onClick", async () => {
    const handleClick = vi.fn()
    const screen = await render(
      <LineLoginButton onClick={handleClick} />
    )

    const lineLoginButton = screen.getByRole("button")

    await lineLoginButton.click()

    expect(handleClick).toBeCalled()
  })
})