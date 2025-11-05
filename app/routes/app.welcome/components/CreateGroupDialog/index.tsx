import { useId, type RefObject } from "react"
import type { Control, FieldValues } from "react-hook-form"
import { Button } from "~/components/Button"
import { Dialog } from "~/components/Dialog"
import { TextField } from "~/components/TextField"

type CreateGroupDialogProp<T extends FieldValues> = {
  control: Control<T>
  onSubmit: VoidFunction
  onClose: VoidFunction
  ref: RefObject<HTMLDialogElement | null>
}

export function CreateGroupDialog<T extends FieldValues>({ control, onSubmit, onClose, ref }: CreateGroupDialogProp<T>) {
  const formId = useId()

  return (
    <Dialog.Root onClose={onClose} ref={ref}>
      <Dialog.Body>
        <Dialog.Header>
          <Dialog.Title>グループを作成</Dialog.Title>
        </Dialog.Header>
        <Dialog.Content>
          <form id={formId} onSubmit={onSubmit}>
            <TextField.Root name="name" control={control}>
              <TextField.Label>グループタイトル</TextField.Label>
              <TextField.Input />
              <TextField.SupportingText>*required</TextField.SupportingText>
              <TextField.ErrorText />
            </TextField.Root>
          </form>
        </Dialog.Content>
        <Dialog.Footer>
          <Button onClick={() => ref.current?.requestClose()}>キャンセル</Button>
          <Button form={formId} type="submit">作成</Button>
        </Dialog.Footer>
      </Dialog.Body>
    </Dialog.Root>
  )
}