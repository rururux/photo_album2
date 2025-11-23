import { decodeAlbumId } from "~/utils/sqids"
import type { Route } from "./+types/route"
import { Header } from "~/components/Header"
import { IconButton } from "~/components/IconButton"
import { Icon } from "~/components/Icon"
import { Button } from "~/components/Button"
import { ThumbGrid } from "~/components/ThumbGrid"
import { FilePickerButton } from "../app.album.create/components/FilePickerButton"
import { RangeCalendar } from "~/components/RangeCalendar"
import { useEffect, useMemo, useState } from "react"
import { useHeader } from "~/components/Header/hooks"
import type { Key } from "react-aria"
import { useSelection } from "~/hooks/useSelection"
import { data, redirect, useFetcher, useNavigate } from "react-router"
import { valibotResolver } from "@hookform/resolvers/valibot"
import { useForm } from "react-hook-form"
import styles from "./styles.module.css"
import getFileHash from "~/utils/getFileHash"
import { AlbumFormSchema } from "./schema"
import { useRangeCalendar } from "~/components/RangeCalendar/hooks"
import { AlbumInfo } from "./components/AlbumInfo"
import { PhotoGridList } from "./components/PhotoGridList"
import * as v from "valibot"
import { AlbumWithPhotosSchema } from "~/schemas/album"
import { Menu } from "~/components/Menu"
import { Dialog } from "~/components/Dialog"
import { useCloseWatcher } from "~/hooks/useCloseWatcher"
import { useDialog } from "~/components/Dialog/hooks"
import { pickDirtyfields } from "~/utils/pickDirtyFields"
import { parseMultipartRequest } from "@remix-run/multipart-parser"

const tenMbSize = 1024 * 1024 * 10

export async function loader({ request, params, context }: Route.LoaderArgs) {
  const session = await context.auth.api.getSession({ headers: request.headers })

  if (!session) {
    return redirect("/login")
  }

  if (params.albumId !== "create") {
    const hasPermission = await context.albumApi.canUserAccessAlbum(session.user.id, params.albumId)

    if (hasPermission !== true) {
      return redirect("/app/home")
    }
  }

  const decodedAlbumId = decodeAlbumId(params.albumId)
  const albumWithPhotos = await context.db.query.albums.findFirst({
    where: (t, { eq }) => eq(t.id, decodedAlbumId),
    with: { photos: true }
  })

  if (albumWithPhotos === undefined) {
    throw redirect("/app/home")
  }

  const { photos, ...album } = v.parse(AlbumWithPhotosSchema, albumWithPhotos)

  return {
    album, photos
  }
}

