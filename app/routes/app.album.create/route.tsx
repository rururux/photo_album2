import { Header } from "~/components/Header"
import { ThumbGrid } from "~/components/ThumbGrid"
import styles from "./styles.module.css"
import { IconButton } from "~/components/IconButton"
import { Icon } from "~/components/Icon"
import { Button } from "~/components/Button"
import { data, replace, useFetcher } from "react-router"
import { useEffect, useId, useRef } from "react"
import { useForm } from "react-hook-form"
import getFileHash from "~/utils/getFileHash"
import { FilePickerButton } from "./components/FilePickerButton"
import { valibotResolver } from "@hookform/resolvers/valibot"
import { CreateAlbumFormSchema } from "./schema"
import formatRelativeDate from "~/utils/formatRelativeDate"
import now from "~/utils/now"
import { RangeCalendar } from "~/components/RangeCalendar"
import { ImageGridList } from "~/components/ImageGridList"
import { useSelection } from "~/hooks/useSelection"
import type { Key } from "react-aria"
import { useHeader } from "~/components/Header/hooks"
import type { Route } from "./+types/route"
import { parseMultipartRequest } from "@remix-run/multipart-parser"
import * as v from "valibot"
import schemas from "workers/lib/db/schema"
import { eq } from "drizzle-orm"
import type { BatchItem } from "drizzle-orm/batch"
import { encodeAlbumId } from "~/utils/sqids"

const tenMbSize = 1024 * 1024 * 10

export async function action({ request, context }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return data(null, { status: 405 })
  }

  const url = new URL(request.url)
  const session = await context.auth.api.getSession({ headers: request.headers })

  if (session === null) {
    return data(null, { status: 401 })
  }

  const groupId = session.user.defaultGroup!
  let currentStep = 0
  let createdAlbumId: number | null = null
  let createdPhotoIds: number[] | null = null
  let fileDatas: { hash: string, size: number }[] = []
  const r2PutPromises: Promise<R2Object>[] = []

  const cleanUp = async () => {
    const queries: BatchItem<"sqlite">[] = []

    if (createdPhotoIds !== null) {
      const deletePhotoQueries = createdPhotoIds.map(photoId =>
        context.db.delete(schemas.photos).where(eq(schemas.photos.id, photoId))
      )
      queries.push(...deletePhotoQueries)
    }

    if (createdAlbumId !== null) {
      queries.push(
        context.db.delete(schemas.albums).where(eq(schemas.albums.id, createdAlbumId))
      )
    }

    if (queries.length === 0) return

    await context.db.batch(queries as [BatchItem<"sqlite">, ...BatchItem<"sqlite">[]])
  }

  try {
    for await (const part of parseMultipartRequest(request, { maxFileSize: tenMbSize })) {
      if (part.name === "album") {
        if (currentStep !== 0) {
          throw new Error("stepError")
        }

        const json = JSON.parse(part.text)
        const result = v.parse(CreateAlbumFormSchema.entries.album, json)
        const insertResult = await context.db
          .insert(schemas.albums)
          .values({ groupId, ...result })
          .returning({ id: schemas.albums.id })

        createdAlbumId = insertResult[0].id
        currentStep++
      } else if (part.name === "newItems") {
        if (currentStep !== 1) {
          throw new Error("stepError")
        }

        const json = JSON.parse(part.text)
        const result = v.parse(CreateAlbumFormSchema.entries.newItems, json)
        const insertResult = await context.db
          .insert(schemas.photos)
          .values(result.map(item => ({ albumId: createdAlbumId!, src: `${url.origin}/photo/${item.fileHash}`, date: new Date(item.date) })))
          .returning({ id: schemas.photos.id })

        createdPhotoIds = insertResult.map(returning => returning.id)
        fileDatas = result.map(item => ({ hash: item.fileHash, size: item.fileSize }))
        currentStep++
      } else if (part.name === "files" && part.isFile) {
        if (currentStep !== 2 && currentStep !== 3) {
          throw new Error("stepError")
        }

        const currentFileData = fileDatas.shift()

        if (currentFileData === undefined) {
          throw new Error("fileDataError")
        }

        const r2PutPromise = context.cloudflare.env.BUCKET.put(currentFileData.hash, part.bytes, {
          httpMetadata: { contentType: part.mediaType },
          customMetadata: { "x-amz-meta-isprivatefile": "true" },
          // sha256: currentFileData.hash,
        })

        r2PutPromises.push(r2PutPromise)

        if (currentStep === 2) currentStep++
      }
    }

    if (currentStep != 3) {
      throw new Error("stepError")
    }

    await Promise.all(r2PutPromises)

    return replace("/app/album/" + encodeAlbumId(createdAlbumId!))
  } catch (e) {
    if (v.isValiError(e)) {
      await cleanUp()

      // TODO: エラーメッセージを返す
      return data(null, { status: 400 })
    }

    if (e instanceof Error) {
      if (e.message === "stepError" || e.message === "fileDataError") {
        await cleanUp()

        return data(null, { status: 400 })
      }
    }

    console.error(e)

    return data(null, { status: 500 })
  }
}

