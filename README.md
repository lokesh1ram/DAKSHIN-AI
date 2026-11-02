# DAKSHIN-AI

## Body report OCR

Photo extraction uses Gemini Vision through the backend. Set `GEMINI_API_KEY` in
`.env` (copy `.env.example` and add your key), then run the backend with
`npm run server`. Keep the key server-side; do not expose it through a `VITE_`
variable. Without the key, image OCR reports a configuration error and manual
measurement entry remains available. Uploaded photos are used for extraction
but are not stored with the saved measurements.