import { defineConfig } from "vitest/config"
import { playwright } from "@vitest/browser-playwright"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        test: {
          include: [ "app/**/route.client.test.tsx" ],
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [
              { browser: "chromium", setupFiles: "./test/setup.ts" },
            ],
            connectTimeout: 10000,
          },
        }
      }
    ]
  },
  plugins: [
    tsconfigPaths()
  ]
})