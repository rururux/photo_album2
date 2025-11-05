import { createSelectSchema } from "drizzle-valibot"
import * as v from "valibot"
import { user } from "workers/lib/db/schema/authSchema"

const UserBaseSchema = createSelectSchema(user)
const UserClientSchema = v.pick(UserBaseSchema, [ "id", "name", "image" ])

export const UserSchema = v.pipe(
  UserBaseSchema,
  v.transform(data => ({ id: data.id, name: data.name, image: data.image })),
  UserClientSchema
)

export type UserSchemaType = v.InferOutput<typeof UserSchema>