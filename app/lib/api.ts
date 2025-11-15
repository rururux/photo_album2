import type { AppLoadContext } from "react-router"
import * as v from "valibot"
import { UserSchema } from "./schema"
import { AlbumWithPhotosSchema } from "~/schemas/album"
import schemas from "workers/lib/db/schema"
import { decodeAlbumId, decodePhotoId } from "~/utils/sqids"
import { and, eq, inArray } from "drizzle-orm"

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
          with: { photos: true }
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
      .map(deletedPhotoSrc => deletedPhotoSrc.match(/[^\/]+$/)?.at(0))
      .filter(bucketKey => typeof bucketKey === "string")

    await this.#context.cloudflare.env.BUCKET.delete(bucketKeys)
  }
}