# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

AlgoMaster AI is an interactive single-page app for learning Data Structures and Algorithms, with AI-powered tutoring (Gemini), algorithm visualizers, and an in-browser coding practice arena. It is a Google AI Studio app — `package.json` is named `react-example` but the product is AlgoMaster AI (see `metadata.json`).

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Vite dev server (client) on port 3000, host 0.0.0.0
npm run dev:server   # Backend API server with watch (tsx watch server/index.ts) on port 3001
npm run server       # Backend API server, no watch
npm run start        # Production: build the SPA, then serve dist/ + /api from the backend
npm run build        # Production build to dist/
npm run preview      # Preview the production build
npm run lint         # Type-check only: tsc --noEmit
npm run lint:es      # ESLint (flat config in eslint.config.js)
npm test             # Run the Vitest suite once
npm run test:watch   # Vitest in watch mode
npm run clean        # rm -rf dist
```

For full local development with AI features you need **both** `npm run dev` (client) and `npm run dev:server` (backend) running — Vite proxies `/api` to the backend. To run a single test: `npx vitest run src/lib/utils.test.ts` (or `npx vitest <pattern>`).

## Architecture

A **React SPA backed by a thin Express server**. `src/main.tsx` mounts `App`, and `App.tsx` defines all routing via `react-router-dom` v7 `BrowserRouter`. The server (`server/index.ts`) exists to keep the Gemini API key off the client and to serve the built SPA in production. Note: `better-sqlite3` is still a listed dependency but is **not used** — there is no database yet.

### Routing (`src/App.tsx`)
All routes nest under `Layout`:
- `/` → `Dashboard`
- `/curriculum` → `Curriculum`
- `/practice` → `Practice`
- `/topic/:topicId` → `TopicDetail` (the core learning screen)

`src/components/Layout.tsx` is the persistent shell (collapsible sidebar + header + `<Outlet />`).

### Topic catalog (`src/lib/data.ts`)
`TOPICS` is the single source of truth for all learning content — an array of `Topic` objects (`id`, `title`, `description`, `category`, `icon`). Dashboard, Curriculum, Practice, and TopicDetail all iterate over this array. **To add a learning topic, add an entry here**; pages pick it up automatically. `category` is one of `'basics' | 'data-structures' | 'algorithms' | 'advanced'`.

### AI integration — client ↔ server split
- **Client** (`src/lib/gemini.ts`): `generateExplanation` and `checkSolution` are thin `fetch` wrappers that POST to `/api/explain` and `/api/review`. They **throw on failure** so callers can render error states and offer retry (do not expect a fallback string).
- **Server** (`server/index.ts`): holds `GEMINI_API_KEY`, calls `@google/genai`, and owns the prompts. Model ids are centralized as `FLASH_MODEL` (`gemini-3-flash-preview`, used for explanations) and `PRO_MODEL` (`gemini-3.1-pro-preview`, used for code review) — **update model ids here**. Returns `503` if the key is unset, `400` on bad input, `502` on upstream errors.
- **Dev wiring**: `vite.config.ts` proxies `/api` → `API_PROXY_TARGET` (default `http://localhost:3001`). In production the same Express server serves `dist/` and the API.

### TopicDetail — the central screen (`src/pages/TopicDetail.tsx`)
Resolves the topic from `TOPICS` by `:topicId` and renders three tabs:
- **Theory** — `loadExplanation` serves a cached lesson from localStorage (`algomaster:theory:<id>`) or calls Gemini, caching the result. Has loading / error (with a "Try again" button) / content states.
- **Visualize** — dispatches by topic id: `sorting` → `SortingVisualizer`, `graphs`/`searching` → `PathfindingVisualizer`, otherwise a "coming soon" placeholder.
- **Practice** — renders `ProblemRunner`.
- A "Mark complete" toggle in the header drives completion state.

### Persistence (`src/lib/useLocalStorage.ts`, `src/lib/progress.ts`)
- `useLocalStorage<T>(key, initial)` — a `useState`-like hook backed by localStorage with guarded reads/writes; it stays in sync across hook instances in the same tab (a custom `local-storage` event) and across tabs (native `storage` event).
- `useCompletedTopics()` (built on the hook, key `algomaster:completed-topics`) tracks completed topic ids; consumed by the Dashboard progress stats/bar and the TopicDetail toggle.
- Editor code is persisted per topic (`algomaster:code:<title>`); AI lessons are cached as above.

### ProblemRunner (`src/components/ProblemRunner.tsx`)
In-browser playground using `@monaco-editor/react`.
- **Code runs in a Web Worker** (`src/lib/codeRunner.worker.ts`), instantiated via `new Worker(new URL('../lib/codeRunner.worker.ts', import.meta.url), { type: 'module' })`. The worker shadows `console.*` to capture output; the main thread enforces a `EXECUTION_TIMEOUT_MS` (3s) and terminates the worker on timeout, so infinite loops can't freeze the UI.
- **Only JavaScript is runnable** in-browser; the language selector also offers TS/Python/Java/C++ for the "AI Review" path (Run is disabled for non-JS).

### Visualizers (`src/components/visualizers/`)
Self-contained, state-driven animations sharing a common pattern: an `async` algorithm function with `await sleep(ms)` between steps, and a `useRef` "stop" flag checked inside the loop to interrupt a running animation. `SortingVisualizer` uses `motion/react`; `PathfindingVisualizer` builds a grid of `Node` objects and supports mouse-drawing walls/start/end.

## Conventions

- **Path alias:** import from `src/` as `@/...` (configured in `tsconfig.json`, `vite.config.ts`, and `vitest.config.ts`). Use it for cross-directory imports.
- **Styling:** Tailwind CSS **v4** via the `@tailwindcss/vite` plugin. There is **no `tailwind.config.js`** — config lives in `src/index.css` (`@import "tailwindcss"`, `@plugin "@tailwindcss/typography"`, and a `custom-scrollbar` utility). Merge conditional classes with the `cn()` helper from `@/lib/utils` (clsx + tailwind-merge).
- **Design language:** dark theme — `neutral-900/950` backgrounds, `indigo-500/600` accents, `emerald-*` for completion/success, `red-400` for errors. Match existing classnames when adding UI.
- **Icons:** `lucide-react`. **Markdown:** `react-markdown` styled with Tailwind Typography `prose prose-invert` classes.
- **Testing:** Vitest with the `jsdom` environment and globals enabled, but tests **import `describe`/`it`/`expect` explicitly** from `vitest`. Tests are colocated as `*.test.ts` next to the code (see `src/lib/*.test.ts`). Hook tests use `renderHook`/`act` from `@testing-library/react`.
- **Linting:** `npm run lint` (tsc) is the source-of-truth check and must stay clean. `npm run lint:es` (ESLint flat config) is advisory — it currently reports warnings (e.g. unused imports) but **zero errors**; keep it at zero errors.
- React 19 with the automatic JSX runtime.

## Environment & AI Studio specifics

- `GEMINI_API_KEY` is read **only by the backend server** — it is no longer injected into the client bundle. Copy `.env.example` to `.env` / `.env.local` and set it (plus optional `PORT`, `API_PROXY_TARGET`). `.env*` is git-ignored except `.env.example`.
- **Do not modify the `server.hmr` logic in `vite.config.ts`.** HMR is gated by the `DISABLE_HMR` env var; AI Studio disables file watching to prevent flicker during agent edits. (Adding to `server.proxy` is fine.)
