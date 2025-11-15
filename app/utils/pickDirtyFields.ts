import { flattenObject } from "es-toolkit/object"
import { pick } from "es-toolkit/compat"

type DirtyFields<T extends Record<string, unknown>> = {
  [ key in keyof T ]?: (
    T[key] extends Record<string, unknown>
      ? DirtyFields<T[key]>
      : T[key] extends Array<unknown>
        ? T[key] extends Array<Record<string, unknown>>
          ? DirtyFields<T[key][number]>[]
          : boolean[]
        : boolean
  )
}

export function pickDirtyfields<T extends Record<string, unknown>>(data: T, dirtyFields: DirtyFields<T>) {
  const dirtyFieldsKeys = Object.keys(flattenObject(dirtyFields))
  const dirtyFieldsWithValue = pick(data, ...dirtyFieldsKeys)

  return dirtyFieldsWithValue
}
