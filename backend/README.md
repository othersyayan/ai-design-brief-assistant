# AI Design Brief Assistant Backend

NestJS 11 API for authentication, design project management, persisted conversations, Gemini-powered CMF assistance, summaries, and SSE streaming.

## Local Setup

Requirements:

- Node.js 20+
- pnpm
- PostgreSQL 16+
- A Google Gemini API key for chat and summary features

From this directory:

```bash
pnpm install
cp .env.example .env
```

Update `.env` with the local PostgreSQL connection string, a JWT secret, and `GEMINI_API_KEY`. Then generate the Prisma client, apply migrations, and seed the demo data:

```bash
pnpm prisma:generate
pnpm db:migrate
pnpm db:seed
pnpm start:dev
```

The API runs on `http://localhost:3000` by default. The server binds to `0.0.0.0` so it also works inside Docker. Swagger is available at `http://localhost:3000/api/docs`.

The seeded account is:

```text
Email: test@lmesh.eu
Password: password
```

The seed is idempotent for the demo user and projects, so restarting the Docker service does not delete existing conversations.

## API Areas

- `POST /api/v1/auth/login` authenticates the seeded user and returns a JWT.
- `/api/v1/projects` provides authenticated project CRUD and project history.
- `GET /api/v1/projects-ai/:projectId/chat?message=...` streams Gemini responses as SSE.
- `POST /api/v1/projects-ai/:projectId/summarize` generates a design decision summary.
- `DELETE /api/v1/projects-ai/:projectId/messages` resets conversation messages without deleting the project.

Project and AI endpoints require `Authorization: Bearer <token>`. Prisma migrations and the seed command are configured in `prisma.config.ts`, which is also copied into the production Docker image.

## Tests and Build

```bash
pnpm build
pnpm test --runInBand
pnpm test:e2e
pnpm test:cov
```

## Docker

Run the complete PostgreSQL, backend, and frontend stack from the repository root:

```bash
docker compose up --build
```

See the root [README](../README.md) for Compose environment variables, port overrides, container logs, and the frontend URL.
