import { sql } from "drizzle-orm"
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const albums = sqliteTable("albums", {
  id: int().primaryKey({ autoIncrement: true }),
  groupId: int().notNull(),
  name: text().notNull(),
  startDate: text().notNull(),
  endDate: text().notNull(),
  createdAt: int("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: int("updated_at", { mode: "timestamp_ms" })
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull()
})

export const photos = sqliteTable("photos", {
  id: int().primaryKey({ autoIncrement: true }),
  date: int({ mode: "timestamp_ms" }).notNull(),
  albumId: int().notNull(),
  createdAt: int({ mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: int({ mode: "timestamp_ms" })
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull()
})
