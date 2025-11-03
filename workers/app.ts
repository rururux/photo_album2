import { initAuth } from "./lib/auth"
import { createRequestHandler } from "react-router";
import schemas from "./lib/db/schema"
import { drizzle } from "drizzle-orm/d1"

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
  return drizzle(d1, { schema: schemas })
}

export default {
  async fetch(request, env, ctx) {
    const db = initDrizzle(env.DB)
    // @ts-expect-error OMG
    const auth = initAuth(db, env.OAUTH_LINE_CLIENT_SECRET)

    return requestHandler(request, {
      cloudflare: { env, ctx },
      auth, db
    });
  },
} satisfies ExportedHandler<Env>;
