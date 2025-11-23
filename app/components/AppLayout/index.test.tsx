import { describe, expect, test } from "vitest"
import { render } from "vitest-browser-react"
import { AppLayout } from "."

describe("AppLayout", () => {
  test("render", async () => {
    const screen = await render(
      <AppLayout data-testid="appLayout" />
    )

    const appLayout = screen.getByTestId("appLayout")

    await expect.element(appLayout).toBeInTheDocument()
  })
})