import { describe, expect, test } from "vitest"
import { render } from "vitest-browser-react"
import { Divider } from "."

describe("Divider", () => {
  test("render", async () => {
    const screen = await render(
      <Divider />
    )

    const divider = screen.getByRole("separator")

    await expect.element(divider).toBeVisible()
  })
})