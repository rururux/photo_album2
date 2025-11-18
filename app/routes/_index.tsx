import type { Route } from "./+types/_index"
import { redirect } from "react-router"

export function loader({}: Route.ClientLoaderArgs) {
  return redirect("/login")
}
