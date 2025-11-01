import type { Config } from "drizzle-kit";

export default {
  schema: "./workers/lib/db/schema",
  out: "./workers/lib/db/drizzle",
  dialect: "sqlite",
  casing: "snake_case"
} satisfies Config