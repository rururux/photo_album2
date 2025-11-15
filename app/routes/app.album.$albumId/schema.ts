import * as v from "valibot"
import { AlbumInsertSchema, PhotoInsertSchema } from "~/lib/schema"

export const AlbumFormSchema = v.pipe(
  v.object({
    album: AlbumInsertSchema,
    newItems: v.array(
      v.object({
        ...PhotoInsertSchema.entries,
        id: v.string(),
      })
    ),
    files: v.array(v.file())
  }),
  v.forward(
    v.check(({ newItems, files }) => newItems.length === files.length),
    [ "files" ]
  )
)

export type AlbumFormSchemaType = v.InferInput<typeof AlbumFormSchema>