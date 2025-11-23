import { describe, expect, test, vi } from "vitest"
import { render } from "vitest-browser-react"
import { Menu } from "."
import { Button } from "../Button"

describe("Menu", () => {
  test("render", async () => {
    const screen = await render(
      <Menu.Root>
        <Menu.Trigger>
          {({ triggerButtonProps }) => (
            <Button {...triggerButtonProps}>trigger</Button>
          )}
        </Menu.Trigger>
        <Menu.Popover>
          <Menu.List>
            <Menu.Item>Test</Menu.Item>
          </Menu.List>
        </Menu.Popover>
      </Menu.Root>
    )

    const triggerButton = screen.getByRole("button")

    await triggerButton.click()

    const menu = screen.getByRole("menu")

    await expect.element(menu).toBeVisible()
  })

  describe("width", async () => {
    let firstMenuWidth: number

    test("first", async () => {
      const screen = await render(
        <Menu.Root>
          <Menu.Trigger>
            {({ triggerButtonProps }) => (
              <Button {...triggerButtonProps}>trigger</Button>
            )}
          </Menu.Trigger>
          <Menu.Popover>
            <Menu.List>
              <Menu.Item>Test</Menu.Item>
            </Menu.List>
          </Menu.Popover>
        </Menu.Root>
      )

      await screen.getByRole("button").click()

      let menu = screen.getByRole("menu")
      let menuRect = menu.element().getBoundingClientRect()

      firstMenuWidth = menuRect.width

      expect(firstMenuWidth).toSatisfy(width => width % 56 === 0)
    })

    test("second", async () => {
      const screen = await render(
        <Menu.Root>
          <Menu.Trigger>
            {({ triggerButtonProps }) => (
              <Button {...triggerButtonProps}>trigger</Button>
            )}
          </Menu.Trigger>
          <Menu.Popover>
            <Menu.List>
              <Menu.Item>Teeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeest</Menu.Item>
            </Menu.List>
          </Menu.Popover>
        </Menu.Root>
      )

      await screen.getByRole("button").click()

      const menu = screen.getByRole("menu")
      const menuRect = menu.element().getBoundingClientRect()
      const secondMenuWidth = menuRect.width

      expect(firstMenuWidth !== secondMenuWidth).toBeTruthy()
      expect(secondMenuWidth).toSatisfy(width => width % 56 === 0)
    })
  })

  test("onAction", async () => {
    const handleClick = vi.fn()
    const screen = await render(
      <Menu.Root>
        <Menu.Trigger>
          {({ triggerButtonProps }) => (
            <Button {...triggerButtonProps}>trigger</Button>
          )}
        </Menu.Trigger>
        <Menu.Popover>
          <Menu.List>
            <Menu.Item onAction={handleClick}>Test</Menu.Item>
          </Menu.List>
        </Menu.Popover>
      </Menu.Root>
    )

    await screen.getByRole("button").click()

    const menuItem = screen.getByRole("menuitem")

    await menuItem.click()

    expect(handleClick).toHaveBeenCalled()
  })
})