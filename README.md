# DAKSHIN-AI

## Body report OCR

Run `npm run dev` from this folder to start both the frontend and backend.

## Supabase setup

1. Copy `.env.example` to `.env`.
2. Set `VITE_SUPABASE_URL` and `SUPABASE_URL` to your Supabase project URL.
3. Set `VITE_SUPABASE_ANON_KEY` and `SUPABASE_PUBLISHABLE_KEY` to the project's
   publishable key.
4. Create a new Supabase secret key after revoking any secret key shared in chat.
   Store it only as `SUPABASE_SECRET_KEY` in `.env`; never use a `VITE_` prefix.
5. Run `supabase/migrations/202611020001_create_health_reports.sql` in the
   Supabase SQL Editor.

Authenticated report list, save, and delete requests go through the Express API.
The server validates each Supabase access token and scopes every database
operation to that authenticated user. Row Level Security is enabled, and the
secret key remains server-side.

## Optional image OCR

Set `GEMINI_API_KEY` in `.env` to enable Gemini Vision extraction. Without it,
image OCR reports a configuration error and manual measurement entry remains
available. Uploaded photos are used for extraction but are not stored with
saved measurements.