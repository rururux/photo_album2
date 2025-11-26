import { test as baseTest } from "vitest"
import { getTestInstanceMemory } from "better-auth/test"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { drizzle } from "drizzle-orm/d1"
import schemas from "../../workers/lib/db/schema";

function initDB() {
  return drizzle(globalThis.db, { schema: schemas, casing: "snake_case" })
}

function initAuth(db: ReturnType<typeof initDB>) {
  return getTestInstanceMemory({
    emailAndPassword: { enabled: true },
    database: drizzleAdapter(db, { provider: "sqlite" }),
    user: {
      additionalFields: {
        defaultGroup: { type: "number", required: false }
      }
    }
  })
}

export const test = baseTest.extend<{ db: ReturnType<typeof initDB>, authInstance: Awaited<ReturnType<typeof initAuth>> }>({
  db: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const db = initDB()

      await use(db)
    },
    { scope: "worker" }
  ],
  authInstance: [
    async ({ db }, use) => {
      const auth = await initAuth(db)

      await use(auth)
    },
    { scope: "worker" }
  ]
})