export async function action({ request, params: { albumId }, context }: Route.ActionArgs) {
  const session = await context.auth.api.getSession({ headers: request.headers })

  if (!session) {
    return data(null, { status: 401 })
  }

  const albumApi = context.albumApi
  const method = request.method

  if (method === "POST") {
    const hasPermission = await albumApi.canUserAccessAlbum(session.user.id, albumId)

    if (hasPermission !== true) {
      return data(null, { status: 401 })
    }
  }

  if ((method === "POST" && albumId !== "create") || (method !== "POST" && albumId === "create")) {
    return data(null, { status: 405 })
  }

  switch (method) {
    case "POST":
    case "PATCH": {
      const groupId = session.user.defaultGroup!
      let currentStep = 0
      let createdAlbumId: string | null = method === "POST"? null : albumId
      let fileDatas: { fileHash: string, fileSize: number }[] = []
      const r2PutPromises: Promise<R2Object>[] = []

      const cleanUp = async () => {
        if (method !== "POST" || createdAlbumId === null) return

        await albumApi.deleteAlbum(createdAlbumId)
      }

      try {
        for await (const part of parseMultipartRequest(request, { maxFileSize: tenMbSize })) {
          if (part.name === "album") {
            if (method === "POST" && currentStep !== 0) {
              throw new Error("stepError")
            }

            const json = JSON.parse(part.text)

            if (method === "POST") {
              ({ createdAlbumId } = await albumApi.createAlbum(groupId, json))
            } else {
              await albumApi.updateAlbum(albumId, json)
            }

            currentStep = 1
          } else if (part.name === "newItems") {
            if (method === "POST" && currentStep !== 1) {
              throw new Error("stepError")
            }

            const json = JSON.parse(part.text)

            ;({ fileDatas } = await albumApi.createPhotos(createdAlbumId!, json))

            currentStep = 2
          } else if (part.name === "files" && part.isFile) {
            if (currentStep !== 2 && currentStep !== 3) {
              throw new Error("stepError")
            }

            const currentFileData = fileDatas.shift()

            if (currentFileData === undefined) {
              throw new Error("fileDataError")
            }

            const r2PutPromise = context.cloudflare.env.BUCKET.put(currentFileData.fileHash, part.bytes, {
              httpMetadata: { contentType: part.mediaType },
              customMetadata: { "x-amz-meta-isprivatefile": "true" },
              // sha256: currentFileData.hash,
            })

            r2PutPromises.push(r2PutPromise)

            if (currentStep === 2) currentStep = 3
          }
        }

        if (method === "POST" && currentStep != 3) {
          throw new Error("stepError")
        }

        await Promise.all(r2PutPromises)

        return { success: true }
      } catch (e) {
        await cleanUp()

        if (v.isValiError(e)) {
          // TODO: エラーメッセージを返す
          return data(null, { status: 400 })
        }

        if (e instanceof Error) {
          if (e.message === "stepError" || e.message === "fileDataError") {
            return data(null, { status: 400 })
          }
        }

        console.error(e)

        return data(null, { status: 500 })
      }
    }

    case "DELETE": {
      const formData = await request.formData()

      if (formData.has("album")) {
        const deleteTarget = JSON.parse(formData.get("album")! as string) as { id: string }

        if (deleteTarget.id !== albumId) {
          console.warn("`deleteTarget.id !== albumId` ????")

          return
        }

        await albumApi.deleteAlbum(albumId)

        return redirect("/app/home")
      } else if (formData.has("photos")) {
        const deleteTarget = JSON.parse(formData.get("photos")! as string) as { id: string }[]
        const deleteTargetPhotoIds = deleteTarget.map(photo => photo.id)

        await albumApi.deletePhotos(albumId, deleteTargetPhotoIds)

        return { success: true }
      }

      break;
    }

    default:
      break;
  }
}

type PageMode = "create" | "view" | "edit"

const fileObjectUrlCacheWeakMap = new WeakMap<File, string>()
const finalizationRegistry = new FinalizationRegistry<string>(objectUrl => URL.revokeObjectURL(objectUrl))

function getFileObjectUrl(file: File) {
  const cache = fileObjectUrlCacheWeakMap.get(file)

  if (cache) return cache

  const objectUrl = URL.createObjectURL(file)

  finalizationRegistry.register(file, objectUrl)
  fileObjectUrlCacheWeakMap.set(file, objectUrl)

  return objectUrl
}

