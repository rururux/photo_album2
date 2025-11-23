import { describe, expect, test } from "vitest"
import { render } from "vitest-browser-react"
import { ThumbGrid } from "."

describe("ThumbGrid", () => {
  test("render", async () => {
    const screen = await render(
      <ThumbGrid.Root data-testid="thumbGrid">
        <ThumbGrid.Item />
      </ThumbGrid.Root>
    )

    const thumbGrid = screen.getByTestId("thumbGrid")

    await expect.element(thumbGrid).toBeInTheDocument()
  })
})