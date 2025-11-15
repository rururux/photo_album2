import { data } from "react-router"
import type { Route } from "./+types/route"

export async function loader({ request, params, context }: Route.LoaderArgs) {
  const session = await context.auth.api.getSession({ headers: request.headers })

  if (!session) {
    return data(null, { status: 404 })
  }

  // TODO: group 確認
  const requestUrl = new URL(request.url)
  const photoData = await context.cloudflare.env.BUCKET.get(params.photoHash)

  if (photoData === null) {
    return data(null, { status: 404 })
  }

  if (requestUrl.searchParams.has("raw")) {
    const headers = new Headers()

    photoData.writeHttpMetadata(headers)
    headers.set("Cache-Control", "private, max-age=604800, immutable")

    return new Response(photoData.body, { headers })
  }

  const cfImages = context.cloudflare.env.IMAGES
  const transformedImage = await cfImages
    .input(photoData.body)
    .transform({ width: 600, height: 600 })
    .output({ format: "image/avif" })
  const transformedImageResponse = transformedImage.response()

  transformedImageResponse.headers.set("Cache-Control", "private, max-age=604800, immutable")

  return transformedImageResponse
}