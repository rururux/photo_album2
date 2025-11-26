import { describe, expect } from "vitest"
import { eq } from "drizzle-orm"
import * as v from "valibot"
import { action, loader } from "./route"
import { test } from "test/integration/testInstance"
import schemas from "workers/lib/db/schema"
import { createAlbumApiMock } from "test/utils/albumApiMock"
import { isRRResponse } from "test/utils/isRRResponse"

describe("HomePage", () => {
  const albumApiMock = createAlbumApiMock()

  describe("loader", () => {
    describe("with session", () => {
      test("defaultGroup === null", async ({ authInstance }) => {
        const { headers } = await authInstance.signInWithTestUser()
        const request = new Request("http://localhost:5173/app/home", { headers })
        // @ts-expect-error test
        const promise = loader({ request, context: { auth: authInstance.auth } })

        await expect(promise).resolves.toBeInstanceOf(Response)
      })

      test("defaultGroup !== null", async ({ db, authInstance }) => {
        const { user, headers } = await authInstance.signInWithTestUser()

        await db.update(schemas.user).set({ defaultGroup: 1 }).where(eq(schemas.user.id, user.id))

        const request = new Request("http://localhost:5173/app/home", { headers })
        // @ts-expect-error test
        const promise = loader({ request, context: { auth: authInstance.auth, albumApi: albumApiMock } })

        await expect(promise).resolves.toEqual(
          expect.schemaMatching(
            v.object({
              user: v.any(),
              albums: v.array(v.any())
            })
          )
        )

        await db.update(schemas.user).set({ defaultGroup: null }).where(eq(schemas.user.id, user.id))
      })
    })

    test("without session", async ({ authInstance }) => {
      const request = new Request("http://localhost:5173/app/home")
      // @ts-expect-error test
      const promise = loader({ request, context: { auth: authInstance.auth } })

      await expect(promise).resolves.toBeInstanceOf(Response)
    })
  })

  describe("action", () => {
    describe("POST", () => {
      const method = "POST"

      describe("with session", () => {
        test("action: logout", async ({ authInstance }) => {
          const { headers } = await authInstance.signInWithTestUser()
          const requestBody = JSON.stringify({ action: "logout" })
          const request = new Request("http://localhost:5173/app/home", { method, headers, body: requestBody })
          // @ts-expect-error test
          const promise = action({ request, context: { auth: authInstance.auth } })

          await expect(promise).resolves.toSatisfy(isRRResponse)
        })
      })

      test("without session", async ({ authInstance }) => {
        const request = new Request("http://localhost:5173/app/home", { method })
        // @ts-expect-error test
        const promise = action({ request, context: { auth: authInstance.auth } })

        await expect(promise).resolves.toBeUndefined()
      })
    })

    test("DELETE", async ({ authInstance }) => {
      const method = "DELETE"
      const { headers } = await authInstance.signInWithTestUser()
      const request = new Request("http://localhost:5173/app/home", { method, headers })
      // @ts-expect-error test
      const promise = action({ request, context: { auth: authInstance.auth } })

      await expect(promise).rejects.toSatisfy(isRRResponse)
    })
  })
})