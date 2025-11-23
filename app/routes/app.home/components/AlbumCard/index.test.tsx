import { describe, expect, test } from "vitest"
import { render } from "vitest-browser-react"
import { AlbumCard } from "."
import { createRoutesStub } from "react-router"

const dummyAlbum = {
  id: "test",
  groupId: 0,
  name: "album",
  startDate: new Date().toDateString(),
  endDate: new Date().toDateString(),
  createdAt: new Date(),
  updatedAt: new Date(),
  photos: [
    {
        id: "photo",
        albumId: "test",
        src: "/nothing.jpg",
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
    }
  ]
}

describe("AlbumCard", () => {
  test("render", async () => {
    // <Link /> コンポーネントを使っているので createRoutesStub が必要
    const Stub = createRoutesStub([
      {
        path: "/app/home",
        Component: () => <AlbumCard album={dummyAlbum} />,
      }
    ])
    const screen = await render(
      <Stub initialEntries={["/app/home"]} />
    )

    const albumCard = screen.getByRole("article")

    await expect.element(albumCard).toBeInTheDocument()
  })
})