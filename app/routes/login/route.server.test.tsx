import { describe, expect } from "vitest"
import { action, loader } from "./route";
import { test } from "test/integration/testInstance";
import { isRRResponse } from "test/utils/isRRResponse"

describe("LoginPage", () => {
  describe("loader", async () => {
    test("with session", async ({ authInstance }) => {
      const { headers } = await authInstance.signInWithTestUser()
      const request = new Request("http://localhost:5173/login", { headers })
      // @ts-expect-error test
      const promise = loader({ request, context: { auth: authInstance.auth } })

      await expect(promise).rejects.toBeInstanceOf(Response)
    })

    test("without session", async ({ authInstance }) => {
      const request = new Request("http://localhost:5173/login")
      // @ts-expect-error test
      const promise = loader({ request, context: { auth: authInstance.auth } })

      await expect(promise).resolves.toBeUndefined()
    })
  })

  describe("action", () => {
    test("POST", async ({ authInstance }) => {
      await authInstance.auth.api.signUpEmail({
        body: {
          name: "guest",
          email: "email@example.com",
          password: import.meta.env.VITE_GUEST_LOGIN_PASSWORD
        }
      })

      const request = new Request("http://localhost:5173/login", { method: "POST" })
      // @ts-expect-error test
      const promise = action({ request, context: { auth: authInstance.auth } })

      await expect(promise).resolves.toSatisfy(isRRResponse)
    })

    test("DELETE", async ({ authInstance }) => {
      const request = new Request("http://localhost:5173/login", { method: "DELETE" })
      // @ts-expect-error test
      const promise = action({ request, context: { auth: authInstance.auth } })

      await expect(promise).rejects.toSatisfy(isRRResponse)
    })
  })
})