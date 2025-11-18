import * as v from "valibot"

export const LogoutActionSchema = v.object({
  action: v.literal("logout")
})