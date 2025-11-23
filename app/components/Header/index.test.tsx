import { describe, expect, test } from "vitest"
import { render } from "vitest-browser-react"
import { Header } from "."

describe("Header", () => {
  test("render", async () => {
    const screen = await render(
      <Header.Root>
        <Header.Title>Header</Header.Title>
      </Header.Root>
    )

    const header = screen.getByRole("banner")
    const headerTitle = screen.getByRole("heading", { name: "Header" })

    await expect.element(header).toBeInTheDocument()
    await expect.element(headerTitle).toBeInTheDocument()
  })
})