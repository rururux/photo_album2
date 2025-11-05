import * as v from "valibot"

export const CreateGroupFormSchema = v.object({
  name: v.pipe(
    v.string(),
    v.nonEmpty("タイトルを入力してください")
  )
})

const CreateGroupActionSchema = v.strictObject({
  action: v.literal("createGroup"),
  ...CreateGroupFormSchema.entries
})

const SetDefaultGroupActionSchema = v.strictObject({
  action: v.literal("setDefaultGroup"),
  groupId: v.number()
})

export const RouteActionSchema = v.variant("action", [ CreateGroupActionSchema, SetDefaultGroupActionSchema ])