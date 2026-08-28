import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist/app",
    emptyOutDir: true,
    target: "es2022"
  },
  server: { port: 1420, strictPort: true },
  clearScreen: false
});
