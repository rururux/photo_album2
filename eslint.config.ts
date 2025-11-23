import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";
import importPlugin from "eslint-plugin-import"

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js },
    extends: [ "js/recommended" ],
    languageOptions: { globals: {...globals.browser, ...globals.node} }
  },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat["jsx-runtime"],
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript
    ],
    rules: {
      "import/order": "warn"
    }
  },
  {
    settings: {
      react: {
        version: "19.1.1"
      },
      "import/resolver": {
        typescript: {
          project: "./tsconfig.*.json"
        },
        node: true
      }
    }
  }
])