export default function CreateAlbumPage() {
  const formId = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const { register, watch, setValue, getValues, handleSubmit } = useForm({
    resolver: valibotResolver(CreateAlbumFormSchema),
    defaultValues: {
      album: {
        name: "",
        startDate: "",
        endDate: "",
      },
      newItems: [],
      files: []
    }
  })
  const newItems = watch("newItems")
  const startDate = watch("album.startDate")
  const endDate = watch("album.endDate")
  const dateRange = startDate !== ""? { start: startDate, end: endDate } : null
  const formattedStartDate = startDate !== "" ? formatRelativeDate(startDate, now) : "-- / --"
  const formattedEndDate = endDate !== ""? formatRelativeDate(endDate, startDate, { minimumUnit: "day" }) : "-- / --"
  const fileHashesSet = new Set(newItems.map(newItem => newItem.fileHash))

  const fetcher = useFetcher()
  const rangeCalendarDialogRef = useRef<HTMLDialogElement>(null)

  const [ selection, setSelection ] = useSelection<Key>()
  const headerState = useHeader<Key>({
    selectionState: [ selection, setSelection ]
  })

  const showRangeCalendar = () => rangeCalendarDialogRef.current?.showModal()
  const handleRemoveSelectedItemButtonClick = () => {
    if (selection.size === 0) return

    const photoFiles = getValues("files")
    const selectedItems = Array.from(selection)
      .map(key => newItems.find(item => item.fileHash === key))
      .filter(item => !!item)
    const selectedItemIndexes = new Set(
      Array.from(selection)
        .map((_, i) => newItems.indexOf(selectedItems[i]))
        .filter(index => index !== -1)
    )

    selectedItems.forEach(selectedItem => URL.revokeObjectURL(selectedItem.src))
    setValue("newItems", newItems.filter((_, i) => !selectedItemIndexes.has(i)))
    setValue("files", photoFiles.filter((_, i) => !selectedItemIndexes.has(i)))
    setSelection(new Set())
  }

  const handleChange = (files: File[]) => {
    const items = getValues("newItems")
    const photoFiles = getValues("files")

    ;(async () => {
      const newFileHashes = await Promise.all(files.map(getFileHash))
      const uniqueFiles = files.filter((_, i) => !fileHashesSet.has(newFileHashes[i]))

      if (uniqueFiles.length === 0) return

      const newItems = uniqueFiles.map((file, i) => ({
        src: URL.createObjectURL(file),
        date: new Date(file.lastModified).toDateString(),
        fileHash: newFileHashes[i],
        fileSize: file.size
      }))

      setValue("newItems", [ ...items, ...newItems ])
      setValue("files", [ ...photoFiles, ...uniqueFiles ])
    })()
  }
  const handleRangeCalendarDialogSubmit = (newRangeData: { start: string, end: string }) => {
    setValue("album.startDate", newRangeData.start)
    setValue("album.endDate", newRangeData.end)
  }
  const handleFormSubmitButtonClick = () => formRef.current?.requestSubmit()
  const handleFormSubmit = handleSubmit(data => {
    const formData = new FormData()

    formData.append("album", JSON.stringify(data.album))
    formData.append("newItems", JSON.stringify(data.newItems))
    data.files.map(file => formData.append("files", file))

    fetcher.submit(formData, { method: "POST", encType: "multipart/form-data" })
  })

  useEffect(() => {
    const items = getValues("newItems")

    return () => items.forEach(selectedItem => URL.revokeObjectURL(selectedItem.src))
  }, [ getValues ])

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
                <IconButton size="small">
                  <Icon icon="arrow-back" />
                </IconButton>
              </Header.Leading>
              <Header.Title>新規作成</Header.Title>
              <Header.Trailing>
                <Button onClick={handleFormSubmitButtonClick}>保存</Button>
              </Header.Trailing>
            </>
          )
        )}
      </Header.Root>
      <main>
        <form id={formId} onSubmit={handleFormSubmit} ref={formRef}>
          <div>
            <ThumbGrid.Root>
              {newItems.slice(0, 4).map(item => (
                <ThumbGrid.Item src={item.src} alt="" key={item.fileHash} />
              ))}
            </ThumbGrid.Root>
            <div className={styles.albumInfo}>
              <div className={styles.albumInfoDate}>
                <span className={styles.dateBadge}>{formattedStartDate} ～ {formattedEndDate}</span>
                <IconButton size="small" variant="outlined" onClick={showRangeCalendar}>
                  <Icon icon="edit-calendar" />
                </IconButton>
              </div>
              <input className={styles.albumTitleInput} type="text" {...register("album.name")} placeholder="新規アルバム" />
              <div style={{ height: "4rem" }} />
            </div>
          </div>
          <div>
            <div className={styles.albumPhotoListHeader}>
              <span>画像 {newItems.length}枚</span>
            </div>
            <ImageGridList.Root
              className={styles.albumPhotoListBody}
              selectedKeys={selection}
              onSelectionChange={setSelection}
            >
              {newItems.map(item => (
                <ImageGridList.Item id={item.fileHash} href={item.src} target="_blank" key={item.fileHash}>
                  <img src={item.src} alt="" />
                </ImageGridList.Item>
              ))}
            </ImageGridList.Root>
          </div>
          <input type="file" accept="image/*" multiple {...register("files")} style={{ display: "none" }} />
        </form>
        <FilePickerButton onChange={handleChange} />
        <RangeCalendar value={dateRange} onSubmit={handleRangeCalendarDialogSubmit} ref={rangeCalendarDialogRef} />
      </main>
    </div>
  )
}