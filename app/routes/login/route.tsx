import { authClient } from "~/lib/auth"
import type { Route } from "./+types/route"
import { LineLoginButton } from "./components/LineLoginButton"

export async function loader({ request, context }: Route.LoaderArgs) {
  const session = await context.auth.api.getSession({ headers: request.headers })

  if (session !== null) {
    // TODO: redirect
  }
}

export default function LoginPage() {
  const handleClick = () => {
    // 自動でリダイレクトされるので返り値を受け取らなくてもいい
    authClient.signIn.social({ provider: "line" })
  }

  return (
    <div>
      <LineLoginButton onClick={handleClick} />
    </div>
  )
}