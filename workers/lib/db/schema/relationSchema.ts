import { relations } from "drizzle-orm"
import { albums, photos } from "./albumSchema"
import { user } from "./authSchema"
import { groups, usersToGroups } from "./groupSchema"

export const usersRelations = relations(user, ({ many }) => ({
  usersToGroups: many(usersToGroups)
}))

export const groupsRelations = relations(groups, ({ many }) => ({
  usersToGroups: many(usersToGroups),
  albums: many(albums)
}))

export const usersToGroupsRelations = relations(usersToGroups, ({ one }) => ({
  group: one(groups, {
    fields: [ usersToGroups.groupId ],
    references: [ groups.id ]
  }),
  user: one(user, {
    fields: [ usersToGroups.userId ],
    references: [ user.id ]
  })
}))

export const albumsRelations = relations(albums, ({ one, many }) => ({
  group: one(groups, {
    fields: [ albums.groupId ],
    references: [ groups.id ]
  }),
  photos: many(photos)
}))

export const photosRelations = relations(photos, ({ one }) => ({
	album: one(albums, {
		fields: [ photos.albumId ],
		references: [ albums.id ],
	})
}))