export default function AlbumPage({ params, loaderData }: Route.ComponentProps) {
  const initialPageMode: PageMode = params.albumId === "create"? "create" : "view"
  const [ isEditable, setIsEditable ] = useState(initialPageMode === "create")
  const currentPageMode: PageMode = (initialPageMode === "view" && isEditable)? "edit" : initialPageMode
  const navigate = useNavigate()

  const [ confirmDiscardDialogController, confirmDiscardDialogState ] = useDialog()
  const [ deleteAlbumConfirmDialogController, deleteAlbumConfirmDialogState ] = useDialog()
  const [ deletePhotoConfirmDialogController, deletePhotoConfirmDialogState ] = useDialog()

  const { formState: { isDirty, dirtyFields }, watch, setValue, getValues, reset, handleSubmit } = useForm({
    resolver: valibotResolver(AlbumFormSchema),
    defaultValues: {
      album: loaderData.album,
      newItems: [],
      files: []
    }
  })
  const album = watch("album")
  const newItems = watch("newItems")
  const photoItems = useMemo(() => [ ...loaderData.photos, ...newItems ], [ loaderData.photos, newItems ])
  const dateRange = album.startDate !== ""? { start: album.startDate, end: album.endDate } : null
  const fileHashesSet = new Set(newItems.map(item => item.fileHash))
  const { showRangeCalendar, rangeCalendarState } = useRangeCalendar({
    initialValue: dateRange,
    onChange: newValue => {
      setValue("album.startDate", newValue.start, { shouldDirty: true })
      setValue("album.endDate", newValue.end, { shouldDirty: true })
    }
  })

  const fetcher = useFetcher<typeof action>()
  const [ selection, setSelection ] = useSelection<Key>()
  const headerState = useHeader<Key>({
    selectionState: [ selection, setSelection ]
  })
  const { requestClose, close } = useCloseWatcher({
    enabled: currentPageMode === "edit",
    onCancel: e => {
      if (!isDirty) return

      e.preventDefault()
      confirmDiscardDialogController.open()
    },
    onClose: () => {
      newItems.forEach(item => URL.revokeObjectURL(item.src))
      reset()
      setIsEditable(false)
    }
  })

  const handleDiscardButtonClick = () => requestClose()

  const handleRemoveSelectedItemButtonClick = () => {
    if (selection.size === 0) return

    const photoItemsIdMap = new Map(photoItems.map(item => [ item.id, item ]))
    const selectedItems = Array.from(selection)
      .map(selectedKey => photoItemsIdMap.get(selectedKey as string))
      .filter(item => !!item)
    const isAllDraftItem = selectedItems.every(item => "fileHash" in item)

    if (isAllDraftItem) {
      const photoFiles = getValues("files")
      const indicesToRemove = new Set(
        Array.from(selection).map(id => newItems.findIndex(item => item.id === id))
      )

      indicesToRemove.forEach(i => URL.revokeObjectURL(newItems[i].src))

      setValue("newItems", newItems.filter((_, i) => !indicesToRemove.has(i)))
      setValue("files", photoFiles.filter((_, i) => !indicesToRemove.has(i)))

      setSelection(new Set())
    } else {
      deletePhotoConfirmDialogController.open()
    }
  }

  const handleChange = (files: File[]) => {
    const items = getValues("newItems")
    const photoFiles = getValues("files")

    ;(async () => {
      const newFileDatas = await Promise.all(files.map(async file => ({ file, hash: await getFileHash(file) })))
      const uniqueFileDatas = newFileDatas.filter(fileData => !fileHashesSet.has(fileData.hash))
      const uniqueFiles = uniqueFileDatas.map(fileData => fileData.file)

      if (uniqueFileDatas.length === 0) return

      const newItems = uniqueFileDatas.map(fileData => ({
        id: "_item_" + fileData.hash,
        src: getFileObjectUrl(fileData.file),
        date: new Date(fileData.file.lastModified).toDateString(),
        fileHash: fileData.hash,
        fileSize: fileData.file.size
      }))

      setValue("newItems", [ ...items, ...newItems ], { shouldDirty: true })
      setValue("files", [ ...photoFiles, ...uniqueFiles ], { shouldDirty: true })
    })()
  }
  const handleFormSubmitButtonClick = () => submitForm()
  const submitForm = handleSubmit(data => {
    if (Object.keys(dirtyFields).length === 0) {
      // NO CHANGES?
      return
    }

    const method = currentPageMode === "create"? "POST" : "PATCH"
    let uploadTargetData: Partial<typeof data> = data

    if (currentPageMode === "edit") {
      const dirtyFieldsWithValue = pickDirtyfields(data, dirtyFields)

      uploadTargetData = dirtyFieldsWithValue
    }

    const formData = new FormData()

    if (uploadTargetData.album) {
      formData.append("album", JSON.stringify(data.album))
    }

    if (uploadTargetData.newItems) {
      formData.append("newItems", JSON.stringify(data.newItems))
    }

    data.files?.forEach(file => formData.append("files", file))

    fetcher.submit(formData, { method, encType: "multipart/form-data" })
  })

  const handleCancelDiscard = () => confirmDiscardDialogController.close()
  const handleConfirmDiscard = () => {
    close()
    confirmDiscardDialogController.close()
  }

  const handleCancelDeleteAlbum = () => deleteAlbumConfirmDialogController.close()
  const handleConfirmDeleteAlbum = () => {
    const formData = new FormData()

    formData.append("album", JSON.stringify({ id: loaderData.album.id }))

    fetcher.submit(formData, { method: "DELETE", encType: "multipart/form-data" })
  }

  const handleCancelDeletePhoto = () => deletePhotoConfirmDialogController.close()
  const handleConfirmDeletePhoto = () => {
    const formData = new FormData()

    formData.append("photos", JSON.stringify(Array.from(selection).map(selectedKey => ({ id: selectedKey }))))

    fetcher.submit(formData, { method: "DELETE", encType: "multipart/form-data" })
    setSelection(new Set())
    deletePhotoConfirmDialogController.close()
  }

  useEffect(() => {
    if (fetcher.formMethod === "PATCH" && fetcher.data?.success) {
      setIsEditable(false)
    }
  }, [ fetcher.formMethod, fetcher.data ])

  useEffect(() => {
    reset({
      album: loaderData.album,
      newItems: [],
      files: []
    })
  }, [ reset, loaderData ])

  return (
    <div className={styles.pageRoot}>
      <Header.Root headerState={headerState}>
        {({ selectedCount, isSelectionMode, clearSelection }) => (
          isSelectionMode? (
            <>
              <Header.Leading>
                <IconButton size="small" onClick={clearSelection}>
                  <Icon icon="close" />
                </IconButton>
              </Header.Leading>
              <Header.Title>{selectedCount}枚選択中</Header.Title>
              <Header.Trailing>
                <IconButton size="small" onClick={handleRemoveSelectedItemButtonClick}>
                  <Icon icon="delete" />
                </IconButton>
              </Header.Trailing>
            </>
          ) : (
            <>
              <Header.Leading>
                {currentPageMode === "edit"? (
                  <IconButton size="small" onClick={handleDiscardButtonClick}>
                    <Icon icon="close" />
                  </IconButton>
                ) : (
                  <IconButton size="small" onClick={() => navigate(-1)}>
                    <Icon icon="arrow-back" />
                  </IconButton>
                )}
              </Header.Leading>
              <Header.Title>
                {currentPageMode === "edit" && "編集中: "}
                {album.name}
                {currentPageMode === "edit" && isDirty && "*"}
              </Header.Title>
              <Header.Trailing>
              {isEditable? (
                <Button disabled={!isDirty || fetcher.state !== "idle"} onClick={handleFormSubmitButtonClick}>保存</Button>
              ) : (
                <Menu.Root>
                  <Menu.Trigger>
                    {({ triggerButtonProps }) => (
                      <IconButton {...triggerButtonProps}>
                        <Icon icon="more" />
                      </IconButton>
                    )}
                  </Menu.Trigger>
                  <Menu.Popover>
                    <Menu.List>
                      <Menu.Item onAction={() => setIsEditable(true)}>
                        <span>アルバムを編集</span>
                      </Menu.Item>
                      <Menu.Item onAction={() => deleteAlbumConfirmDialogController.open()}>
                        <span>アルバムを削除</span>
                      </Menu.Item>
                    </Menu.List>
                  </Menu.Popover>
                </Menu.Root>
              )}
              </Header.Trailing>
            </>
          )
        )}
      </Header.Root>
      <main>
        <form>
          <div>
            <ThumbGrid.Root>
              {photoItems.slice(0, 4).map(item => (
                <ThumbGrid.Item src={item.src} alt="" key={item.id} />
              ))}
            </ThumbGrid.Root>
            <AlbumInfo
              album={album}
              isEditable={isEditable}
              onEditDateRangeButtonClick={showRangeCalendar}
              onAlbumNameChange={newValue => setValue("album.name", newValue, { shouldDirty: true })}
            />
          </div>
          <PhotoGridList
            photoItems={photoItems}
            isEditable={isEditable}
            selection={selection}
            setSelection={setSelection}
          />
        </form>
        {isEditable && <FilePickerButton onChange={handleChange} />}
        <RangeCalendar {...rangeCalendarState} />
        <Dialog.Root {...confirmDiscardDialogState}>
          <Dialog.Body>
            <Dialog.Content>
              <p>保存されていない変更があります。</p>
              <p>変更を破棄しますか？</p>
            </Dialog.Content>
            <Dialog.Footer>
              <Button onClick={handleCancelDiscard}>キャンセル</Button>
              <Button onClick={handleConfirmDiscard}>はい</Button>
            </Dialog.Footer>
          </Dialog.Body>
        </Dialog.Root>
        <Dialog.Root {...deleteAlbumConfirmDialogState}>
          <Dialog.Body>
            <Dialog.Content>
              <p>アルバム「{album.name}」を削除しますか？</p>
              <p>この削除は取り消せません。</p>
            </Dialog.Content>
            <Dialog.Footer>
              <Button onClick={handleCancelDeleteAlbum}>キャンセル</Button>
              <Button onClick={handleConfirmDeleteAlbum}>はい</Button>
            </Dialog.Footer>
          </Dialog.Body>
        </Dialog.Root>
        <Dialog.Root {...deletePhotoConfirmDialogState}>
          <Dialog.Body>
            <Dialog.Content>
              <p>選択した画像 {selection.size}枚を削除しますか？</p>
              <p>この削除は取り消せません。</p>
            </Dialog.Content>
            <Dialog.Footer>
              <Button onClick={handleCancelDeletePhoto}>キャンセル</Button>
              <Button onClick={handleConfirmDeletePhoto}>はい</Button>
            </Dialog.Footer>
          </Dialog.Body>
        </Dialog.Root>
      </main>
    </div>
  )
}