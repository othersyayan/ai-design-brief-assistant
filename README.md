# AI Design Brief Assistant

An automotive design workspace where designers can create projects, discuss CMF direction with a Gemini-powered assistant, summarize decisions, and reset a conversation without deleting the project.

## Run with Docker Compose

Requirements:

- Docker Desktop with Docker Compose
- A Gemini API key

From the repository root:

```bash
cp backend/.env.example .env
```

Edit `.env` and set `GEMINI_API_KEY` to a valid Google Gemini API key. The default Compose configuration uses PostgreSQL credentials that are suitable for local evaluation.

If port `5432` is already used by a local PostgreSQL installation, set `POSTGRES_PORT=5433` in `.env`; the containers continue to use PostgreSQL internally on port `5432`.

Start the complete stack, including database migrations and seed data:

```bash
docker compose up --build
```

Open the application at [http://localhost](http://localhost). The backend API is available at `http://localhost:3000`, and Swagger documentation is available at `http://localhost:3000/api/docs`.

The backend container waits for PostgreSQL, applies committed Prisma migrations, seeds the demo account and projects, and then starts NestJS. The seeded login is:

```text
Email: test@lmesh.eu
Password: password
```

The frontend Nginx server proxies `/api/*` requests and the SSE chat stream to the backend service. This keeps the browser on one origin and avoids CORS or direct container-network concerns.

Stop the services with:

```bash
docker compose down
```

To remove the local PostgreSQL data volume and recreate the seed data from scratch:

```bash
docker compose down -v
docker compose up --build
```

## Run Services Locally

For development without the frontend container, start PostgreSQL separately and use the backend and frontend package scripts:

```bash
cd backend
pnpm install
pnpm prisma:generate
pnpm db:migrate
pnpm db:seed
pnpm start:dev
```

In another terminal:

```bash
cd frontend
pnpm install
pnpm dev
```

The Vite development server proxies `/api` to `http://localhost:3000`.

## Useful Commands

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
```

The backend expects `DATABASE_URL`, `JWT_SECRET`, `PORT`, and `GEMINI_API_KEY`. See [backend/.env.example](backend/.env.example) for the available variables.
