import { describe, expect, test } from "vitest"
import { render } from "vitest-browser-react"
import { createRoutesStub } from "react-router"
import Welcome, { type loader } from "./route"

const testUser = {
  id: "testId",
  name: "testName",
  image: "testImage"
}

describe("Welcome", () => {
  test("render", async () => {
    const Stub = createRoutesStub([
      {
        path: "/app/welcome",
        // @ts-expect-error matches
        Component: Welcome,
        loader: () => ({
          user: testUser,
          groups: []
        } satisfies Awaited<ReturnType<typeof loader>>)
      }
    ])
    const screen = await render(
      <Stub initialEntries={[ "/app/welcome" ]} />
    )

    await expect.element(screen.getByText(testUser.name + "さん")).toBeInTheDocument()
  })

  test("create group", async () => {
    const Stub = createRoutesStub([
      {
        path: "/app/welcome",
        // @ts-expect-error matches
        Component: Welcome,
        loader: () => ({
          user: testUser,
          groups: []
        } satisfies Awaited<ReturnType<typeof loader>>),
        action: async ({ request }) => {
          const json = await request.json()

          expect(json).toEqual({ action: "createGroup", name: "Test Group" })
        }
      }
    ])
    const screen = await render(
      <Stub initialEntries={[ "/app/welcome" ]} />
    )

    const createGroupButton = screen.getByRole("button")

    await expect.element(createGroupButton).toBeVisible()

    await createGroupButton.click()

    const createGroupDialogTitleInput = screen.getByRole("textbox")
    const createGroupDialogCreateButton = screen.getByRole("button", { name: "作成", exact: true })

    await expect.element(createGroupDialogTitleInput).toBeVisible()
    await expect.element(createGroupDialogCreateButton).toBeVisible()

    await createGroupDialogTitleInput.fill("Test Group")
    await createGroupDialogCreateButton.click()
  })
})

