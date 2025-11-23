import { describe, expect, test, vi } from "vitest"
import { render } from "vitest-browser-react"
import { AlbumInfo } from "."

const dummyAlbum = { name: "album", startDate: new Date().toDateString(), endDate: new Date().toDateString() }

describe("AlbumInfo", () => {
  test("render", async () => {
    const handleChange = vi.fn()
    const handleDateRangeButtonClick = vi.fn()
    const screen = await render(
      <AlbumInfo
        album={dummyAlbum}
        onAlbumNameChange={handleChange}
        onEditDateRangeButtonClick={handleDateRangeButtonClick}
      />
    )

    const albumNameInput = screen.getByRole("textbox")

    await expect.element(albumNameInput).toBeInTheDocument()
  })

  test("onALbumNameChange", async () => {
    const handleChange = vi.fn()
    const handleDateRangeButtonClick = vi.fn()
    const screen = await render(
      <AlbumInfo
        album={dummyAlbum}
        isEditable
        onAlbumNameChange={handleChange}
        onEditDateRangeButtonClick={handleDateRangeButtonClick}
      />
    )

    const albumNameInput = screen.getByRole("textbox")

    await albumNameInput.fill("test")

    expect(handleChange).toBeCalled()
  })

  test("onEditDateRangeButtonClick", async () => {
    const handleChange = vi.fn()
    const handleDateRangeButtonClick = vi.fn()
    const screen = await render(
      <AlbumInfo
        album={dummyAlbum}
        isEditable
        onAlbumNameChange={handleChange}
        onEditDateRangeButtonClick={handleDateRangeButtonClick}
      />
    )

    const editDateRangeButton = screen.getByRole("button")

    await editDateRangeButton.click()

    expect(handleDateRangeButtonClick).toBeCalled()
  })
})