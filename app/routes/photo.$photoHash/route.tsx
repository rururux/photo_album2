import { data } from "react-router"
import type { Route } from "./+types/route"

export async function loader({ request, params, context }: Route.LoaderArgs) {
  const session = await context.auth.api.getSession({ headers: request.headers })

  if (!session) {
    return data(null, { status: 404 })
  }

  // TODO: group 確認
  const photoData = await context.cloudflare.env.BUCKET.get(params.photoHash)

  if (photoData === null) {
    return data(null, { status: 404 })
  }

  return new Response(photoData.body, { headers: { "Content-Type": photoData.httpMetadata!.contentType! } })
}