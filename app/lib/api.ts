import type { AppLoadContext } from "react-router"

export class AlbumApi {
  #database: AppLoadContext["db"]

  constructor(
    database: AppLoadContext["db"]
  ) {
    this.#database = database
  }

  async isGroupMember(userId: string, groupId: number) {
    const usersToGroups = await this.#database.query.usersToGroups.findFirst({
      where: (t, { and, eq }) => and(eq(t.userId, userId), eq(t.groupId, groupId))
    })

    return usersToGroups !== undefined
  }
}