# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json pnpm-lock.yaml* ./
RUN npm install -g pnpm@10.13.1 && pnpm install --frozen-lockfile

COPY . .
RUN npx prisma generate
RUN pnpm run build || npm run build

# Stage 2: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

EXPOSE 3000

# Run migrations, seeding, then start NestJS application
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node dist/src/main.js"]