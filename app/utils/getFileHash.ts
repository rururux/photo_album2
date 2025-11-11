const fileCacheMap = new WeakMap<File, string>()
// https 環境でないと crypto の一部機能が使えない為、
// 開発時はこれで代用
let index = 0

// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#converting_a_digest_to_a_hex_string
export default async function getFileHash(file: File) {
  const cache = fileCacheMap.get(file)

  if (cache) return cache

  try {
    const hashBuffer = await crypto.subtle.digest("SHA-256", await file.arrayBuffer())
    const hashHex = Array.from(new Uint8Array(hashBuffer), b => b.toString(16).padStart(2, "0")).join("")

    fileCacheMap.set(file, hashHex)

    return hashHex
  } catch {
    return `file-name-${index++}`
  }
}