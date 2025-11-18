import type { AppLoadContext } from "react-router"
import * as v from "valibot"
import { AlbumInsertSchema, AlbumUpdateSchema, PhotoInsertSchema, UserSchema } from "./schema"
import { AlbumWithPhotosSchema } from "~/schemas/album"
import schemas from "workers/lib/db/schema"
import { decodeAlbumId, decodePhotoId, encodeAlbumId } from "~/utils/sqids"
import { and, eq, inArray } from "drizzle-orm"

const initialPhotosHash = [
  "20d4cdaa95ebb71d981a5146a563c4edbde58488f51381fffbdd2fcc7b191963",
  "0ac11da4c8a91c0a4edd676610860e0f8984ef776748270ea5bbbeb9a8df2fc4",
  "c18876d3814ad400f82ef764145b1faed90180c920841a755b4746ea56168a9d",
  "575545f5e2bdcf3b08dc3d8b26e0a932c205205b64218e4d252e284d0cb4cb00",
  "9479516f5991c0f75f94935e7862e5b61d07cfbff403f1cb29ba8695ff4b1c7d",
  "cf2c5bf84fbc26f4d8cff942b1b529c02f63b173f8d8025c8cef9f3ee16cd995",
  "a9fcb169728faba8296b8b0a2af27e7f22f8adf738bb20f05d50b6f163dc01e4",
  "ccabbb993eff79adeac3f01862eb3f22061198314c0788874a8ac34154c165e1",
  "0d9352515bb4851380c0440b8de7b225cc5a609b49a20d735db8fc3afbb1d003",
  "d9245b2652af4dfdccfae0de865be08ffbb174842ae91f75157e83d79ed135a0",
  "1b840c581abcce40f7549a0999f9bacffea122a82080dd5e99419ae9e2601e92",
  "eb667b1f48ded00e5f6c526cf2aea2f9185df3fdf3f25b645b8cf77025ea70af",
  "1d18fd0cc87285e9df9320fa0c5446adbe8ce33f9189df2174570cecf254fd5c",
  "6acabda012f4ebd5426a30844a713487c9ee6bda7714a4509c73952c9e6c5ac8",
  "33b7e36764213a2523807bc89c86c7dbc5c1255101bba8612a927a241d8d16d4",
  "c64223ca9b1ad3d26995d027ba38efd799becefa2e93d71cd20d1274cc1294e6"
]
const initialPhotosHashSet = new Set(initialPhotosHash)

export class AlbumApi {
  #context: AppLoadContext

  constructor(
    context: AppLoadContext,
  ) {
    this.#context = context
  }

