import * as v from "valibot"

const DateTimeFormatPartObject = v.object({
  year: v.string(),
  month: v.string(),
  day: v.string()
})
const dateTimeFormatter = new Intl.DateTimeFormat("ja", { year: "numeric", month: "2-digit", day: "2-digit" })

function createDateFormattedPartsObject(parts: Intl.DateTimeFormatPart[]) {
  const partsObject = parts.reduce((prv, cur) => ({ ...prv, [cur.type]: cur.value }), {} as Record<string, string>)

  v.assert(DateTimeFormatPartObject, partsObject)

  return partsObject
}

type FormatRelativeDateOptions = {
  minimumUnit: "year" | "month" | "day"
}

export default function formatRelativeDate(targetDate: string, baseDate: string, options: FormatRelativeDateOptions = { minimumUnit: "month" }) {
  const baseDateFormattedParts = dateTimeFormatter.formatToParts(new Date(baseDate.replaceAll("/", "-")))
  const targetDateFormattedParts = dateTimeFormatter.formatToParts(new Date(targetDate.replaceAll("/", "-")))
  const baseDateFormattedPartsObject = createDateFormattedPartsObject(baseDateFormattedParts)
  const targetDateFormattedPartsObject = createDateFormattedPartsObject(targetDateFormattedParts)

  let result = ""

  if (options.minimumUnit === "year" || baseDateFormattedPartsObject.year !== targetDateFormattedPartsObject.year) {
    result = `${targetDateFormattedPartsObject.year}/${targetDateFormattedPartsObject.month}/${targetDateFormattedPartsObject.day}`

    return result
  }

  if (options.minimumUnit === "month" || baseDateFormattedPartsObject.month !== targetDateFormattedPartsObject.month) {
    result += targetDateFormattedPartsObject.month + "/"
  }

  result += targetDateFormattedPartsObject.day

  return result
}