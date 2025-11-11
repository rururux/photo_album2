import { reactRouter } from "@react-router/dev/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import localesPlugin from "@react-aria/optimize-locales-plugin";

export default defineConfig({
  plugins: [
    // Workers に乗せるファイルのサイズには効果ないっぽい、クライアントに渡るデータサイズを小さくするとのこと
    // https://react-spectrum.adobe.com/react-aria/ssr.html
    {...localesPlugin.vite({ locales: [] }), enforce: "pre" },
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
  ],
});
