# Stage 1: Build Vite React App
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json pnpm-lock.yaml* ./
RUN npm install -g pnpm@10.13.1 && pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build || npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]