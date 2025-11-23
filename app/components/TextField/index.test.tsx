import { describe, expect, test, vi } from "vitest"
import { render, renderHook } from "vitest-browser-react"
import { TextField } from "."
import { useForm } from "react-hook-form"
import * as v from "valibot"
import { valibotResolver } from "@hookform/resolvers/valibot"

const nonEmptyErrorMessage = "nonEmpty"
const minLengthErrorMessage = "minLength"

const TestSchema = v.object({
  name: v.pipe(
    v.string(),
    v.nonEmpty(nonEmptyErrorMessage),
    v.minLength(5, minLengthErrorMessage)
  )
})

describe("TextField", () => {
  test("render", async () => {
    const { result } = await renderHook(() => useForm({ defaultValues: { name: "" }, resolver: valibotResolver(TestSchema) }))
    const screen = await render(
      <TextField.Root name="name" control={result.current.control}>
        <TextField.Label>Label</TextField.Label>
        <TextField.Input />
      </TextField.Root>
    )

    const textField = screen.getByRole("textbox")

    await expect.element(textField).toBeVisible()
  })

  test("validation", async () => {
    const handleSubmit = vi.fn()
    const { result, act } = await renderHook(() => useForm({ defaultValues: { name: "" }, resolver: valibotResolver(TestSchema) }))
    const onSubmit = result.current.handleSubmit(handleSubmit)
    const screen = await render(
      <form title="form" onSubmit={onSubmit}>
        <TextField.Root name="name" control={result.current.control}>
          <TextField.Label>Label</TextField.Label>
          <TextField.Input />
          <TextField.ErrorText />
        </TextField.Root>
      </form>
    )

    const form = screen.getByTitle("form")
    const formElement = form.element() as HTMLFormElement
    const textField = screen.getByRole("textbox")

    await act(() => formElement.requestSubmit())

    await expect.element(screen.getByText(nonEmptyErrorMessage)).toBeVisible()

    await textField.fill("test")
    await act(() => formElement.requestSubmit())

    await expect.element(screen.getByText(minLengthErrorMessage)).toBeVisible()

    await textField.fill("test0123")
    await act(() => formElement.requestSubmit())

    await expect.element(screen.getByText(nonEmptyErrorMessage)).not.toBeInTheDocument()
    await expect.element(screen.getByText(minLengthErrorMessage)).not.toBeInTheDocument()
    expect(handleSubmit).toBeCalled()
  })
})