export default function capitalize(text: string) {
  return text.replace(/^./, str => str.toUpperCase())
}