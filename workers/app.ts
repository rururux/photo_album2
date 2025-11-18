import { initAuth } from "./lib/auth"
import { createRequestHandler } from "react-router";
import schemas from "./lib/db/schema"
import { drizzle } from "drizzle-orm/d1"
import { resetGuestData } from "./lib/db/reset"

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
    auth: ReturnType<typeof initAuth>,
    db: ReturnType<typeof initDrizzle>
  }
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

function initDrizzle(d1: D1Database) {
  return drizzle(d1, { schema: schemas, casing: "snake_case" })
}

let authCache: ReturnType<typeof initAuth> | null = null
let dbCache: ReturnType<typeof initDrizzle> | null = null

export default {
  async fetch(request, env, ctx) {
    const db = initDrizzle(env.DB)
    return requestHandler(request, {
      cloudflare: { env, ctx },
      get auth() {
        // @ts-expect-error OMG
        authCache ??= initAuth(db, env.OAUTH_LINE_CLIENT_SECRET)

        return authCache
      },
      get db() {
        dbCache ??= initDrizzle(env.DB)

        return dbCache
      }
    });
  },

  async scheduled(_controller, env) {
    const db = initDrizzle(env.DB)

    await resetGuestData(db, env.BUCKET)
  }
} satisfies ExportedHandler<Env>;
