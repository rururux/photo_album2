import type { AppLoadContext } from "react-router"
import * as v from "valibot"
import { UserSchema } from "./schema"
import { AlbumWithPhotosSchema } from "~/schemas/album"

export class AlbumApi {
  #database: AppLoadContext["db"]

  constructor(
    database: AppLoadContext["db"]
  ) {
    this.#database = database
  }

  async getGroupsByUser(userId: string) {
    const usersToGroups = await this.#database.query.usersToGroups.findMany({
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
    const group = await this.#database.query.groups.findFirst({
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
    const usersToGroups = await this.#database.query.usersToGroups.findFirst({
      where: (t, { and, eq }) => and(eq(t.userId, userId), eq(t.groupId, groupId))
    })

    return usersToGroups !== undefined
  }
}