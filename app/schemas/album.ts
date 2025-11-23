import * as v from "valibot"
import schemas from "workers/lib/db/schema"
import { createSelectSchema } from "drizzle-valibot"
import { encodeAlbumId, encodePhotoId } from "~/utils/sqids"

const AlbumSchema = createSelectSchema(schemas.albums, {
  id: schema => v.pipe(schema, v.transform(id => encodeAlbumId(id)))
})
const PhotoSchema = createSelectSchema(schemas.photos, {
  id: schema => v.pipe(schema, v.transform(id => encodePhotoId(id)))
})
export const AlbumWithPhotosSchema = v.object({
  ...AlbumSchema.entries,
  photos: v.array(PhotoSchema)
})

export type AlbumSchemaType = v.InferOutput<typeof AlbumSchema>
export type PhotoSchemaType = v.InferOutput<typeof PhotoSchema>
export type AlbumWithPhotosSchemaType = v.InferOutput<typeof AlbumWithPhotosSchema>