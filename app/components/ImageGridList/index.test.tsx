import { describe, expect, test, vi } from "vitest"
import { render } from "vitest-browser-react"
import { ImageGridList } from "."

describe("ImageGridList", () => {
  test("render", async () => {
    const handleSelectionChange = vi.fn()
    const screen = await render(
      <ImageGridList.Root onSelectionChange={handleSelectionChange}>
        <ImageGridList.Item>Item</ImageGridList.Item>
      </ImageGridList.Root>
    )

    const imageGridList = screen.getByRole("grid")
    const imageGridListItem = imageGridList.getByRole("row")

    await expect.element(imageGridList).toBeInTheDocument()
    await expect.element(imageGridListItem).toBeInTheDocument()
  })

  test("selection", async () => {
    const handleSelectionChange = vi.fn()
    const screen = await render(
      <ImageGridList.Root onSelectionChange={handleSelectionChange}>
        <ImageGridList.Item>
          Item
        </ImageGridList.Item>
      </ImageGridList.Root>
    )

    const imageGridListItem = screen.getByRole("row")
    const imageGridListItemCheckbox = imageGridListItem.getByRole("checkbox")

    await imageGridListItemCheckbox.click({ force: true })

    await expect.element(screen.getByRole("row", { selected: true })).toBeInTheDocument()
    expect(handleSelectionChange).toBeCalled()
  })

  test("onAction", async () => {
    const handleSelectionChange = vi.fn()
    const handleAction = vi.fn()
    const screen = await render(
      <ImageGridList.Root onSelectionChange={handleSelectionChange}>
        <ImageGridList.Item onAction={handleAction}>
          Item
        </ImageGridList.Item>
      </ImageGridList.Root>
    )

    const imageGridListItem = screen.getByRole("row")

    await imageGridListItem.click()

    expect(handleAction).toBeCalled()
  })
})