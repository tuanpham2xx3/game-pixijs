import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  base: "/game-pixijs/",
  server: {
    port: 8000,
    open: true,
    hmr: true,
    watch: {
      usePolling: true
    }
  },
});

