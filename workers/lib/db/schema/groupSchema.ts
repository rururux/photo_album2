import { int, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { user } from "./authSchema"

export const groups = sqliteTable("groups", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull()
})

export const usersToGroups = sqliteTable("users_to_groups",
  {
    userId: text().notNull().references(() => user.id),
    groupId: int().notNull().references(() => groups.id)
  },
  t => [ primaryKey({ columns: [ t.userId, t.groupId ] }) ]
)
