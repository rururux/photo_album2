import { describe, expect, test } from "vitest"
import { render } from "vitest-browser-react"
import { Icon } from "."

describe("Icon", () => {
  test("render", async () => {
    const screen = await render(
      <Icon icon="add" />
    )

    const icon = screen.getByRole("img")

    await expect.element(icon).toBeVisible()
  })
})