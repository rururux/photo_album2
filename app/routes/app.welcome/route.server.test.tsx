import { describe, expect , vi } from "vitest"
import * as v from "valibot"
import { eq } from "drizzle-orm"
import type { AppLoadContext } from "react-router"
import schemas from "../../../workers/lib/db/schema";
import { action, loader } from "./route"
import { isRRResponse } from "test/utils/isRRResponse"
import { createAlbumApiMock } from "test/utils/albumApiMock"
import { test } from "test/integration/testInstance"

describe("Welcome", () => {
  let context: AppLoadContext
  const albumApiMock = createAlbumApiMock()

  test.beforeEach(({ authInstance }) => {
    context ??= { auth: authInstance.auth, albumApi: albumApiMock } as unknown as AppLoadContext
  })

  describe("loader", () => {
    test("without session", async () => {
      const request = new Request("http://localhost:5173/app/welcome")
      // @ts-expect-error test
      const promise = loader({ request, context })

      await expect(promise).rejects.toSatisfy(isRRResponse)
    })

    test("with session and defaultGroup", async ({ db, authInstance }) => {
      await db.update(schemas.user).set({ defaultGroup: 0 }).where(eq(schemas.user.email, "test@test.com"))

      const { headers } = await authInstance.signInWithTestUser()
      const request = new Request("http://localhost:5173/app/welcome", { headers })
      // @ts-expect-error test
      const promise = loader({ request, context })

      await expect(promise).rejects.toSatisfy(isRRResponse)

      await db.update(schemas.user).set({ defaultGroup: null }).where(eq(schemas.user.email, "test@test.com"))
    })

    test("with session", async ({ authInstance }) => {
      const { headers } = await authInstance.signInWithTestUser()
      const request = new Request("http://localhost:5173/app/welcome", { headers })
      // @ts-expect-error test
      const promise = loader({ request, context })

      await expect(promise).resolves.toEqual(
        expect.schemaMatching(
          v.object({
            groups: v.array(v.any()),
            user: v.object({
              id: v.string(),
              name: v.string(),
              image: v.nullable(v.string())
            })
          })
        )
      )
    })
  })

  describe("action", () => {
    describe("POST", () => {
      const method = "POST"

      test("without session", async () => {
        const request = new Request("http://localhost:5173/app/welcome", { method })
        // @ts-expect-error test
        const promise = action({ request, context })

        await expect(promise).resolves.toSatisfy(isRRResponse)
      })

      describe("with session", () => {
        test("invalid request body", async ({ authInstance }) => {
          const { headers } = await authInstance.signInWithTestUser()
          const request = new Request("http://localhost:5173/app/welcome", { headers, method, body: "{}" })
          // @ts-expect-error test
          const promise = action({ request, context })

          await expect(promise).resolves.toBeUndefined()
        })

        test("action: createGroup", async ({ authInstance }) => {
          const { headers } = await authInstance.signInWithTestUser()
          const request = new Request("http://localhost:5173/app/welcome", {
            headers,
            method,
            body: JSON.stringify({ action: "createGroup", name: "test" })
          })
          // @ts-expect-error test
          const promise = action({ request, context })

          await expect(promise).resolves.toBeUndefined()
        })

        test("action: setDefaultGroup && isGroupMenber === true", async ({ authInstance }) => {
          const { headers } = await authInstance.signInWithTestUser()
          const request = new Request("http://localhost:5173/app/welcome", {
            headers,
            method,
            body: JSON.stringify({ action: "setDefaultGroup", groupId: 1 })
          })
          // @ts-expect-error test
          const promise = action({ request, context })

          await expect(promise).resolves.toSatisfy(isRRResponse)
        })

        test("action: setDefaultGroup && isGroupMenber !== true", async ({ authInstance }) => {
          vi.mocked(albumApiMock.isGroupMember).mockResolvedValueOnce(false)

          const { headers } = await authInstance.signInWithTestUser()
          const request = new Request("http://localhost:5173/app/welcome", {
            headers,
            method,
            body: JSON.stringify({ action: "setDefaultGroup", groupId: -1 })
          })
          // @ts-expect-error test
          const promise = action({ request, context })

          await expect(promise).resolves.toBeUndefined()
        })
      })
    })

    test("DELETE", async ({ authInstance }) => {
      const method = "DELETE"

      const { headers } = await authInstance.signInWithTestUser()
      const request = new Request("http://localhost:5173/app/welcome", { headers, method, body: "{}" })
      // @ts-expect-error test
      const promise = action({ request, context })

      await expect(promise).resolves.toSatisfy(isRRResponse)
    })
  })
})