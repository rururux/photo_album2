import { createContext, useContext, useId, type HTMLAttributes, type InputHTMLAttributes, type RefObject } from "react"
import { mergeProps, useObjectRef } from "react-aria"
import { useController, type Control, type ControllerRenderProps, type FieldValues } from "react-hook-form"
import styles from "./styles.module.css"
import capitalize from "~/utils/capitalize"

export const TextField = {
  Root, Label, Input, SupportingText, ErrorText
}

const TextFieldContext = createContext<{
  control: Control<FieldValues>,
  inputId: string,
  inputRef: RefObject<HTMLInputElement | null>,
  inputProps: Omit<ControllerRenderProps<FieldValues, string>, "ref">,
  errorMessage: string | null
}>({
  control: null!,
  inputId: "",
  inputRef: { current: null },
  inputProps: null!,
  errorMessage: null
})

type TextFieldRootProps<T extends { [x: string]: string }> = HTMLAttributes<HTMLDivElement> & {
  control: Control<T>,
  name: string,
  required?: boolean,
  variant?: "filled" | "outlined"
}

function Root<T extends FieldValues>({ control, name, required, variant = "filled", children, ...props }: TextFieldRootProps<T>) {
  const inputId = useId()
  // @ts-expect-error UGHHH
  const { field: { ref, ...inputProps }, fieldState: { error: fieldError } } = useController<T>({ name, control, defaultValue: "" })
  const inputRef = useObjectRef(ref)
  const mergedProps = mergeProps({ className: [ styles.textField, styles[`textField${capitalize(variant)}`] ].join(" "), onClick: () => inputRef.current?.focus() }, props)
  const errorMessage = fieldError?.message ?? null

  return (
    // @ts-expect-error UGHHHHHHH
    <TextFieldContext value={{ control, inputId, inputRef, inputProps, errorMessage }}>
      <div {...mergedProps}>
        {children}
      </div>
    </TextFieldContext>
  )
}

function Label(props: Omit<HTMLAttributes<HTMLLabelElement>, "htmlFor">) {
  const { inputId } = useContext(TextFieldContext)
  const mergedProps = mergeProps({ className: styles.textFieldLabel }, props)

  return (
    <label {...mergedProps} htmlFor={inputId} />
  )
}

function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const { inputId, inputProps, inputRef } = useContext(TextFieldContext)
  const mergedProps = mergeProps({ id: inputId, className: styles.textFieldInput }, inputProps, props)

  return (
    <>
      <input {...mergedProps} placeholder="" ref={inputRef} />
      <hr className={styles.textFieldIndicator} />
    </>
  )
}

function SupportingText({ children }: HTMLAttributes<HTMLSpanElement>) {
  const { errorMessage } = useContext(TextFieldContext)

  return (
    !errorMessage && <span className={styles.textFieldSupportingText}>{children}</span>
  )
}

function ErrorText() {
  const { errorMessage } = useContext(TextFieldContext)

  return (
    errorMessage && <span className={styles.textFieldErrorText}>{errorMessage}</span>
  )
}