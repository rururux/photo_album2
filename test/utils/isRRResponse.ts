export function isRRResponse(res: unknown) {
  return res instanceof Response || (typeof res === "object" && res !== null && "type" in res && "data" in res)
}