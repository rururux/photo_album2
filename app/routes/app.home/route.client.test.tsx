import { describe, expect, test, vi } from "vitest"
import { render } from "vitest-browser-react"
import { createRoutesStub } from "react-router"
import HomePage from "./route"
import { createAlbumApiMock } from "test/utils/albumApiMock"

const testUser = {
  id: "testId",
  name: "testName",
  image: "testImage"
}

describe("HomePage", () => {
  const albumApiMock = createAlbumApiMock()

  test("render", async () => {
    const Stub = createRoutesStub([
      {
        path: "/app/home",
        // @ts-expect-error matches
        Component: HomePage,
        loader: async () => {
          return {
            user: testUser,
            albums: await albumApiMock.getAlbumsByGroup(1)
          }
        }
      }
    ])
    const screen = await render(
      <Stub initialEntries={[ "/app/home" ]} />
    )

    await expect.element(screen.getByText("MY Album")).toBeInTheDocument()
  })

  test("logout", async () => {
    const actionHandler = vi.fn()
    const Stub = createRoutesStub([
      {
        path: "/app/home",
        // @ts-expect-error matches
        Component: HomePage,
        loader: async () => {
          return {
            user: testUser,
            albums: await albumApiMock.getAlbumsByGroup(1)
          }
        },
        action: actionHandler
      }
    ])
    const screen = await render(
      <Stub initialEntries={[ "/app/home" ]} />
    )

    const avatarButton = screen.getByRole("button", { name: testUser.name })

    await avatarButton.click()

    const menuItem = screen.getByRole("menuitem", { name: "ログアウト" })

    await menuItem.click()

    expect(actionHandler).toBeCalled()
  })

  test("floating action button", async () => {
    const loaderHandler = vi.fn()
    const Stub = createRoutesStub([
      {
        path: "/app/home",
        // @ts-expect-error matches
        Component: HomePage,
        loader: async () => {
          return {
            user: testUser,
            albums: await albumApiMock.getAlbumsByGroup(1)
          }
        },
      },
      {
        path: "/app/album/create",
        Component: () => <div></div>,
        loader: loaderHandler
      }
    ])
    const screen = await render(
      <Stub initialEntries={[ "/app/home" ]} />
    )

    const fab = screen.getByRole("button").last()

    await fab.click()

    expect(loaderHandler).toBeCalled()
  })
})