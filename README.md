<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/0a58c659-ca27-4cc0-888b-bd27f07f91b9

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and set your `GEMINI_API_KEY` (used by the backend server, not the browser)
3. Run the app for development (two processes):
   - `npm run dev` — Vite client on port 3000
   - `npm run dev:server` — backend API on port 3001 (Vite proxies `/api` to it)

   Or run a production-like build that serves the client and API together:
   `npm run start`
