import { data } from "react-router"
import type { Route } from "./+types/route"

export async function action({ request, context }: Route.ActionArgs) {
  if (request.method.toUpperCase() !== "POST") {
    throw data(null, { status: 405 })
  }

  await context.auth.api.signUpEmail({
    body: {
      name: "Guest",
      email: "email@example.com",
      password: import.meta.env.VITE_GUEST_LOGIN_PASSWORD
    }
  })
}