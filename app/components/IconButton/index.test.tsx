import { describe, expect, test, vi } from "vitest"
import { render } from "vitest-browser-react"
import { IconButton } from "."
import { Icon } from "../Icon"

describe("IconButton", () => {
  test("render", async () => {
    const screen = await render(
      <IconButton>
        <Icon icon="add" />
      </IconButton>
    )

    const iconButton = screen.getByRole("button")
    const icon = screen.getByRole("img")

    await expect.element(iconButton).toBeVisible()
    await expect.element(icon).toBeVisible()
  })

  test("onClick", async () => {
    const handleClick = vi.fn()
    const screen = await render(
      <IconButton onClick={handleClick}>
        <Icon icon="add" />
      </IconButton>
    )

    const iconButton = screen.getByRole("button")

    await iconButton.click()

    expect(handleClick).toHaveBeenCalled()
  })
})