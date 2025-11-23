import { describe, expect, test } from "vitest"
import { render } from "vitest-browser-react"
import { Avatar } from "."

describe("Avatar", () => {
  test("render", async () => {
    const screen = await render(
      <Avatar name="guest" data-testid="avatar" />
    )

    const avatar = screen.getByTestId("avatar")

    await expect.element(avatar).toBeInTheDocument()
  })

  test("image", async () => {
    const screen = await render(
      <Avatar name="guest" image="/nothing.jpg" data-testid="avatar" />
    )

    const avatar = screen.getByTestId("avatar")
    const avatarImg = avatar.getByRole("img")

    await expect.element(avatar).toBeInTheDocument()
    await expect.element(avatarImg).toBeInTheDocument()
  })
})