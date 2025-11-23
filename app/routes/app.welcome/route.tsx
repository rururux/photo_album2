import { redirect, useFetcher } from "react-router"
import type { Route } from "./+types/route"
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
import { Avatar } from "~/components/Avatar"

export async function loader({ request, context }: Route.LoaderArgs) {
  const session = await context.auth.api.getSession({ headers: request.headers })

  if (!session) {
    return redirect("/login")
  } else if (typeof session.user.defaultGroup === "number") {
    return redirect("/app/home")
  }

  const groups = await context.albumApi.getGroupsByUser(session.user.id)
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

  const albumApi = context.albumApi

  switch (request.method) {
    case "POST": {
      const requestData = await request.json()
      const parseResult = v.safeParse(RouteActionSchema, requestData)

      if (parseResult.success !== true) {
        // TODO
        return
      }

      if (parseResult.output.action === "createGroup") {
        const { createdGroupId } = await albumApi.createGroup(parseResult.output.name)

        await albumApi.addUserToGroup(createdGroupId, session.user.id)
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
          <Avatar className={styles.userIcon} name={loaderData.user.name} image={loaderData.user.image ?? undefined} />
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