  async getGroupsByUser(userId: string) {
    const usersToGroups = await this.#context.db.query.usersToGroups.findMany({
      where: (table, { eq }) => eq(table.userId, userId),
      with: {
        group: {
          with: {
            usersToGroups: {
              with: { user: true }
            },
            albums: {
              with: { photos: true }
            }
          }
        }
      }
    })
    const groups = usersToGroups.map(usersToGroup => ({
      id: usersToGroup.group.id,
      name: usersToGroup.group.name,
      albums: usersToGroup.group.albums,
      users: usersToGroup.group.usersToGroups.map(usersToGroups => v.parse(UserSchema, usersToGroups.user))
    }))

    return groups
  }

  async getAlbumsByGroup(groupId: number) {
    const group = await this.#context.db.query.groups.findFirst({
      where: (t, { eq }) => eq(t.id, groupId),
      with: {
        albums: {
          with: { photos: true },
          orderBy: (t, { desc }) => [ desc(t.startDate), desc(t.endDate) ]
        }
      }
    })
    const transformed = v.parse(v.array(AlbumWithPhotosSchema), group?.albums)

    return transformed
  }

  async isGroupMember(userId: string, groupId: number) {
    const usersToGroups = await this.#context.db.query.usersToGroups.findFirst({
      where: (t, { and, eq }) => and(eq(t.userId, userId), eq(t.groupId, groupId))
    })

    return usersToGroups !== undefined
  }

  async canUserAccessAlbum(userId: string, albumId: string) {
    const decodedAlbumId = decodeAlbumId(albumId)
    const result = await this.#context.db.select()
      .from(schemas.usersToGroups)
      .leftJoin(schemas.user, eq(schemas.usersToGroups.userId, schemas.user.id))
      .leftJoin(schemas.albums, eq(schemas.usersToGroups.groupId, schemas.albums.groupId))
      .where(and(eq(schemas.user.id, userId), eq(schemas.albums.id, decodedAlbumId)))

    return result.length !== 0
  }

  async createAlbum(groupId: number, albumData: unknown) {
    const parsedNewAlbumData = v.parse(AlbumInsertSchema, albumData)
    const [{ id: createdAlbumId }] = await this.#context.db
      .insert(schemas.albums)
      .values({ groupId,  ...parsedNewAlbumData })
      .returning({ id: schemas.albums.id })

    return { createdAlbumId: encodeAlbumId(createdAlbumId)}
  }

  async updateAlbum(albumId: string, updateData: unknown) {
    const decodedAlbumId = decodeAlbumId(albumId)
    const parsedUpdateData = v.parse(AlbumUpdateSchema, updateData)

    await this.#context.db
      .update(schemas.albums)
      .set(parsedUpdateData)
      .where(eq(schemas.albums.id, decodedAlbumId))
  }

  async deleteAlbum(albumId: string) {
    const decodedAlbumId = decodeAlbumId(albumId)

    const [ returning ] = await this.#context.db.batch([
      this.#context.db
        .delete(schemas.photos)
        .where(eq(schemas.photos.albumId, decodedAlbumId))
        .returning({ deletedPhotoSrc: schemas.photos.src }),
      this.#context.db.delete(schemas.albums).where(eq(schemas.albums.id, decodedAlbumId))
    ])
    const deletedPhotoSrcs = returning.map(({ deletedPhotoSrc }) => deletedPhotoSrc)

    this.#context.cloudflare.ctx.waitUntil(
      this.cleanUpDeletedPhotos(deletedPhotoSrcs)
    )
  }

  async createPhotos(albumId: string, newPhotoDatas: unknown[]) {
    const decodedAlbumId = decodeAlbumId(albumId)
    const parsedNewItemDatas = newPhotoDatas.map(newPhoto => v.parse(PhotoInsertSchema, newPhoto))
    const insertValues = parsedNewItemDatas.map(item => ({
      albumId: decodedAlbumId,
      src: `/photo/${item.fileHash}`,
      date: new Date(item.date)
    }))

    const insertResult = await this.#context.db
      .insert(schemas.photos)
      .values(insertValues)
      .returning({ id: schemas.photos.id })
    const createdPhotoIds = insertResult.map(returning => returning.id)
    const fileDatas = parsedNewItemDatas.map(newPhotoData => ({ fileHash: newPhotoData.fileHash, fileSize: newPhotoData.fileSize }))

    return { createdPhotoIds, fileDatas }
  }

  async deletePhotos(albumId: string, photoIds: string[]) {
    const decodedAlbumId = decodeAlbumId(albumId)
    const decodedPhotoIds = photoIds.map(photoId => decodePhotoId(photoId))

    const returning = await this.#context.db
      .delete(schemas.photos)
      .where(
        and(inArray(schemas.photos.id, decodedPhotoIds), eq(schemas.photos.albumId, decodedAlbumId))
      )
      .returning({ deletedPhotoSrc: schemas.photos.src })
    const deletedPhotoSrcs = returning.map(({ deletedPhotoSrc }) => deletedPhotoSrc)

    this.#context.cloudflare.ctx.waitUntil(
      this.cleanUpDeletedPhotos(deletedPhotoSrcs)
    )
  }

  async cleanUpDeletedPhotos(deletedPhotoSrcs: string[]) {
    const bucketKeys = deletedPhotoSrcs
      .map(deletedPhotoSrc => deletedPhotoSrc.match(/[^/]+$/)?.at(0))
      .filter(bucketKey => typeof bucketKey === "string")
      .filter(bucketKey => !initialPhotosHashSet.has(bucketKey))

    await this.#context.cloudflare.env.BUCKET.delete(bucketKeys)
  }
}