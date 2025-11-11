import * as v from "valibot"

export const CreateAlbumFormSchema = v.pipe(
  v.strictObject({
    album: v.strictObject({
      name: v.string(),
      startDate: v.string(),
      endDate: v.string(),
    }),
    items: v.pipe(
      v.array(
        v.strictObject({
          src: v.string(),
          date: v.string(),
          fileHash: v.string(),
          fileSize: v.number()
        })
      ),
      v.minLength(1)
    ),
    files: v.pipe(
      v.array(v.file()),
      v.minLength(1)
    )
  }),
  v.forward(
    v.check(({ items, files }) => items.length === files.length),
    [ "files" ]
  )
)