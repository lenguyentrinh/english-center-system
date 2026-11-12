import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  // build: {
  //    sourcemap: true,
  //   minify: "terser",
  //   manulChunks: (id) => {
  //     if (id.includes("")) {
  //       return id.toString().split("node_modules/")[1].split("/")[0].toString();
  //     }, 
  // },
  // Same-origin /api in dev (set VITE_API_BASE_URL=/api) so cookies behave like behind a reverse proxy.
  server: {
    proxy: {
      "/api": { target: "http://localhost:8080", changeOrigin: true },
    },
  },
});
