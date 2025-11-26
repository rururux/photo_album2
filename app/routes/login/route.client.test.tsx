import { createRoutesStub } from "react-router"
import { describe, expect, test, vi } from "vitest"
import { render } from "vitest-browser-react"
import LoginPage from "./route"

describe("LoginPage", () => {
  test("render", async () => {
    const Stub = createRoutesStub([
      {
        path: "/login",
        Component: LoginPage
      }
    ])

    const screen = await render(
      <Stub initialEntries={[ "/login" ]} />
    )

    const lineLoginButton = screen.getByRole("button", { name: "LINEでログイン" })
    const guestLoginButton = screen.getByRole("button", { name: "ゲストとしてログイン" })

    await expect.element(lineLoginButton).toBeVisible()
    await expect.element(guestLoginButton).toBeVisible()
  })

  describe("login button", () => {
    test.todo("line")

    test("guest", async () => {
      const handleGuestLogin = vi.fn()
      const Stub = createRoutesStub([
        {
          path: "/login",
          Component: LoginPage,
          action: handleGuestLogin
        }
      ])

      const screen = await render(
        <Stub initialEntries={[ "/login" ]} />
      )

      const guestLoginButton = screen.getByRole("button", { name: "ゲストとしてログイン" })

      await guestLoginButton.click()

      expect(handleGuestLogin).toBeCalled()
    })
  })
})