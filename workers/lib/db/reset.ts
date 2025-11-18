import type { AppLoadContext } from "react-router"
import schemas from "./schema"
import { eq, inArray } from "drizzle-orm"

type InsertGroupType = typeof schemas.groups.$inferInsert
type InsertAlbumType = typeof schemas.albums.$inferInsert
type InsertPhotoType = typeof schemas.photos.$inferInsert

const initialGroupData = { name: "サンプルグループ" } satisfies InsertGroupType
const createInitialAlbumDatas = (groupId: number) => [
  {
    groupId,
    name: "サンプルアルバム 1",
    startDate: "2025-11-01",
    endDate: "2025-11-15"
  },
  {
    groupId,
    name: "サンプルアルバム 2",
    startDate: "2024-12-24",
    endDate: "2025-01-05"
  },
  {
    groupId,
    name: "サンプルアルバム 3",
    startDate: "2024-06-01",
    endDate: "2024-06-10"
  },
] satisfies InsertAlbumType[]

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

const createInitialPhotoDatas = (albumIds: number[]) => [
  // サンプルアルバム 1: 2025-11-01 〜 2025-11-15 (7枚)
  {
    albumId: albumIds[0],
    date: new Date("2025-11-01"),
    src: "/photo/" + initialPhotosHash[0]
  },
  {
    albumId: albumIds[0],
    date: new Date("2025-11-03"),
    src: "/photo/" + initialPhotosHash[1]
  },
  {
    albumId: albumIds[0],
    date: new Date("2025-11-05"),
    src: "/photo/" + initialPhotosHash[2]
  },
  {
    albumId: albumIds[0],
    date: new Date("2025-11-08"),
    src: "/photo/" + initialPhotosHash[3]
  },
  {
    albumId: albumIds[0],
    date: new Date("2025-11-10"),
    src: "/photo/" + initialPhotosHash[4]
  },
  {
    albumId: albumIds[0],
    date: new Date("2025-11-13"),
    src: "/photo/" + initialPhotosHash[5]
  },
  {
    albumId: albumIds[0],
    date: new Date("2025-11-15"),
    src: "/photo/" + initialPhotosHash[6]
  },

  // サンプルアルバム 2: 2024-12-24 〜 2025-01-05 (5枚)
  {
    albumId: albumIds[1],
    date: new Date("2024-12-24"),
    src: "/photo/" + initialPhotosHash[7]
  },
  {
    albumId: albumIds[1],
    date: new Date("2024-12-28"),
    src: "/photo/" + initialPhotosHash[8]
  },
  {
    albumId: albumIds[1],
    date: new Date("2025-01-01"),
    src: "/photo/" + initialPhotosHash[9]
  },
  {
    albumId: albumIds[1],
    date: new Date("2025-01-03"),
    src: "/photo/" + initialPhotosHash[10]
  },
  {
    albumId: albumIds[1],
    date: new Date("2025-01-05"),
    src: "/photo/" + initialPhotosHash[11]
  },

  // サンプルアルバム 3: 2024-06-01 〜 2024-06-10 (4枚)
  {
    albumId: albumIds[2],
    date: new Date("2024-06-01"),
    src: "/photo/" + initialPhotosHash[12]
  },
  {
    albumId: albumIds[2],
    date: new Date("2024-06-04"),
    src: "/photo/" + initialPhotosHash[13]
  },
  {
    albumId: albumIds[2],
    date: new Date("2024-06-07"),
    src: "/photo/" + initialPhotosHash[14]
  },
  {
    albumId: albumIds[2],
    date: new Date("2024-06-10"),
    src: "/photo/" + initialPhotosHash[15]
  }
] satisfies InsertPhotoType[]

async function deleteAllGuestData(db: AppLoadContext["db"], bucket: R2Bucket) {
  const guestUserEmail = "email@example.com"
  const selectResult = await db.select({ userId: schemas.user.id, groupId: schemas.usersToGroups.groupId, albumId: schemas.albums.id })
    .from(schemas.user)
    .leftJoin(schemas.usersToGroups, eq(schemas.usersToGroups.userId, schemas.user.id))
    .leftJoin(schemas.albums, eq(schemas.albums.groupId, schemas.usersToGroups.groupId))
    .where(eq(schemas.user.email, guestUserEmail))

  if (selectResult.length === 0) {
    throw new Error("select().where(eq(guestUserEmail, user.email)).result.length === 0")
  }

  const [ { userId: guestUserId } ] = selectResult
  const deleteTargetGroupIds = Array.from(new Set(selectResult.map(result => result.groupId).filter(id => id !== null)))
  const deleteTargetAlbumIds = Array.from(new Set(selectResult.map(result => result.albumId).filter(id => id !== null)))

  const [ deletePhotoResults ] = await db.batch([
    db.delete(schemas.photos).where(inArray(schemas.photos.albumId, deleteTargetAlbumIds)).returning({ deletedPhotoSrc: schemas.photos.src }),
    db.delete(schemas.albums).where(inArray(schemas.albums.groupId, deleteTargetGroupIds)),
    db.delete(schemas.usersToGroups).where(eq(schemas.usersToGroups.userId, guestUserId)),
    db.delete(schemas.groups).where(inArray(schemas.groups.id, deleteTargetGroupIds)),

    db.update(schemas.user).set({ defaultGroup: null }).where(eq(schemas.user.id, guestUserId))
  ])

  // filter initial photos hash
  const bucketKeys = deletePhotoResults
    .map(deletePhotoResult => deletePhotoResult.deletedPhotoSrc.match(/[^\/]+$/)?.at(0))
    .filter(bucketKey => typeof bucketKey === "string")
    .filter(bucketKey => !initialPhotosHashSet.has(bucketKey))

  await bucket.delete(bucketKeys)

  return guestUserId
}

async function insertInitialData(guestUserId: string, db: AppLoadContext["db"]) {
  const [ { groupId } ] = await db.insert(schemas.groups).values(initialGroupData).returning({ groupId: schemas.groups.id })

  const [ , insertAlbumResult ] = await db.batch([
    db.insert(schemas.usersToGroups).values({ userId: guestUserId, groupId }),
    db.insert(schemas.albums).values(createInitialAlbumDatas(groupId)).returning({ albumId: schemas.albums.id })
  ])
  const insertedAlbumIds = insertAlbumResult.map(result => result.albumId)

  await db.insert(schemas.photos).values(createInitialPhotoDatas(insertedAlbumIds))
}

export async function resetGuestData(db: AppLoadContext["db"], bucket: R2Bucket) {
  const guestUserId = await deleteAllGuestData(db, bucket)
  await insertInitialData(guestUserId, db)
}