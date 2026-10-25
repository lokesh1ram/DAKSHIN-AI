import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

function ttsApiPlugin() {
  return {
    name: "tts-api-middleware",
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url && req.url.startsWith("/api/tts")) {
          try {
            const parsedUrl = new URL(req.url, "http://localhost:5173");
            const text = parsedUrl.searchParams.get("q") || "";
            const lang = parsedUrl.searchParams.get("tl") || "te";
            if (!text) {
              res.statusCode = 400;
              return res.end("Missing parameter 'q'");
            }
            const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(
              lang
            )}&client=tw-ob&q=${encodeURIComponent(text)}`;
            const response = await fetch(googleUrl, {
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              },
            });
            if (!response.ok) throw new Error(`Google TTS status: ${response.status}`);
            res.setHeader("Content-Type", "audio/mpeg");
            res.setHeader("Cache-Control", "public, max-age=86400");
            res.setHeader("Access-Control-Allow-Origin", "*");
            const arrayBuffer = await response.arrayBuffer();
            return res.end(Buffer.from(arrayBuffer));
          } catch (err) {
            console.warn("TTS middleware error:", err);
            res.statusCode = 500;
            return res.end("TTS fetch failed");
          }
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), ttsApiPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
