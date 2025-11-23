import { data, redirect, useSubmit } from "react-router"
import type { Route } from "./+types/route"
import { LineLoginButton } from "./components/LineLoginButton"
import styles from "./styles.module.css"
import { authClient } from "~/lib/auth"
import { Button } from "~/components/Button"

export async function loader({ request, context }: Route.LoaderArgs) {
  const session = await context.auth.api.getSession({ headers: request.headers })

  if (session !== null) {
    throw redirect("/app/welcome")
  }
}

export async function action({ request, context }: Route.ActionArgs) {
  if (request.method !== "POST") {
    throw data(null, { status: 405 })
  }

  const { headers } = await context.auth.api.signInEmail({
    body: {
      email: "email@example.com",
      password: import.meta.env.VITE_GUEST_LOGIN_PASSWORD,
      rememberMe: true
    },
    returnHeaders: true
  })

  return redirect("/app/welcome", { headers })
}

export default function LoginPage() {
  const submit = useSubmit()
  const handleClick = () => {
    // 自動でリダイレクトされるので返り値を受け取らなくてもいい
    authClient.signIn.social({ provider: "line", callbackURL: "/app/welcome" })
  }

  return (
    <div className={styles.pageRoot}>
      <div className={styles.loginButtons}>
        <LineLoginButton onClick={handleClick} />
        <Button
          variant="outlined"
          style={{ width: "calc(100% - 16px)", height: "calc(100% - 16px)", margin: 8 }}
          onClick={() => submit(null, { method: "POST" })}
        >ゲストとしてログイン</Button>
      </div>
    </div>
  )
}