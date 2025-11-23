import { data, redirect, useNavigate, useSubmit } from "react-router"
import * as v from "valibot"
import { AlbumCard } from "./components/AlbumCard"
import type { Route } from "./+types/route"
import styles from "./styles.module.css"
import { LogoutActionSchema } from "./schema"
import { FloatingActionButton } from "~/components/FloatingActionButton"
import { Header } from "~/components/Header"
import { Icon } from "~/components/Icon"
import { AvatarButton } from "~/components/AvatarButton"
import { Avatar } from "~/components/Avatar"
import { Menu } from "~/components/Menu"

export async function loader({ request, context }: Route.LoaderArgs) {
  const session = await context.auth.api.getSession({ headers: request.headers })
  const defaultGroup = session?.user.defaultGroup ?? null

  if (!session) {
    return redirect("/login")
  }

  if (defaultGroup === null) {
    return redirect("/app/welcome")
  }

  const albums = await context.albumApi.getAlbumsByGroup(defaultGroup)

  return {
    user: session.user,
    albums
  }
}

export async function action({ request, context }: Route.ActionArgs) {
  const session = await context.auth.api.getSession({ headers: request.headers })

  if (session === null) {
    return
  }

  if (request.method.toUpperCase() !== "POST") {
    throw data(null, { status: 405 })
  }

  const requestData = await request.json()
  const result = v.safeParse(LogoutActionSchema, requestData)

  if (result.success) {
    const { headers } = await context.auth.api.revokeSession({
      body: { token: session.session.token },
      headers: request.headers,
      returnHeaders: true
    })

    return redirect("/login", { headers })
  }
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate()
  const submit = useSubmit()
  const handleLogout = () => submit({ action: "logout" }, { method: "POST", encType: "application/json" })

  return (
    <div style={{ minHeight: "100vh" }}>
      <Header.Root>
        <Header.Title>MY Album</Header.Title>
        <Header.Trailing className={styles.homePageHeaderTrailing}>
          <Menu.Root>
            <Menu.Trigger>
              {({ triggerButtonProps }) => (
                <AvatarButton {...triggerButtonProps}>
                  <Avatar name={loaderData.user.name} image={loaderData.user.image!} />
                </AvatarButton>
              )}
            </Menu.Trigger>
            <Menu.Popover>
              <Menu.List>
                <Menu.Item onAction={handleLogout}>ログアウト</Menu.Item>
              </Menu.List>
            </Menu.Popover>
          </Menu.Root>
        </Header.Trailing>
      </Header.Root>
      <main>
        <div className={styles.albumCardList}>
          {loaderData.albums.map(album => (
            <AlbumCard album={album} key={album.id} />
          ))}
        </div>
      </main>
      <FloatingActionButton onClick={() => navigate("/app/album/create")}>
        <Icon icon="add" />
      </FloatingActionButton>
    </div>
  )
}