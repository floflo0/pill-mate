import { config } from "dotenv";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

config({ path: "../.env" });

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const port = parseInt(process.env.PORT || "8099", 10);

  return {
    base:
      command === "serve"
        ? `/api/hassio_ingress/${process.env.ADDON_ID}`
        : "./",
    plugins: [react()],
    server: {
      strictPort: true,
      host: "0.0.0.0",
      port: port,
      hmr: {
        port: port,
      },
    },
  };
});
