import Sqids from "sqids"

const albumSqids = new Sqids({ minLength: 10, alphabet: import.meta.env.VITE_SQUIDS_ALBUM_ID_SEED })
const photoSqids = new Sqids({ minLength: 10, alphabet: import.meta.env.VITE_SQUIDS_PHOTO_ID_SEED })

const SQIDS_ALBUM_ID = 1
const SQIDS_PHOTO_ID = 2

export function encodeAlbumId(id: number) {
  return albumSqids.encode([ SQIDS_ALBUM_ID, id ])
}

export function decodeAlbumId(id: string) {
  return albumSqids.decode(id)[1]
}

export function encodePhotoId(id: number) {
  return photoSqids.encode([ SQIDS_PHOTO_ID, id ])
}

export function decodePhotoId(id: string) {
  return photoSqids.decode(id)[1]
}