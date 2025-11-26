import { glob, readFile } from "node:fs/promises"
import { beforeAll, afterAll } from "vitest"
import { Miniflare } from "miniflare"

declare global {
  var worker: Miniflare
  var db: D1Database
}

beforeAll(async () => {
  const worker = new Miniflare({
    script: `
      export default {
        async fetch(request, env, ctx) {
          return new Response("Hello Miniflare!");
        }
      }
    `,
    modules: true,
    r2Buckets: [ "BUCKET" ],
    d1Databases: [ "DB" ]
  })
  await worker.ready

  const db = await worker.getD1Database("DB")

  for await (const sqlFile of glob("**/*.sql")) {
    const rawSql = await readFile(sqlFile, { encoding: "utf8" })
    const sqls = rawSql.split("--> statement-breakpoint\n").map(sql => sql.replaceAll("\n", "").trim())

    for (const sql of sqls) {
      await db.exec(sql)
    }
  }

  globalThis.worker = worker
  globalThis.db = db
})

afterAll(async () => {
  await globalThis.worker.dispose()
})