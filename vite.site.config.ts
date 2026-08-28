import { defineConfig } from "vite";

export default defineConfig({
  root: "site",
  publicDir: "../public",
  build: {
    outDir: "../dist/site",
    emptyOutDir: true,
    target: "es2022"
  },
  server: { port: 4173, strictPort: true }
});
