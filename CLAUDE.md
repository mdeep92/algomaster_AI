# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

AlgoMaster AI is an interactive single-page app for learning Data Structures and Algorithms, with AI-powered tutoring (Gemini), algorithm visualizers, and an in-browser coding practice arena. It is a Google AI Studio app — `package.json` is named `react-example` but the product is AlgoMaster AI (see `metadata.json`).

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Vite dev server on port 3000, host 0.0.0.0
npm run build        # Production build to dist/
npm run preview      # Preview the production build
npm run lint         # Type-check only: tsc --noEmit (there is no ESLint)
npm run clean        # rm -rf dist
```

There is **no test framework** configured — no test runner, no test files. `npm run lint` (a TypeScript no-emit check) is the only automated verification. Run it after changes.

## Architecture

Pure **client-side SPA** — there is no running backend. `react-dom` mounts `App` (`src/main.tsx`), and `App.tsx` defines all routing via `react-router-dom` v7 `BrowserRouter`. Note: `express` and `better-sqlite3` are listed in `package.json` dependencies but **no server code exists yet**; ignore them unless you are deliberately adding a backend.

### Routing (`src/App.tsx`)
All routes nest under `Layout`:
- `/` → `Dashboard`
- `/curriculum` → `Curriculum`
- `/practice` → `Practice`
- `/topic/:topicId` → `TopicDetail` (the core learning screen)

`src/components/Layout.tsx` is the persistent shell (collapsible sidebar + header + `<Outlet />`).

### Topic catalog (`src/lib/data.ts`)
`TOPICS` is the single source of truth for all learning content — an array of `Topic` objects (`id`, `title`, `description`, `category`, `icon`). Dashboard, Curriculum, Practice, and TopicDetail all iterate over this array. **To add a learning topic, add an entry here**; pages pick it up automatically. `category` is one of `'basics' | 'data-structures' | 'algorithms' | 'advanced'`.

### TopicDetail — the central screen (`src/pages/TopicDetail.tsx`)
Resolves the topic from `TOPICS` by `:topicId` and renders three tabs:
- **Theory** — lazily calls `generateExplanation` (Gemini) on first view, renders the Markdown response via `react-markdown` with extensive Tailwind `prose-*` styling.
- **Visualize** — dispatches by topic id: `sorting` → `SortingVisualizer`, `graphs`/`searching` → `PathfindingVisualizer`, otherwise a "coming soon" placeholder.
- **Practice** — renders `ProblemRunner`.

### AI integration (`src/lib/gemini.ts`)
All Gemini calls go through this module using `@google/genai` with a **lazy singleton client** (`getAIClient`). Two exported functions:
- `generateExplanation(topic, context?)` — uses model `gemini-3-flash-preview`.
- `checkSolution(problem, code, language)` — uses `gemini-3.1-pro-preview` (chosen for stronger code reasoning).

Functions return user-facing fallback strings on missing key / error rather than throwing. The API key is read from `process.env.GEMINI_API_KEY`, which Vite statically injects at build time (see below).

### Visualizers (`src/components/visualizers/`)
Self-contained, state-driven animations. They share a common pattern: an `async` algorithm function with `await sleep(ms)` between steps, and a `useRef` "stop" flag (e.g. `stopSortingRef`, `isRunningRef`) checked inside the loop to interrupt a running animation. `SortingVisualizer` uses `motion/react` for bar transitions; `PathfindingVisualizer` builds a grid of `Node` objects and supports mouse-drawing walls/start/end.

### ProblemRunner (`src/components/ProblemRunner.tsx`)
In-browser JS playground using `@monaco-editor/react`. **Executes user code via `new Function(code)`** while temporarily monkey-patching `console.log` to capture output — this is intentionally unsandboxed (a comment flags that production should use a Web Worker / iframe). The "AI Review" button sends code to `checkSolution`.

## Conventions

- **Path alias:** import from `src/` as `@/...` (configured in both `tsconfig.json` and `vite.config.ts`). Use it for cross-directory imports.
- **Styling:** Tailwind CSS **v4** via the `@tailwindcss/vite` plugin. There is **no `tailwind.config.js`** — config lives in `src/index.css` (`@import "tailwindcss"`, `@plugin "@tailwindcss/typography"`, and a `custom-scrollbar` utility). Merge conditional classes with the `cn()` helper from `@/lib/utils` (clsx + tailwind-merge).
- **Design language:** dark theme throughout — `neutral-900/950` backgrounds, `indigo-500/600` accents. Match existing classnames when adding UI.
- **Icons:** `lucide-react`.
- **Markdown rendering:** `react-markdown`, styled via Tailwind Typography `prose prose-invert` classes.
- React 19 with the automatic JSX runtime (no need to import React for JSX, though existing files do import it).

## Environment & AI Studio specifics

- Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY`. In AI Studio this is injected automatically from user secrets; locally it is wired into the client bundle by `vite.config.ts` via `define: { 'process.env.GEMINI_API_KEY': ... }`. `APP_URL` is also injected by AI Studio at runtime.
- **Do not modify the `server.hmr` logic in `vite.config.ts`.** HMR is gated by the `DISABLE_HMR` env var; AI Studio disables file watching to prevent flicker during agent edits.
- `.env*` files are git-ignored (except `.env.example`).
