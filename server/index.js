import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import {
  extractReportFromImage,
  chatWithDakshin,
  formatAnalysis,
} from "./geminiService.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Configure Multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
});

// API Routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    app: "ActiveLife Wellness Assistant AI",
    version: "1.0.0",
    geminiEnabled: Boolean(process.env.GEMINI_API_KEY),
    supabaseEnabled: Boolean(process.env.VITE_SUPABASE_URL),
  });
});

// 1. Analyze Report from uploaded image (OCR via Gemini Vision)
app.post("/api/analyze-report", upload.single("image"), async (req, res) => {
  try {
    const age = Number(req.body.age) || 30;
    const gender = req.body.gender || "female";

    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded." });
    }

    const result = await extractReportFromImage(
      req.file.buffer,
      req.file.mimetype,
      age,
      gender
    );

    // Attach data preview url for UI
    const base64 = req.file.buffer.toString("base64");
    result.imageUrl = `data:${req.file.mimetype};base64,${base64}`;

    res.json(result);
  } catch (err) {
    console.error("Error analyzing report image:", err);
    res.status(500).json({ error: "Failed to analyze report image." });
  }
});

// 2. Analyze Report from manual input values
app.post("/api/analyze-values", (req, res) => {
  try {
    const values = req.body;
    const result = formatAnalysis(values);
    res.json(result);
  } catch (err) {
    console.error("Error analyzing values:", err);
    res.status(500).json({ error: "Failed to analyze values." });
  }
});

// 3. Dakshin Multilingual Chat (English, Telugu, Hindi, Tamil)
app.post("/api/chat", async (req, res) => {
  try {
    const { message, language = "en", reportContext } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const reply = await chatWithDakshin(message, language, reportContext);
    res.json({ reply });
  } catch (err) {
    console.error("Error in Dakshin chat:", err);
    res.status(500).json({ error: "Chat service error." });
  }
});

// 4. Natural Voice TTS Stream (Telugu, Hindi, English Female Voices)
app.get("/api/tts", async (req, res) => {
  try {
    const text = req.query.q || "";
    const lang = req.query.tl || "te";
    if (!text) {
      return res.status(400).send("Missing parameter 'q'");
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
    res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error("TTS endpoint error:", err);
    res.status(500).send("TTS error");
  }
});

// Serve frontend static files in production
const distPath = path.resolve(__dirname, "../dist");
app.use(express.static(distPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"), (err) => {
    if (err) {
      res.send("ActiveLife Wellness API Server running. Start Vite dev server for frontend.");
    }
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`=======================================================`);
  console.log(`  ActiveLife Wellness Backend running on http://localhost:${PORT}`);
  console.log(`=======================================================`);
});

export default app;
