import { describe, expect, test, vi } from "vitest"
import { render } from "vitest-browser-react"
import { AvatarButton } from "."

describe("AvatarButton", () => {
  test("render", async () => {
    const screen = await render(
      <AvatarButton avatarSrc="/nothing.jpg" />
    )

    const avatarButton = screen.getByRole("button")

    await expect.element(avatarButton).toBeInTheDocument()
  })

  test("onClick", async () => {
    const handleClick = vi.fn()
    const screen = await render(
      <AvatarButton avatarSrc="/nothing.jpg" onClick={handleClick} />
    )

    const avatarButton = screen.getByRole("button")

    await avatarButton.click()

    expect(handleClick).toBeCalled()
  })
})