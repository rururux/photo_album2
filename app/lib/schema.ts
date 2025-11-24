import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-valibot"
import * as v from "valibot"
import schemas from "workers/lib/db/schema"
import { user } from "workers/lib/db/schema/authSchema"

const UserBaseSchema = createSelectSchema(user)
export const UserClientSchema = v.pick(UserBaseSchema, [ "id", "name", "image" ])

export const UserSchema = v.pipe(
  UserBaseSchema,
  v.transform(data => ({ id: data.id, name: data.name, image: data.image })),
  UserClientSchema
)

export type UserSchemaType = v.InferOutput<typeof UserSchema>

export const AlbumInsertSchema = v.pick(createInsertSchema(schemas.albums), [ "name", "startDate", "endDate" ])
export const AlbumUpdateSchema = v.pick(createUpdateSchema(schemas.albums), [ "name", "startDate", "endDate" ])

export const PhotoInsertSchema = v.object({
  src: v.string(),
  date: v.string(),
  fileHash: v.string(),
  fileSize: v.number()
})
