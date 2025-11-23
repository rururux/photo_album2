import { defineConfig } from "vitest/config"
import { playwright } from "@vitest/browser-playwright"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [
        { browser: "chromium", setupFiles: "./test/setup.ts" },
      ],
    }
  },
  plugins: [
    tsconfigPaths()
  ]
})