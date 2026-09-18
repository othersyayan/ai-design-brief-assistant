# AI Design Brief Assistant Frontend

React 19 and Vite frontend for the automotive design brief workspace. It
provides login, project creation and navigation, project context, persisted chat
history, progressive Gemini responses, decision summaries, and conversation
reset.

## Local Setup

Requirements:

- Node.js 20+
- pnpm
- The backend running on `http://localhost:3000`

From this directory:

```bash
pnpm install
pnpm dev
```

Open `http://localhost:5173`. `vite.config.ts` proxies `/api` requests to the
local backend, so the browser uses the same API paths as the Docker/Nginx
deployment.

Sign in with the seeded account:

```text
Email: test@lmesh.eu
Password: password
```

## Frontend Structure

- `src/routes/index.tsx` contains login, project listing, and project creation.
- `src/routes/projects/$projectId.tsx` loads project context and history and
  exposes summary/reset actions.
- `src/hooks/useChatStream.ts` consumes authenticated SSE responses using
  `fetch()` and `ReadableStream`.
- `src/store/useChatStore.ts` holds transient messages, streaming content, and
  streaming state.
- `src/lib/utils.ts` provides typed API request and response helpers.
- `src/route-tree.ts` registers the manual TanStack Router tree used by
  `src/main.tsx`.

The API contract is served by the backend. Chat streaming uses
`GET /api/v1/projects-ai/:projectId/chat?message=...`, with the JWT sent in the
`Authorization` header.

## Validate and Build

```bash
pnpm lint
pnpm build
pnpm preview
```

The production Docker image builds the Vite bundle and serves it with Nginx.
Nginx serves the SPA fallback and proxies `/api/` to the Compose `backend`
service with buffering disabled for SSE.

## Docker

Run the complete stack from the repository root:

```bash
docker compose up --build
```

Open `http://localhost`. See the root [README](../README.md) for environment
variables, PostgreSQL port overrides, seed data, and service logs.
