import { defineConfig } from "vitest/config"
import { playwright } from "@vitest/browser-playwright"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "components",
          include: [ "app/**/components/**/index.test.tsx" ],
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [
              { browser: "chromium", setupFiles: "./test/setup.ts" },
            ],
            connectTimeout: 10000,
          }
        }
      },
      {
        extends: true,
        test: {
          name: "route:client",
          include: [ "app/routes/**/route.client.test.tsx" ],
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [
              { browser: "chromium", setupFiles: "./test/setup.ts" },
            ],
            connectTimeout: 10000,
          },
        }
      },
      {
        extends: true,
        test: {
          name: "route:server",
          include: [ "app/routes/**/route.server.test.tsx" ],
          env: {
            VITE_GUEST_LOGIN_PASSWORD: "PASSWORD0123"
          },
          setupFiles: "./test/serverSetup.ts"
        }
      }
    ]
  },
  plugins: [
    tsconfigPaths()
  ]
})