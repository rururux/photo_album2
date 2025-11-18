import { FloatingActionButton } from "~/components/FloatingActionButton"
import { AlbumCard } from "./components/AlbumCard"
import { Header } from "~/components/Header"
import { Icon } from "~/components/Icon"
import type { Route } from "./+types/route"
import { AvatarButton } from "~/components/AvatarButton"
import { redirect, useNavigate, useSubmit } from "react-router"
import { AlbumApi } from "~/lib/api"
import styles from "./styles.module.css"
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

  const albumApi = new AlbumApi(context)
  const albums = await albumApi.getAlbumsByGroup(defaultGroup)

  return {
    user: session.user,
    albums
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