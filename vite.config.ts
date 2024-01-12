import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/

const path = require("path");
const entryFile = path.resolve(__dirname, "client", "src", "index.tsx");
const outputDir = path.resolve(__dirname, "client", "dist");

export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    port: 5050,
    proxy: {
      "/api": "http://localhost:3000",
      "/socket.io/*": {
        target: "http://localhost:3000",
        ws: true,
      },
    },
  },
  build: {
    rollupOptions: {
      input: entryFile, // Update this path based on your project structure
      output: { entryFileNames: "bundle.js", format: "commonjs", dir: outputDir },
    },
    chunkSizeWarningLimit: 1000,
    modulePreload: { polyfill: true },
  },
  resolve: {
    extensions: ["*", ".js", ".jsx", ".ts", ".tsx"],
  },
});
