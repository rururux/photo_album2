import { describe, expect, test, vi } from "vitest"
import { render } from "vitest-browser-react"
import { PhotoGridList } from "."

const dummyPhotos = [
  { id: "1", src: "photo1.jpg", fileHash: "photo1" },
  { id: "2", src: "photo2.jpg", fileHash: "photo2" },
  { id: "3", src: "photo3.jpg" },
]

describe("PhotoGridList", () => {
  test("render", async () => {
    const setSelection = vi.fn()
    const screen = await render(
      <PhotoGridList
        photoItems={dummyPhotos}
        isEditable={false}
        selection={new Set()}
        setSelection={setSelection}
      />
    )

    const images = screen.getByRole("img")

    expect(images).toHaveLength(dummyPhotos.length)

    const header = screen.getByText(`画像 ${dummyPhotos.length}枚`)

    expect(header).toBeInTheDocument()
  })

  test("selection", async () => {
    const setSelection = vi.fn()
    const screen = await render(
      <PhotoGridList
        photoItems={dummyPhotos}
        isEditable={true}
        selection={new Set()}
        setSelection={setSelection}
      />
    )

    const grid = screen.getByRole("grid")
    const cells = grid.getByRole("gridcell").first()

    await cells.click()

    expect(setSelection).toBeCalled()
  })
})
