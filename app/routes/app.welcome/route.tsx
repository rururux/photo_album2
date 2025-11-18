import { redirect, useFetcher, useSubmit } from "react-router"
import type { Route } from "./+types/route"
import schemas from "workers/lib/db/schema"
import { GroupListItem } from "./components/GroupListItem"
import { Header } from "~/components/Header"
import { useRef } from "react"
import { useForm } from "react-hook-form"
import { valibotResolver } from "@hookform/resolvers/valibot"
import * as v from "valibot"
import { Button } from "~/components/Button"
import styles from "./styles.module.css"
import { CreateGroupDialog } from "./components/CreateGroupDialog"
import { CreateGroupFormSchema, RouteActionSchema } from "./schema"
import { UserSchema } from "~/lib/schema"
import { AlbumApi } from "~/lib/api"
import { Avatar } from "~/components/Avatar"

export async function loader({ request, context }: Route.LoaderArgs) {
  const session = await context.auth.api.getSession({ headers: request.headers })

  if (!session) {
    return redirect("/login")
  } else if (typeof session.user.defaultGroup === "number") {
    return redirect("/app/home")
  }

  const usersToGroups = await context.db.query.usersToGroups.findMany({
    where: (table, { eq }) => eq(table.userId, session.user.id),
    with: {
      group: {
        with: {
          usersToGroups: {
            with: { user: true }
          },
          albums: {
            with: { photos: true }
          }
        }
      }
    }
  })
  const groups = usersToGroups.map(usersToGroup => ({
    id: usersToGroup.group.id,
    name: usersToGroup.group.name,
    albums: usersToGroup.group.albums,
    users: usersToGroup.group.usersToGroups.map(usersToGroups => v.parse(UserSchema, usersToGroups.user))
  }))
  const userData = v.parse(UserSchema, session.user)

  return {
    user: userData,
    groups
  }
}

export async function action({ request, context }: Route.ActionArgs) {
  const session = await context.auth.api.getSession({ headers: request.headers })

  if (!session) {
    return redirect("/login")
  }

  const albumApi = new AlbumApi(context)

  switch (request.method) {
    case "POST": {
      const requestData = await request.json()
      const parseResult = v.safeParse(RouteActionSchema, requestData)

      if (parseResult.success !== true) {
        // TODO
        return
      }

      if (parseResult.output.action === "createGroup") {
        const [ newGroup ] = await context.db.insert(schemas.groups).values({ name: parseResult.output.name }).returning()

        await context.db.insert(schemas.usersToGroups).values({ userId: session.user.id, groupId: newGroup.id })
      } else if (parseResult.output.action === "setDefaultGroup") {
        const newDefaultGroupId = parseResult.output.groupId
        const isGroupMember = await albumApi.isGroupMember(session.user.id, newDefaultGroupId)

        if (!isGroupMember) {
          // TODO: Error Message
          return
        }

        const { headers } = await context.auth.api.updateUser({
          headers: request.headers,
          body: { defaultGroup: newDefaultGroupId },
          returnHeaders: true
        })

        return redirect("/app/home", { headers })
      }

      break;
    }

    default: {
      return Response.json(null, { status: 405, statusText: "Method Not Allowed" })
    }
  }
}

export default function Welcome({ loaderData }: Route.ComponentProps) {
  const { control, handleSubmit: _handleSubmit, reset } = useForm({ resolver: valibotResolver(CreateGroupFormSchema) })
  const dialogRef = useRef<HTMLDialogElement>(null)
  const fetcher = useFetcher()

  const handleClick = () => dialogRef.current?.showModal()
  const handleClose = () => reset()
  const handleCreateGroupSubmit = _handleSubmit(data => {
    fetcher.submit({ action: "createGroup", name: data.name }, { method: "POST", encType: "application/json" })
    dialogRef.current?.requestClose()
  })
  const handleSetDefaultGroupSubmit = (groupId: number) => {
    return () => fetcher.submit({ action: "setDefaultGroup", groupId }, { method: "POST", encType: "application/json" })
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <Header.Root>
        <Header.Title className={styles.welcomeHeader}>
          <span>ようこそ、</span>
          <Avatar className={styles.userIcon} name={loaderData.user.name} image={loaderData.user.image} />
          <span>{loaderData.user.name}さん</span>
        </Header.Title>
      </Header.Root>
      <main>
        <ul className={styles.groupList}>
          {loaderData.groups.map(group => (
            <GroupListItem
              thumbSrc={group.albums.at(0)?.photos.at(0)?.src ?? null}
              name={group.name}
              users={group.users}
              onClick={handleSetDefaultGroupSubmit(group.id)}
              key={group.id}
            />
          ))}
        </ul>
      </main>
      <footer className={styles.footer}>
        <Button variant="filled" onClick={handleClick}>新しいグループを作成</Button>
      </footer>
      <CreateGroupDialog control={control} onSubmit={handleCreateGroupSubmit} onClose={handleClose} ref={dialogRef} />
    </div>
  )
}